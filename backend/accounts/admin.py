from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserActivityLog, GuestSession

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # ✅ อัปเดตให้แสดง export fields และ emoji
    list_display = [
        'username', 'email', 'user_type_display', 'active_status', 
        'export_usage_display', 'total_exports', 'date_joined'
    ]
    
    # ฟิลเตอร์ด้านข้าง
    list_filter = ['user_type', 'is_active', 'date_joined', 'last_login']
    
    # ค้นหาได้
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    # เรียงลำดับ
    ordering = ['-date_joined']
    
    # ✅ อัปเดต fieldsets ให้แสดง export fields
    fieldsets = BaseUserAdmin.fieldsets + (
        ('📊 Export Limits (ปัจจุบัน)', {
            'fields': ('user_type', 'daily_export_limit', 'daily_exports_used', 
                    'last_export_date', 'total_exports')
        }),
        ('🔐 Security Questions (คำถามความปลอดภัย)', {
            'fields': ('security_question_1', 'security_answer_1', 
                    'security_question_2', 'security_answer_2'),
            'description': 'คำถามสำหรับรีเซ็ตรหัสผ่าน'
        }),
    )
    
    # เพิ่ม user ใหม่ - เพิ่ม security questions
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('ข้อมูลเพิ่มเติม', {
            'fields': ('email', 'user_type', 'daily_export_limit')
        }),
        ('🔐 Security Questions (แนะนำ)', {
            'fields': ('security_question_1', 'security_answer_1', 
                      'security_question_2', 'security_answer_2'),
            'classes': ('collapse',),  # ซ่อนไว้ ให้เลือกตั้งหรือไม่ก็ได้
            'description': 'ตั้งคำถามความปลอดภัยสำหรับรีเซ็ตรหัสผ่าน (ไม่บังคับ)'
        }),
    )
    
    # ✅ Custom display functions
    def active_status(self, obj):
        """แสดง Active status พร้อม emoji"""
        if obj.is_active:
            return "✅ Active"
        else:
            return "❌ Inactive"
    active_status.short_description = 'สถานะ'
    # ❌ ลบบรรทัดนี้ออก: active_status.boolean = True
    
    def user_type_display(self, obj):
        """แสดง User Type พร้อม emoji"""
        types = {
            'superuser': '👑 Superuser',
            'admin': '🛡️ Admin', 
            'user': '👤 User'
        }
        return types.get(obj.user_type, '👤 User')
    user_type_display.short_description = 'ประเภทผู้ใช้'
    
    def export_usage_display(self, obj):
        """แสดงการใช้งาน export เป็น progress"""
        if obj.user_type in ['admin', 'superuser']:
            return "∞ ไม่จำกัด"
        
        if obj.daily_export_limit == 0:
            return "∞ ไม่จำกัด"
        
        percentage = (obj.daily_exports_used / obj.daily_export_limit) * 100
        
        if percentage >= 100:
            return f"🔴 {obj.daily_exports_used}/{obj.daily_export_limit} (เต็ม)"
        elif percentage >= 80:
            return f"🟡 {obj.daily_exports_used}/{obj.daily_export_limit} ({percentage:.0f}%)"
        else:
            return f"🟢 {obj.daily_exports_used}/{obj.daily_export_limit} ({percentage:.0f}%)"
    export_usage_display.short_description = 'การใช้งาน Export'
    
    # สิทธิ์การดู (ตาม user_type)
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.user_type == 'superuser':
            return qs  # เห็นทุกคน
        elif request.user.user_type == 'admin':
            return qs.exclude(user_type='superuser')  # ไม่เห็น superuser
        else:
            return qs.filter(id=request.user.id)  # เห็นแค่ตัวเอง
    
    # สิทธิ์การลบ
    def has_delete_permission(self, request, obj=None):
        if not obj:
            return True
        
        # Superuser ลบได้ทุกคน (ยกเว้นตัวเอง)
        if request.user.user_type == 'superuser':
            return obj != request.user
        
        # Admin ลบได้แค่ user ทั่วไป
        if request.user.user_type == 'admin':
            return obj.user_type == 'user'
            
        return False  # user ทั่วไปลบไม่ได้
    
    # ✅ Actions สำหรับจัดการ users
    actions = ['reset_export_limits', 'promote_to_admin']
    
    def reset_export_limits(self, request, queryset):
        """Reset export limits สำหรับ users ที่เลือก"""
        count = 0
        for user in queryset:
            user.daily_exports_used = 0
            user.last_export_date = None
            user.save()
            count += 1
        self.message_user(request, f'🔄 รีเซ็ต export limits สำหรับ {count} ผู้ใช้แล้ว')
    reset_export_limits.short_description = "🔄 รีเซ็ต Export Limits"
    
    def promote_to_admin(self, request, queryset):
        """เลื่อนตำแหน่งเป็น admin"""
        if request.user.user_type != 'superuser':
            self.message_user(request, '❌ เฉพาะ Superuser เท่านั้นที่สามารถเลื่อนตำแหน่งได้!', level='ERROR')
            return
        
        count = queryset.filter(user_type='user').update(user_type='admin')
        self.message_user(request, f'⬆️ เลื่อนตำแหน่งเป็น Admin สำหรับ {count} ผู้ใช้แล้ว')
    promote_to_admin.short_description = "⬆️ เลื่อนเป็น Admin"


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    # แสดงในรายการ
    list_display = ['user', 'action_with_icon', 'timestamp_formatted', 'user_type_display', 'get_details_summary']
    
    # ฟิลเตอร์
    list_filter = ['action', 'timestamp', 'user__user_type']
    
    # ค้นหา
    search_fields = ['user__username', 'user__email']
    
    # เรียงลำดับ
    ordering = ['-timestamp']
    
    # อ่านอย่างเดียว
    readonly_fields = ['user', 'action', 'timestamp', 'details']
    
    # ไม่ให้เพิ่ม/แก้ไข
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        # เฉพาะ superuser ลบ log ได้
        return request.user.user_type == 'superuser'
    
    # ✅ Custom display functions
    def action_with_icon(self, obj):
        """แสดง action พร้อม emoji"""
        icons = {
            'login': '🔓', 'logout': '🔒', 'register': '📝',
            'export_png': '🖼️', 'export_svg': '📐', 
            'export_pdf': '📄', 'export_eps': '📋',
            'upload_image': '⬆️', 'convert_image': '🔄'
        }
        icon = icons.get(obj.action, '❓')
        return f"{icon} {obj.get_action_display()}"
    action_with_icon.short_description = 'การกระทำ'
    
    def timestamp_formatted(self, obj):
        """แสดงเวลาในรูปแบบไทย"""
        return obj.timestamp.strftime('%d/%m/%Y %H:%M:%S')
    timestamp_formatted.short_description = 'เวลา'
    
    def user_type_display(self, obj):
        """แสดง user type พร้อม emoji"""
        types = {
            'superuser': '👑 Superuser',
            'admin': '🛡️ Admin', 
            'user': '👤 User'
        }
        return types.get(obj.user.user_type, '👤 User')
    user_type_display.short_description = 'ประเภทผู้ใช้'
    
    # แสดง details แบบสั้น
    def get_details_summary(self, obj):
        if obj.details:
            if isinstance(obj.details, dict):
                keys = list(obj.details.keys())[:2]  # 2 keys แรก
                return f"{', '.join(keys)}..."
            return str(obj.details)[:30] + "..."
        return "-"
    get_details_summary.short_description = 'รายละเอียด'
    
    # ฟิลเตอร์การดู log ตาม user_type
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.user_type == 'superuser':
            return qs  # เห็นทุก log
        elif request.user.user_type == 'admin':
            return qs.exclude(user__user_type='superuser')  # ไม่เห็น log ของ superuser
        else:
            return qs.filter(user=request.user)  # เห็นแค่ log ตัวเอง


