from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model  
from .serializers import RegisterSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView as BaseTokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils import timezone  
from datetime import timedelta     
import uuid                       

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
    
    # 📈 ดูจำนวนที่เหลือหลังจากส่งออก
    _, remaining_after, _ = check_export_permission(request)
    
    # 📊 บันทึก log (เฉพาะ user ที่ login) พร้อม remaining_conversions
    if request.user.is_authenticated:
        # 🆕 เพิ่ม remaining_conversions สำหรับ vector formats
        details = format_export_details(export_format, filename)
        
        # แปลง details เป็น dict ถ้าเป็น string
        if isinstance(details, str):
            import json
            try:
                details = json.loads(details)
            except:
                details = {'export_format': export_format.upper(), 'filename': filename}
        elif not isinstance(details, dict):
            details = {'export_format': export_format.upper(), 'filename': filename}
        
        # เพิ่ม remaining_conversions
        details['remaining_conversions'] = remaining_after
        
        log_user_activity(request.user, f'export_{export_format}', request, details=details)
    
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


# 🔐 Security Questions Reset Password APIs
@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """API สำหรับเริ่มต้น reset password - ป้อน username/email"""
    username = request.data.get('username', '').strip()
    email = request.data.get('email', '').strip()
    
    if not username and not email:
        return Response({
            'error': 'กรุณาป้อน username หรือ email'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # หา user จาก username หรือ email
        if username:
            user = User.objects.get(username=username)
        else:
            user = User.objects.get(email=email)
        
        # ตรวจสอบว่ามีคำถามความปลอดภัยหรือไม่
        if not user.has_security_questions():
            return Response({
                'error': 'ผู้ใช้นี้ยังไม่ได้ตั้งคำถามความปลอดภัย',
                'message': 'กรุณาติดต่อ Superuser เพื่อรีเซ็ตรหัสผ่าน',
                'contact_admin': True
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # ส่งคำถามกลับไป (ไม่เปิดเผยคำตอบ)
        return Response({
            'success': True,
            'message': 'พบผู้ใช้แล้ว กรุณาตอบคำถามความปลอดภัย',
            'user_id': user.id,
            'username': user.username,
            'security_questions': [
                user.security_question_1,
                user.security_question_2
            ]
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        # ไม่เปิดเผยว่า user มีอยู่หรือไม่ (security)
        return Response({
            'error': 'ไม่พบผู้ใช้ที่ตรงกับข้อมูลที่ป้อน'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_security_answers(request):
    """API สำหรับตรวจสอบคำตอบคำถามความปลอดภัย"""
    user_id = request.data.get('user_id')
    answer_1 = request.data.get('answer_1', '').strip()
    answer_2 = request.data.get('answer_2', '').strip()
    
    print("=== DEBUG SECURITY ANSWERS ===")
    print(f"User ID: {user_id}")
    print(f"Input Answer 1: '{answer_1}'")
    print(f"Input Answer 2: '{answer_2}'")
    print(f"Input Answer 1 length: {len(answer_1)}")
    print(f"Input Answer 2 length: {len(answer_2)}")

    if not all([user_id, answer_1, answer_2]):
        return Response({
            'error': 'กรุณากรอกคำตอบครบถ้วน'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(id=user_id)
        
        # 🔍 Debug stored answers
        print(f"Stored Answer 1: '{user.security_answer_1}'")
        print(f"Stored Answer 2: '{user.security_answer_2}'")
        print(f"Stored Answer 1 length: {len(user.security_answer_1) if user.security_answer_1 else 0}")
        print(f"Stored Answer 2 length: {len(user.security_answer_2) if user.security_answer_2 else 0}")
        
        # 🔍 Debug normalized answers
        stored_answer_1 = user.security_answer_1.lower().strip() if user.security_answer_1 else ''
        stored_answer_2 = user.security_answer_2.lower().strip() if user.security_answer_2 else ''
        input_answer_1 = answer_1.lower().strip()
        input_answer_2 = answer_2.lower().strip()
        
        print(f"Normalized Stored 1: '{stored_answer_1}'")
        print(f"Normalized Stored 2: '{stored_answer_2}'")
        print(f"Normalized Input 1: '{input_answer_1}'")
        print(f"Normalized Input 2: '{input_answer_2}'")
        print(f"Answer 1 match: {stored_answer_1 == input_answer_1}")
        print(f"Answer 2 match: {stored_answer_2 == input_answer_2}")
        print("=" * 50)

        # ตรวจสอบคำตอบ
        if user.verify_security_answers(answer_1, answer_2):
            # สร้าง temporary token สำหรับ reset password
            import uuid
            reset_token = str(uuid.uuid4())
            
            # เก็บ token ใน session หรือ cache (ง่ายๆ ใช้ session)
            from datetime import timedelta
            request.session[f'reset_token_{reset_token}'] = {
                'user_id': user.id,
                'expires_at': (timezone.now() + timedelta(minutes=60)).timestamp() 
            }
            
            # บันทึก log การใช้ security questions
            if user:
                log_user_activity(user, 'security_questions_verified', request, details={
                    'reset_initiated': True,
                    'method': 'security_questions'
                })
            
            return Response({
                'success': True,
                'message': 'คำตอบถูกต้อง สามารถตั้งรหัสผ่านใหม่ได้',
                'reset_token': reset_token
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'คำตอบไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except User.DoesNotExist:
        return Response({
            'error': 'ไม่พบผู้ใช้'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """API สำหรับตั้งรหัสผ่านใหม่ - เพิ่ม debug"""
    reset_token = request.data.get('reset_token')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')
    
    print(f"\n=== RESET PASSWORD DEBUG ===")
    print(f"Received token: {reset_token}")
    print(f"Session ID: {request.session.session_key}")
    print(f"All session data: {dict(request.session)}")
    print(f"All session keys: {list(request.session.keys())}")
    print(f"Looking for key: reset_token_{reset_token}")
    
    if not all([reset_token, new_password, confirm_password]):
        return Response({
            'error': 'กรุณากรอกข้อมูลครบถ้วน'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if new_password != confirm_password:
        return Response({
            'error': 'รหัสผ่านไม่ตรงกัน'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if len(new_password) < 6:
        return Response({
            'error': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # ตรวจสอบ reset token
    session_key = f'reset_token_{reset_token}'
    token_data = request.session.get(session_key)
    
    print(f"Session key to find: {session_key}")
    print(f"Token data found: {token_data}")
    
    # 🔧 เพิ่มการตรวจสอบแบบละเอียด
    if not token_data:
        # ลองหาทุก key ที่เริ่มต้นด้วย 'reset_token_'
        all_reset_tokens = {k: v for k, v in request.session.items() if k.startswith('reset_token_')}
        print(f"All reset tokens in session: {all_reset_tokens}")
        
        # ตรวจสอบว่า session ยังมีอยู่ไหม
        if not request.session.session_key:
            print("ERROR: Session key is None - session may have been destroyed")  
        
        return Response({
            'error': f'Token ไม่ถูกต้องหรือหมดอายุแล้ว',
            'debug_info': {
                'session_exists': bool(request.session.session_key),
                'available_tokens': len(all_reset_tokens),
                'received_token': reset_token[:8] + '...' if reset_token else None
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # ตรวจสอบ timing
    current_time = timezone.now().timestamp()
    expires_at = token_data['expires_at']
    time_remaining = expires_at - current_time
    
    print(f"Current timestamp: {current_time}")
    print(f"Token expires at: {expires_at}")
    print(f"Time remaining: {time_remaining} seconds ({time_remaining/60:.1f} minutes)")
    print(f"Is expired: {current_time > expires_at}")
    
    # ตรวจสอบว่า token หมดอายุหรือไม่
    if current_time > expires_at:
        del request.session[session_key]
        return Response({
            'error': f'Token หมดอายุแล้ว กรุณาเริ่มกระบวนการใหม่',
            'debug_info': {
                'expired_minutes_ago': abs(time_remaining) / 60,
                'was_valid_for': 60  # minutes
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(id=token_data['user_id'])
        
        # ตั้งรหัสผ่านใหม่
        user.set_password(new_password)
        user.save()
        
        # ลบ token ออกจาก session
        del request.session[session_key]
        print(f"Password reset successful for user: {user.username}")
        
        # บันทึก log การรีเซ็ตรหัสผ่าน
        log_user_activity(user, 'password_reset', request, details={
            'method': 'security_questions',
            'success': True,
            'time_remaining_when_reset': time_remaining
        })
        
        return Response({
            'success': True,
            'message': 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'error': 'ไม่พบผู้ใช้'
        }, status=status.HTTP_404_NOT_FOUND)


# 🔐 API สำหรับดูรายการคำถามความปลอดภัยที่เตรียมไว้
@api_view(['GET'])
@permission_classes([AllowAny])
def get_security_questions(request):
    """API สำหรับดูรายการคำถามความปลอดภัยที่เตรียมไว้"""
    questions = User.get_predefined_security_questions()
    return Response({
        'questions': questions
    }, status=status.HTTP_200_OK)