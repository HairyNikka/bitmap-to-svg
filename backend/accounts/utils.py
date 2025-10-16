# backend/accounts/utils.py
import uuid
from django.utils import timezone
from .models import GuestSession

def get_client_ip(request):
    """ดึง IP Address ของ client"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def get_guest_id_from_request(request):
    """ดึง guest_id จาก request (ส่งมาจาก frontend)"""
    # ลองหาใน request body ก่อน
    guest_id = getattr(request, 'data', {}).get('guest_id')
    
    # ถ้าไม่มี ลองหาใน headers
    if not guest_id:
        guest_id = request.META.get('HTTP_X_GUEST_ID')
    
    # ถ้ายังไม่มี สร้างใหม่
    if not guest_id:
        guest_id = str(uuid.uuid4())
    
    return guest_id

def get_user_agent(request):
    """ดึง User Agent จาก request"""
    return request.META.get('HTTP_USER_AGENT', '')

def get_or_create_guest_session(request):
    """หาหรือสร้าง Guest Session จาก request"""
    guest_id = get_guest_id_from_request(request)
    ip_address = get_client_ip(request)
    user_agent = get_user_agent(request)
    
    session = GuestSession.get_or_create_session(
        guest_id=guest_id,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    return session

def check_export_permission(request):
    """
    ตรวจสอบสิทธิ์การส่งออกไฟล์
    Returns: (can_export: bool, remaining_count: int, guest_id: str)
    """
    # ถ้า user login แล้ว
    if request.user.is_authenticated:
        user = request.user
        can_export = user.can_export_today()
        remaining = user.get_remaining_exports_today()
        return can_export, remaining, None
    
    # ถ้าเป็น guest
    else:
        guest_session = get_or_create_guest_session(request)
        can_export = guest_session.can_export_today()
        remaining = guest_session.get_remaining_exports_today()
        return can_export, remaining, guest_session.guest_id

def increment_export_count(request):
    """
    เพิ่มจำนวนการส่งออกไฟล์
    Returns: guest_id (str) หรือ None สำหรับ logged-in user
    """
    # ถ้า user login แล้ว
    if request.user.is_authenticated:
        user = request.user
        user.increment_export_count()
        return None
    
    # ถ้าเป็น guest
    else:
        guest_session = get_or_create_guest_session(request)
        guest_session.increment_export_count()
        return guest_session.guest_id

def get_export_limits_info(request):
    """
    ดึงข้อมูล export limits สำหรับแสดงใน frontend
    Returns: dict with limit info
    """
    if request.user.is_authenticated:
        user = request.user
        if user.user_type in ['admin', 'superuser']:
            return {
                'user_type': user.user_type,
                'is_unlimited': True,
                'daily_limit': -1,  
                'used_today': 0,
                'remaining': -1  
            }
        else:
            return {
                'user_type': 'user',
                'is_unlimited': False,
                'daily_limit': user.daily_export_limit,
                'used_today': user.daily_exports_used,
                'remaining': user.get_remaining_exports_today()
            }
    else:
        guest_session = get_or_create_guest_session(request)
        return {
            'user_type': 'guest',
            'is_unlimited': False,
            'daily_limit': GuestSession.GUEST_DAILY_LIMIT,
            'used_today': guest_session.daily_exports_used,
            'remaining': guest_session.get_remaining_exports_today(),
            'guest_id': guest_session.guest_id
        }

def cleanup_old_guest_sessions():
    """
    ลบ Guest Sessions เก่าที่ไม่ได้ใช้งานนานกว่า 7 วัน
    เรียกใช้ผ่าน management command หรือ cron job
    """
    from datetime import timedelta
    
    cutoff_date = timezone.now().date() - timedelta(days=7)
    deleted_count = GuestSession.objects.filter(
       last_export_date__lt=cutoff_date 
    ).delete()[0]
    
    return deleted_count

# Helper function สำหรับ logging
def format_export_details(export_format, filename, guest_id=None, file_size=None):
    """จัดรูปแบบ details สำหรับ export logging"""
    details = {
        'export_format': export_format.upper(),  # SVG, PDF, EPS, PNG
        'filename': filename or 'converted'      # ใช้ filename แทน original_filename
    }
    
    # เพิ่ม file_size ถ้ามี
    if file_size:
        details['file_size'] = file_size
    
    # เพิ่มข้อมูล guest ถ้ามี
    if guest_id:
        details['guest_id'] = guest_id
        details['user_type'] = 'guest'

    return details