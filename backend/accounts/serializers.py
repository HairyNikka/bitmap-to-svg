# backend/accounts/serializers.py - เพิ่ม admin serializers

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator

# ใช้ get_user_model() แทน direct import
User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    confirm_password = serializers.CharField(write_only=True, required=True)

    # เพิ่ม Security Questions Fields
    security_question_1 = serializers.CharField(required=False, allow_blank=True)
    security_answer_1 = serializers.CharField(required=False, allow_blank=True)
    security_question_2 = serializers.CharField(required=False, allow_blank=True)
    security_answer_2 = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'confirm_password',
                 'security_question_1', 'security_answer_1',  
                 'security_question_2', 'security_answer_2')

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "รหัสผ่านไม่ตรงกัน"})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        # แยก security questions ออกมา
        security_question_1 = validated_data.pop('security_question_1', '')
        security_answer_1 = validated_data.pop('security_answer_1', '')
        security_question_2 = validated_data.pop('security_question_2', '')
        security_answer_2 = validated_data.pop('security_answer_2', '')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
                # ตั้งคำถามความปลอดภัยถ้ามี
        if security_question_1 and security_answer_1 and security_question_2 and security_answer_2:
            user.set_security_questions(
                security_question_1, security_answer_1,
                security_question_2, security_answer_2
            )
            
        return user

# Serializer สำหรับ UserActivityLog
class UserActivityLogSerializer(serializers.ModelSerializer):
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_type = serializers.CharField(source='user.user_type', read_only=True)  
    formatted_timestamp = serializers.CharField(read_only=True)
    time_ago = serializers.CharField(read_only=True)
    
    class Meta:
        from .models import UserActivityLog
        model = UserActivityLog
        fields = [
            'id', 'user', 'user_username', 'action', 'action_display', 'user_type', 
            'timestamp', 'formatted_timestamp', 'time_ago', 'details'
        ]
        read_only_fields = ['timestamp']

#  User Serializer สำหรับ Admin (ข้อมูลครบถ้วน)
class UserSerializer(serializers.ModelSerializer):
    user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'user_type_display', 'total_conversions',
            'date_joined', 'last_login', 'is_active', 'is_staff', 'password'
        ]
        read_only_fields = ['date_joined', 'last_login', 'total_conversions']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
        # Validate email ตอน update
    def validate_email(self, value):
        """ตรวจสอบว่าอีเมลซ้ำหรือไม่"""
        # ถ้าเป็นการ update (มี instance)
        if self.instance:
            # เช็คว่ามีคนใช้อีเมลนี้แล้วหรือไม่ (ยกเว้นตัวเอง)
            if User.objects.filter(email=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("อีเมลนี้มีผู้ใช้งานแล้ว")
        else:
            # ถ้าเป็นการสร้างใหม่
            if User.objects.filter(email=value).exists():
                raise serializers.ValidationError("อีเมลนี้มีผู้ใช้งานแล้ว")
        return value

    def update(self, instance, validated_data):
        # จัดการ password แยก
        password = validated_data.pop('password', None)
        
        # อัพเดทฟิลด์อื่นๆ
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # ถ้ามีการเปลี่ยน password
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance

# Serializer สำหรับ Admin Dashboard
class AdminStatsSerializer(serializers.Serializer):
    """ไม่ต้องใช้ Model - เป็น serializer สำหรับ API response"""
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    total_conversions = serializers.IntegerField()
    conversions_today = serializers.IntegerField()

# User List Serializer (สำหรับ admin users list)
class UserListSerializer(serializers.ModelSerializer):
    """Serializer แบบย่อสำหรับ list view"""
    user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
    last_login_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'user_type', 'user_type_display',
            'date_joined', 'last_login', 'last_login_formatted', 'is_active',
            'daily_conversions_used', 'daily_conversion_limit'
        ]
    
    def get_last_login_formatted(self, obj):
        if obj.last_login:
            return obj.last_login.strftime('%d/%m/%Y %H:%M')
        return None