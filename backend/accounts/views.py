from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model  # เปลี่ยนจาก direct import
from .serializers import RegisterSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView as BaseTokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# เพิ่ม import สำหรับ logging system และ guest tracking
from .models import UserActivityLog
from .utils import (
    check_export_permission, 
    increment_export_count, 
    get_export_limits_info,
    format_export_details
)

# ใช้ get_user_model() แทน direct import
User = get_user_model()

# ฟังก์ชันช่วยเหลือสำหรับ logging (ปรับใหม่)
def log_user_activity(user, action, request, details=None):
    """บันทึกการใช้งานของ user (แบบเรียบง่าย)"""
    UserActivityLog.objects.create(
        user=user,
        action=action,
        details=details
    )

# คลาสเดิมที่มีอยู่แล้ว - เพิ่ม logging เข้าไป
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def perform_create(self, serializer):
        """Override เพื่อเพิ่ม logging เมื่อสมัครสมาชิก"""
        user = serializer.save()
        # บันทึก log การสมัคร
        log_user_activity(user, 'register', self.request, 
                         details={
                             'email': user.email,
                             'user_type': user.user_type
                         })

class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "user_type": getattr(user, 'user_type', 'user'),  # เพิ่ม user_type
            "date_joined": user.date_joined,  # เพิ่มวันที่สมัคร
            "last_login": user.last_login,  # เพิ่มการ login ครั้งล่าสุด
            # 🔄 เพิ่มข้อมูล export limits
            "export_limits": get_export_limits_info(request)
        })

