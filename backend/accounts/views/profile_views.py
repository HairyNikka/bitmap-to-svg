# backend/accounts/views/profile_views.py
"""
User Profile Management
- Update User Profile
- Admin User Management
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model

# Import จาก app เดียวกัน
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
# USER PROFILE MANAGEMENT
# =============================================================================

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """API สำหรับอัพเดทโปรไฟล์ผู้ใช้ พร้อม detailed logging"""
    try:
        user = request.user
        data = request.data
        changes_made = []  # เก็บรายการการเปลี่ยนแปลง
        
        # ================================
        # 1. EMAIL CHANGE TRACKING
        # ================================
        if 'email' in data:
            new_email = data['email'].strip()
            if not new_email:
                return Response({'error': 'กรุณากรอกอีเมล'}, status=status.HTTP_400_BAD_REQUEST)
            
            # ตรวจสอบว่าอีเมลซ้ำกับคนอื่นหรือไม่
            if User.objects.filter(email=new_email).exclude(id=user.id).exists():
                return Response({'error': 'อีเมลนี้ถูกใช้งานแล้ว'}, status=status.HTTP_400_BAD_REQUEST)
            
            # เช็คว่าเปลี่ยนจริงหรือไม่
            if user.email != new_email:
                old_email = user.email
                user.email = new_email
                changes_made.append({
                    'type': 'email_change',
                    'old_value': old_email,
                    'new_value': new_email
                })
        
        # ================================
        # 2. PASSWORD CHANGE TRACKING
        # ================================
        if 'new_password' in data and data['new_password']:
            current_password = data.get('current_password', '')
            new_password = data['new_password']
            
            # ตรวจสอบรหัสผ่านปัจจุบัน
            if not user.check_password(current_password):
                return Response({'error': 'รหัสผ่านปัจจุบันไม่ถูกต้อง'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # ตรวจสอบความยาวรหัสผ่านใหม่
            if len(new_password) < 8:
                return Response({'error': 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร'}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(new_password)
            changes_made.append({
                'type': 'password_change'
            })
        
        # ================================
        # 3. SECURITY QUESTIONS TRACKING
        # ================================
        security_changes = []
        
        # คำถามข้อ 1
        if 'security_question_1' in data and 'security_answer_1' in data:
            new_question_1 = data['security_question_1'].strip()
            new_answer_1 = data['security_answer_1'].strip()
            
            if new_question_1 and new_answer_1:
                # เช็คว่าเปลี่ยนจริงหรือไม่
                if (user.security_question_1 != new_question_1 or 
                    user.security_answer_1 != new_answer_1.lower()):
                    
                    old_question_1 = user.security_question_1 or "ไม่ได้ตั้งไว้"
                    
                    security_changes.append({
                        'question_number': 1,
                        'old_question': old_question_1,
                        'new_question': new_question_1
                    })
                    
                    user.security_question_1 = new_question_1
                    user.security_answer_1 = new_answer_1.lower()
        
        # คำถามข้อ 2
        if 'security_question_2' in data and 'security_answer_2' in data:
            new_question_2 = data['security_question_2'].strip()
            new_answer_2 = data['security_answer_2'].strip()
            
            if new_question_2 and new_answer_2:
                # เช็คว่าเปลี่ยนจริงหรือไม่
                if (user.security_question_2 != new_question_2 or 
                    user.security_answer_2 != new_answer_2.lower()):
                    
                    old_question_2 = user.security_question_2 or "ไม่ได้ตั้งไว้"
                    
                    security_changes.append({
                        'question_number': 2,
                        'old_question': old_question_2,
                        'new_question': new_question_2
                    })
                    
                    user.security_question_2 = new_question_2
                    user.security_answer_2 = new_answer_2.lower()
        
        # เพิ่ม security changes ลงใน changes_made
        if security_changes:
            changes_made.append({
                'type': 'security_questions_change',
                'changes': security_changes
            })
        
        # บันทึกการเปลี่ยนแปลง
        user.save()
        
        # ================================
        # 4. LOG EACH CHANGE SEPARATELY
        # ================================
        for change in changes_made:
            if change['type'] == 'email_change':
                log_user_activity(user, 'profile_email_change', request, details={
                    'old_email': change['old_value'],
                    'new_email': change['new_value'],
                    'change_summary': f"เปลี่ยนอีเมลจาก {change['old_value']} เป็น {change['new_value']}"
                })
            
            elif change['type'] == 'password_change':
                log_user_activity(user, 'profile_password_change', request, details={
                    'description': 'ผู้ใช้เปลี่ยนรหัสผ่านผ่านหน้าโปรไฟล์',
                    'change_summary': 'เปลี่ยนรหัสผ่าน'
                })
            
            elif change['type'] == 'security_questions_change':
                # สร้าง summary ของการเปลี่ยนแปลง
                change_summaries = []
                for question_change in change['changes']:
                    summary = f"คำถามข้อ {question_change['question_number']}: จาก '{question_change['old_question']}' เป็น '{question_change['new_question']}'"
                    change_summaries.append(summary)
                
                log_user_activity(user, 'profile_security_questions_change', request, details={
                    'changes': change['changes'],
                    'change_summary': '; '.join(change_summaries),
                    'total_questions_changed': len(change['changes'])
                })
        
        # อัพเดท localStorage userData
        response_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "user_type": user.user_type,
            "date_joined": user.date_joined,
            "last_login": user.last_login,
            "export_limits": get_export_limits_info(request)
        }
        
        return Response({
            'success': True,
            'message': 'อัพเดทโปรไฟล์สำเร็จ',
            'user': response_data,
            'changes_count': len(changes_made)  # บอกจำนวนการเปลี่ยนแปลง
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'เกิดข้อผิดพลาด: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# =============================================================================
# ADMIN USER MANAGEMENT
# =============================================================================

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_promote_user(request, user_id):
    """API สำหรับ admin เปลี่ยนตำแหน่งผู้ใช้ (Enhanced)"""
    if request.user.user_type not in ['admin', 'superuser']:
        return Response({'error': 'Admin permission required'}, status=status.HTTP_403_FORBIDDEN)
    
    new_user_type = request.data.get('user_type')
    if new_user_type not in ['user', 'admin', 'superuser']:
        return Response({'error': 'Invalid user type'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        target_user = User.objects.get(id=user_id)
        
        # Admin ไม่สามารถเปลี่ยนตำแหน่ง admin/superuser ได้
        if request.user.user_type == 'admin' and target_user.user_type in ['admin', 'superuser']:
            return Response({'error': 'ไม่มีสิทธิ์แก้ไข admin/superuser'}, status=status.HTTP_403_FORBIDDEN)
        
        # ตรวจสอบว่าเปลี่ยนจริงหรือไม่
        if target_user.user_type == new_user_type:
            return Response({'message': 'ผู้ใช้มีตำแหน่งนี้อยู่แล้ว'}, status=status.HTTP_200_OK)
        
        old_user_type = target_user.user_type
        target_user.user_type = new_user_type
        target_user.save()
        
        # บันทึก log การเลื่อนตำแหน่ง (Enhanced)
        log_user_activity(request.user, 'admin_promote_user', request, details={
            'target_user': target_user.username,
            'target_user_email': target_user.email,
            'old_type': old_user_type,
            'new_type': new_user_type,
            'changed_by': request.user.username,
            'change_summary': f"เลื่อนตำแหน่ง '{target_user.username}': {old_user_type} → {new_user_type}",
            'promotion_type': 'upgrade' if new_user_type == 'admin' else 'downgrade' if new_user_type == 'user' else 'change'
        })
        
        return Response({
            'success': True,
            'message': f'เปลี่ยนตำแหน่งของ {target_user.username} สำเร็จ',
            'old_type': old_user_type,
            'new_type': new_user_type
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({'error': 'ไม่พบผู้ใช้'}, status=status.HTTP_404_NOT_FOUND)
    