# ✅ เพิ่ม Guest Sessions Management
@admin.register(GuestSession)
class GuestSessionAdmin(admin.ModelAdmin):
    list_display = [
        'guest_id_short', 'ip_address', 'export_usage_display', 
        'last_export_date', 'last_activity_formatted', 'created_at_formatted'
    ]
    list_filter = ['last_export_date', 'created_at', 'last_activity']
    search_fields = ['guest_id', 'ip_address']
    readonly_fields = ['guest_id', 'ip_address', 'created_at', 'last_activity', 'user_agent']
    ordering = ['-last_activity']
    
    def has_add_permission(self, request):
        return False  # ไม่ให้สร้าง guest session manual
    
    def has_change_permission(self, request, obj=None):
        return False  # ไม่ให้แก้ไข
    
    # ✅ Custom display functions
    def guest_id_short(self, obj):
        return f"{obj.guest_id[:12]}..."
    guest_id_short.short_description = 'Guest ID'
    
    def export_usage_display(self, obj):
        """แสดงการใช้งาน export ของ guest"""
        percentage = (obj.daily_exports_used / obj.GUEST_DAILY_LIMIT) * 100
        
        if percentage >= 100:
            return f"🔴 {obj.daily_exports_used}/{obj.GUEST_DAILY_LIMIT} (เต็ม)"
        elif percentage >= 80:
            return f"🟡 {obj.daily_exports_used}/{obj.GUEST_DAILY_LIMIT} ({percentage:.0f}%)"
        else:
            return f"🟢 {obj.daily_exports_used}/{obj.GUEST_DAILY_LIMIT} ({percentage:.0f}%)"
    export_usage_display.short_description = 'การใช้งาน Export'
    
    def last_activity_formatted(self, obj):
        if obj.last_activity:
            return obj.last_activity.strftime('%d/%m/%Y %H:%M')
        return '-'
    last_activity_formatted.short_description = 'กิจกรรมล่าสุด'
    
    def created_at_formatted(self, obj):
        return obj.created_at.strftime('%d/%m/%Y %H:%M')
    created_at_formatted.short_description = 'สร้างเมื่อ'
    
    # Action สำหรับลบ guest sessions เก่า
    actions = ['delete_old_sessions', 'reset_guest_limits']
    
    def delete_old_sessions(self, request, queryset):
        """ลบ Guest Sessions ที่ไม่ได้ใช้งานมากกว่า 7 วัน"""
        from datetime import timedelta
        from django.utils import timezone
        
        cutoff_date = timezone.now() - timedelta(days=7)
        old_sessions = queryset.filter(last_activity__lt=cutoff_date)
        count = old_sessions.count()
        old_sessions.delete()
        
        self.message_user(request, f'🗑️ ลบ Guest Sessions เก่า: {count} รายการ')
    delete_old_sessions.short_description = "🗑️ ลบ Sessions เก่า (>7 วัน)"
    
    def reset_guest_limits(self, request, queryset):
        """Reset export limits สำหรับ guest sessions ที่เลือก"""
        count = 0
        for session in queryset:
            session.daily_exports_used = 0
            session.last_export_date = None
            session.save()
            count += 1
        self.message_user(request, f'🔄 รีเซ็ต export limits สำหรับ {count} Guest Sessions')
    reset_guest_limits.short_description = "🔄 รีเซ็ต Guest Limits"


# เปลี่ยนชื่อ admin site
admin.site.site_header = "🖼️ Bitmap to Vector - ระบบจัดการ"
admin.site.site_title = "Admin Panel"
admin.site.index_title = "ระบบจัดการหลังบ้าน"