# เพิ่ม API views สำหรับ login/logout
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """API สำหรับ login"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'error': 'Username and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    if user:
        if user.is_active:
            login(request, user)
            # บันทึก log การ login
            log_user_activity(user, 'login', request)
            
            return Response({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'user_type': getattr(user, 'user_type', 'user'),
                    'last_login': user.last_login,
                    # 🔄 เพิ่มข้อมูล export limits
                    'export_limits': get_export_limits_info(request)
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Account is disabled'
            }, status=status.HTTP_401_UNAUTHORIZED)
    else:
        return Response({
            'error': 'Invalid username or password'
        }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """API สำหรับ logout"""
    if request.user.is_authenticated:
        # บันทึก log การ logout
        log_user_activity(request.user, 'logout', request)
        logout(request)
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    return Response({
        'error': 'Not authenticated'
    }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_activity_logs(request):
    """API สำหรับดู activity logs ของ user ปัจจุบัน"""
    logs = UserActivityLog.objects.filter(user=request.user)[:20]  # 20 รายการล่าสุด
    
    logs_data = []
    for log in logs:
        logs_data.append({
            'id': log.id,
            'action': log.action,
            'action_display': log.get_action_display(),
            'timestamp': log.timestamp,
            'formatted_timestamp': log.formatted_timestamp,
            'time_ago': log.time_ago,
            'details': log.details
        })
    
    return Response({
        'logs': logs_data,
        'total_count': UserActivityLog.objects.filter(user=request.user).count()
    }, status=status.HTTP_200_OK)

# 🆕 API สำหรับดู export limits (สำหรับ guest และ user)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_export_limits(request):
    """API สำหรับดูข้อมูล export limits"""
    limits_info = get_export_limits_info(request)
    return Response(limits_info, status=status.HTTP_200_OK)

# ✅ เพิ่ม API สำหรับบันทึก upload, conversion และ export
@api_view(['POST'])
@permission_classes([AllowAny])  # 🔄 เปลี่ยนเป็น AllowAny เพื่อรองรับ guest
def log_upload(request):
    """API สำหรับบันทึกการอัปโหลดภาพ (รองรับ guest)"""
    filename = request.data.get('filename')
    file_size = request.data.get('file_size')
    file_type = request.data.get('file_type')  # image/jpeg, image/png, etc.
    
    # บันทึก log เฉพาะ user ที่ login (guest ไม่บันทึก upload log)
    if request.user.is_authenticated:
        log_user_activity(request.user, 'upload_image', request, details={
            'filename': filename,
            'file_size': file_size,
            'file_type': file_type
        })
    
    return Response({
        'message': 'บันทึกการอัปโหลดเรียบร้อย'
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])  # 🔄 เปลี่ยนเป็น AllowAny เพื่อรองรับ guest
def log_conversion(request):
    """API สำหรับบันทึกการแปลงภาพ (รองรับ guest)"""
    filename = request.data.get('filename')
    file_size = request.data.get('file_size')
    
    # ⚠️ ตอนนี้การแปลงไม่มีขีดจำกัด - เฉพาะการส่งออกเท่านั้น
    # บันทึก log เฉพาะ user ที่ login
    if request.user.is_authenticated:
        # เก็บ conversion count เดิมไว้ (สำหรับสถิติ)
        request.user.increment_conversion_count()
        
        log_user_activity(request.user, 'convert_image', request, details={
            'filename': filename,
            'file_size': file_size,
            'remaining_conversions': request.user.get_remaining_conversions_today()
        })
    
    return Response({
        'message': 'บันทึกการแปลงเรียบร้อย'
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def log_export(request):
    """API สำหรับบันทึกการส่งออกไฟล์ (รองรับ guest + limits) - PNG ไม่นับ limit"""
    export_format = request.data.get('format')  # png, svg, pdf, eps
    filename = request.data.get('filename')
    guest_id = request.data.get('guest_id')  # จาก frontend (สำหรับ guest)
    
    if export_format not in ['png', 'svg', 'pdf', 'eps']:
        return Response({
            'error': 'รูปแบบไฟล์ไม่ถูกต้อง'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 🎯 PNG ไม่ต้องตรวจสอบ limit - ส่งออกได้ไม่จำกัด
    if export_format.lower() == 'png':
        # บันทึก log เฉพาะ user ที่ login (สำหรับสถิติ)
        if request.user.is_authenticated:
            log_user_activity(request.user, 'export_png', request, 
                             details=format_export_details(export_format, filename))
        
        return Response({
            'message': f'บันทึกการส่งออก {export_format.upper()} เรียบร้อย (ไม่นับ limit)',
            'remaining_exports': 'unlimited',  # PNG ไม่จำกัด
            'guest_id': guest_id,
            'format_exempt': True  # บอกว่าไฟล์นี้ไม่นับ limit
        }, status=status.HTTP_200_OK)
    
    # 🎯 สำหรับ SVG, PDF, EPS - ตรวจสอบ limit ตามปกติ
    can_export, remaining_count, returned_guest_id = check_export_permission(request)
    
    if not can_export:
        user_type = 'guest' if not request.user.is_authenticated else 'user'
        return Response({
            'error': f'เกินจำนวนการส่งออกที่อนุญาตต่อวัน',
            'remaining': remaining_count,
            'user_type': user_type,
            'guest_id': returned_guest_id
        }, status=status.HTTP_429_TOO_MANY_REQUESTS)
    
    # 🔄 เพิ่มจำนวนการส่งออก (ยกเว้น PNG)
    returned_guest_id = increment_export_count(request)
    
    # 📊 บันทึก log (เฉพาะ user ที่ login)
    if request.user.is_authenticated:
        log_user_activity(request.user, f'export_{export_format}', request, 
                         details=format_export_details(export_format, filename))
    
    # 📈 ดูจำนวนที่เหลือหลังจากส่งออก
    _, remaining_after, _ = check_export_permission(request)
    
    return Response({
        'message': f'บันทึกการส่งออก {export_format.upper()} เรียบร้อย',
        'remaining_exports': remaining_after,
        'guest_id': returned_guest_id  # ส่งกลับให้ frontend update LocalStorage
    }, status=status.HTTP_200_OK)

class CustomTokenObtainPairView(BaseTokenObtainPairView):
    """Custom JWT Token view ที่มี logging"""
    
    def post(self, request, *args, **kwargs):
        # เรียก parent method เพื่อ authenticate
        response = super().post(request, *args, **kwargs)
        
        # ถ้า login สำเร็จ (status 200) ให้บันทึก log
        if response.status_code == 200:
            # หา user จาก username ที่ส่งมา
            username = request.data.get('username')
            try:
                user = User.objects.get(username=username)  # ใช้ User ที่ import แล้ว
                # บันทึก log การ login
                log_user_activity(user, 'login', request, 
                                details={'login_method': 'JWT'})
                
                # 🔄 เพิ่มข้อมูล export limits ใน response
                if hasattr(response, 'data') and response.data:
                    response.data['export_limits'] = get_export_limits_info(request)
                    
            except User.DoesNotExist:
                pass
        
        return response

# Custom Logout สำหรับ JWT (เพิ่มเติม)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def jwt_logout_view(request):
    """JWT Logout with logging"""
    # บันทึก log การ logout
    log_user_activity(request.user, 'logout', request, 
                     details={'logout_method': 'JWT'})
    
    # JWT ไม่มีการ logout จริงๆ (token ยังใช้ได้จนหมดอายุ)
    # แต่สามารถบันทึก log ได้
    return Response({
        'message': 'Logout logged successfully'
    }, status=status.HTTP_200_OK)