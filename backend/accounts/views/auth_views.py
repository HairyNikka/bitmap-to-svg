# backend/accounts/views/auth_views.py
"""
Authentication & Basic User Operations
- User Registration
- Login/Logout (Session & JWT)
- User Information
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView as BaseTokenObtainPairView
from django.contrib.auth import authenticate, login, logout, get_user_model

# Import จาก app เดียวกัน
from ..serializers import RegisterSerializer
from ..models import UserActivityLog
from ..utils import get_export_limits_info

User = get_user_model()

def log_user_activity(user, action, request, details=None):
    """บันทึกการใช้งานของ user (ฟังก์ชันร่วม)"""
    UserActivityLog.objects.create(
        user=user,
        action=action,
        details=details
    )

# =============================================================================
# USER REGISTRATION
# =============================================================================

class RegisterView(generics.CreateAPIView):
    """API สำหรับสมัครสมาชิก"""
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

# =============================================================================
# USER INFORMATION
# =============================================================================

class UserView(APIView):
    """API สำหรับดูข้อมูลผู้ใช้ปัจจุบัน"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "user_type": getattr(user, 'user_type', 'user'),
            "date_joined": user.date_joined,
            "last_login": user.last_login,
            "security_question_1": getattr(user, 'security_question_1', ''),
            "security_answer_1": getattr(user, 'security_answer_1', ''),
            "security_question_2": getattr(user, 'security_question_2', ''),
            "security_answer_2": getattr(user, 'security_answer_2', ''),
            "export_limits": get_export_limits_info(request)
        })

# =============================================================================
# SESSION-BASED AUTHENTICATION
# =============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """API สำหรับ login แบบ session-based"""
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
    """API สำหรับ logout แบบ session-based"""
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

# =============================================================================
# JWT-BASED AUTHENTICATION
# =============================================================================

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
                user = User.objects.get(username=username)
                # บันทึก log การ login
                log_user_activity(user, 'login', request, 
                                details={'login_method': 'JWT'})
                
                # เพิ่มข้อมูล export limits ใน response
                if hasattr(response, 'data') and response.data:
                    response.data['export_limits'] = get_export_limits_info(request)
                    
            except User.DoesNotExist:
                pass
        
        return response


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

# =============================================================================
# EMAIL & USERNAME AVAILABILITY CHECK
# =============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def check_email_availability(request):
    """
    API สำหรับตรวจสอบว่าอีเมลมีผู้ใช้แล้วหรือไม่
    GET /api/accounts/check-email/?email=test@example.com
    """
    email = request.query_params.get('email', '').strip()
    
    if not email:
        return Response({
            'available': False, 
            'error': 'กรุณาระบุอีเมล'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # ถ้าเป็น user ที่ login แล้ว ให้ exclude ตัวเอง
    if request.user.is_authenticated:
        exists = User.objects.filter(email=email).exclude(id=request.user.id).exists()
    else:
        exists = User.objects.filter(email=email).exists()
    
    return Response({
        'available': not exists,
        'email': email
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_username_availability(request):
    """
    API สำหรับตรวจสอบว่า username มีผู้ใช้แล้วหรือไม่
    GET /api/accounts/check-username/?username=testuser
    """
    username = request.query_params.get('username', '').strip()
    
    if not username:
        return Response({
            'available': False,
            'error': 'กรุณาระบุ username'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    exists = User.objects.filter(username=username).exists()
    
    return Response({
        'available': not exists,
        'username': username
    }, status=status.HTTP_200_OK)