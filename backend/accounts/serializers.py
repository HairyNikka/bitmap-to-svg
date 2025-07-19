from rest_framework import serializers
from django.contrib.auth import get_user_model  # เปลี่ยนจาก direct import
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

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'confirm_password')

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "รหัสผ่านไม่ตรงกัน"})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

# เพิ่ม Serializer สำหรับ UserActivityLog
class UserActivityLogSerializer(serializers.ModelSerializer):
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        from .models import UserActivityLog
        model = UserActivityLog
        fields = [
            'id', 'user_username', 'action', 'action_display', 
            'timestamp', 'ip_address', 'user_agent', 'details'
        ]
        read_only_fields = ['timestamp']

# เพิ่ม Serializer สำหรับ User (ขยายจากเดิม)
class UserSerializer(serializers.ModelSerializer):
    activity_logs = UserActivityLogSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'daily_conversion_limit', 'daily_conversions_used',
            'date_joined', 'last_login', 'is_active', 'activity_logs'
        ]
        read_only_fields = ['date_joined', 'last_login']