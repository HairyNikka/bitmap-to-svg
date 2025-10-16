# backend/accounts/views/activity_views.py
"""
Activity Logging & Export Management
- User Activity Logs
- Upload/Conversion/Export Tracking
- Export Limits Management
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model

# Import จาก app เดียวกัน
from ..models import UserActivityLog
from ..utils import (
    check_export_permission, 
    increment_export_count, 
    get_export_limits_info,
    format_export_details
)

User = get_user_model()

def log_user_activity(user, action, request, details=None):
    """บันทึกการใช้งานของ user (ฟังก์ชันร่วม)"""
    UserActivityLog.objects.create(
        user=user,
        action=action,
        details=details
    )

# =============================================================================
# USER ACTIVITY LOGS
# =============================================================================

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

# =============================================================================
# EXPORT LIMITS MANAGEMENT
# =============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def get_export_limits(request):
    """API สำหรับดูข้อมูล export limits"""
    limits_info = get_export_limits_info(request)
    return Response(limits_info, status=status.HTTP_200_OK)

# =============================================================================
# UPLOAD, CONVERSION & EXPORT LOGGING
# =============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def log_upload(request):
    """API สำหรับบันทึกการอัปโหลดภาพ (รองรับ guest)"""
    filename = request.data.get('filename')
    file_size = request.data.get('file_size')
    file_type = request.data.get('file_type') 
    
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
@permission_classes([AllowAny])
def log_conversion(request):
    """API สำหรับบันทึกการแปลงภาพ"""
    filename = request.data.get('filename')
    file_size = request.data.get('file_size')
    
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
    
    # PNG ไม่ต้องตรวจสอบ limit - ส่งออกได้ไม่จำกัด
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
    
    # สำหรับ SVG, PDF, EPS - ตรวจสอบ limit ตามปกติ
    can_export, remaining_count, returned_guest_id = check_export_permission(request)
    
    if not can_export:
        user_type = 'guest' if not request.user.is_authenticated else 'user'
        return Response({
            'error': f'เกินจำนวนการส่งออกที่อนุญาตต่อวัน',
            'remaining': remaining_count,
            'user_type': user_type,
            'guest_id': returned_guest_id
        }, status=status.HTTP_429_TOO_MANY_REQUESTS)
    
    # เพิ่มจำนวนการส่งออก (ยกเว้น PNG)
    returned_guest_id = increment_export_count(request)
    
    # ดูจำนวนที่เหลือหลังจากส่งออก
    _, remaining_after, _ = check_export_permission(request)
    
    # บันทึก log (เฉพาะ user ที่ login) พร้อม remaining_conversions
    if request.user.is_authenticated:
        # เพิ่ม remaining_conversions สำหรับ vector formats
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