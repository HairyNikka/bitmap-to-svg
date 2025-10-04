# backend/accounts/views/password_views.py
"""
Password & Security Management Views
- Password Reset with Security Questions
- Admin Password Management
- Security Questions Management
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import uuid

# Import จาก app เดียวกัน
from ..models import UserActivityLog
from ..utils import get_export_limits_info

User = get_user_model()

def log_user_activity(user, action, request, details=None):
    """บันทึกการใช้งานของ user (ย้ายมาจาก views.py)"""
    UserActivityLog.objects.create(
        user=user,
        action=action,
        details=details
    )

# =============================================================================
# PASSWORD RESET WITH SECURITY QUESTIONS
# =============================================================================

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
        
        # Debug stored answers
        print(f"Stored Answer 1: '{user.security_answer_1}'")
        print(f"Stored Answer 2: '{user.security_answer_2}'")
        print(f"Stored Answer 1 length: {len(user.security_answer_1) if user.security_answer_1 else 0}")
        print(f"Stored Answer 2 length: {len(user.security_answer_2) if user.security_answer_2 else 0}")
        
        # Debug normalized answers
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
            reset_token = str(uuid.uuid4())
            
            # เก็บ token ใน session หรือ cache (ง่ายๆ ใช้ session)
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
    
    if len(new_password) < 8:
        return Response({
            'error': 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # ตรวจสอบ reset token
    session_key = f'reset_token_{reset_token}'
    token_data = request.session.get(session_key)
    
    print(f"Session key to find: {session_key}")
    print(f"Token data found: {token_data}")
    
    # เพิ่มการตรวจสอบแบบละเอียด
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


@api_view(['GET'])
@permission_classes([AllowAny])
def get_security_questions(request):
    """API สำหรับดูรายการคำถามความปลอดภัยที่เตรียมไว้"""
    questions = User.get_predefined_security_questions()
    return Response({
        'questions': questions
    }, status=status.HTTP_200_OK)


# =============================================================================
# ADMIN PASSWORD MANAGEMENT
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_password(request, user_id):
    """API สำหรับ admin ดูรหัสผ่านของ user (plain text)"""
    # ตรวจสอบสิทธิ์ admin
    if request.user.user_type not in ['admin', 'superuser']:
        return Response({'error': 'Admin permission required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        
        # Admin ไม่สามารถดูรหัส superuser ได้
        if request.user.user_type == 'admin' and user.user_type in ['admin', 'superuser']:
            return Response({'error': 'ไม่มีสิทธิ์ดูรหัสผ่านของ admin/superuser'}, status=status.HTTP_403_FORBIDDEN)
        
        return Response({
            'password': user.password,  # ส่ง hashed password หรือจะเก็บ plain text แยกก็ได้
            'username': user.username
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({'error': 'ไม่พบผู้ใช้'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_change_password(request, user_id):
    """API สำหรับ admin เปลี่ยนรหัสผ่านของ user"""
    # ตรวจสอบสิทธิ์ admin
    if request.user.user_type not in ['admin', 'superuser']:
        return Response({'error': 'Admin permission required'}, status=status.HTTP_403_FORBIDDEN)
    
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')
    
    if not new_password or not confirm_password:
        return Response({'error': 'กรุณากรอกรหัสผ่านครบถ้วน'}, status=status.HTTP_400_BAD_REQUEST)
    
    if new_password != confirm_password:
        return Response({'error': 'รหัสผ่านไม่ตรงกัน'}, status=status.HTTP_400_BAD_REQUEST)
    
    if len(new_password) < 8:
        return Response({'error': 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(id=user_id)
        
        # Admin ไม่สามารถเปลี่ยนรหัส admin/superuser ได้
        if request.user.user_type == 'admin' and user.user_type in ['admin', 'superuser']:
            return Response({'error': 'ไม่มีสิทธิ์เปลี่ยนรหัสผ่านของ admin/superuser'}, status=status.HTTP_403_FORBIDDEN)
        
        user.set_password(new_password)
        user.save()
        
        # บันทึก log การเปลี่ยนรหัสผ่านโดย admin
        log_user_activity(request.user, 'admin_change_password', request, details={
            'target_user': user.username,
            'changed_by': request.user.username
        })
        
        return Response({
            'success': True,
            'message': f'เปลี่ยนรหัสผ่านของ {user.username} สำเร็จ'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({'error': 'ไม่พบผู้ใช้'}, status=status.HTTP_404_NOT_FOUND)


# =============================================================================
# ADMIN SECURITY QUESTIONS MANAGEMENT
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_security_questions(request, user_id):
    """API สำหรับ admin ดูคำถามและคำตอบความปลอดภัยของ user"""
    # ตรวจสอบสิทธิ์ admin
    if request.user.user_type not in ['admin', 'superuser']:
        return Response({'error': 'Admin permission required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        
        # Admin ไม่สามารถดู security questions ของ admin/superuser ได้
        if request.user.user_type == 'admin' and user.user_type in ['admin', 'superuser']:
            return Response({'error': 'ไม่มีสิทธิ์ดูคำถามของ admin/superuser'}, status=status.HTTP_403_FORBIDDEN)
        
        return Response({
            'security_question_1': user.security_question_1 or '',
            'security_answer_1': user.security_answer_1 or '',
            'security_question_2': user.security_question_2 or '',
            'security_answer_2': user.security_answer_2 or '',
            'has_security_questions': user.has_security_questions()
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({'error': 'ไม่พบผู้ใช้'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_security_questions(request, user_id):
    """API สำหรับ admin แก้ไขคำถามและคำตอบความปลอดภัยของ user"""
    # ตรวจสอบสิทธิ์ admin
    if request.user.user_type not in ['admin', 'superuser']:
        return Response({'error': 'Admin permission required'}, status=status.HTTP_403_FORBIDDEN)
    
    security_question_1 = request.data.get('security_question_1', '').strip()
    security_answer_1 = request.data.get('security_answer_1', '').strip()
    security_question_2 = request.data.get('security_question_2', '').strip()
    security_answer_2 = request.data.get('security_answer_2', '').strip()
    
    if not all([security_question_1, security_answer_1, security_question_2, security_answer_2]):
        return Response({'error': 'กรุณากรอกคำถามและคำตอบครบถ้วน'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(id=user_id)
        
        # Admin ไม่สามารถแก้ไข security questions ของ admin/superuser ได้
        if request.user.user_type == 'admin' and user.user_type in ['admin', 'superuser']:
            return Response({'error': 'ไม่มีสิทธิ์แก้ไขคำถามของ admin/superuser'}, status=status.HTTP_403_FORBIDDEN)
        
        user.set_security_questions(security_question_1, security_answer_1, security_question_2, security_answer_2)
        
        # บันทึก log การแก้ไขคำถาม
        log_user_activity(request.user, 'admin_edit_security_questions', request, details={
            'target_user': user.username,
            'updated_by': request.user.username
        })
        
        return Response({
            'success': True,
            'message': f'แก้ไขคำถามความปลอดภัยของ {user.username} สำเร็จ'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({'error': 'ไม่พบผู้ใช้'}, status=status.HTTP_404_NOT_FOUND)
    