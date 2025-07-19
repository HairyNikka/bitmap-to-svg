from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserActivityLog, SystemLog

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # แสดงในรายการ
    list_display = [
        'username', 'email', 'user_type', 'is_active', 
        'daily_conversions_used', 'daily_conversion_limit', 'date_joined'
    ]
    
    # ฟิลเตอร์ด้านข้าง
    list_filter = ['user_type', 'is_active', 'date_joined', 'last_login']
    
    # ค้นหาได้
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    # เรียงลำดับ
    ordering = ['-date_joined']
    
    # แก้ไขข้อมูล user
    fieldsets = BaseUserAdmin.fieldsets + (
        ('ข้อมูลเพิ่มเติม', {
            'fields': ('user_type', 'daily_conversion_limit', 'daily_conversions_used', 'total_conversions')
        }),
    )
    
    # เพิ่ม user ใหม่
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('ข้อมูลเพิ่มเติม', {
            'fields': ('email', 'user_type', 'daily_conversion_limit')
        }),
    )
    
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
    
    # Action สำหรับ reset daily conversions
    actions = ['reset_daily_conversions']
    
    def reset_daily_conversions(self, request, queryset):
        count = queryset.update(daily_conversions_used=0)
        self.message_user(request, f'รีเซ็ตการนับรายวันสำหรับ {count} ผู้ใช้แล้ว')
    reset_daily_conversions.short_description = "รีเซ็ตการนับการแปลงรายวัน"


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    # แสดงในรายการ
    list_display = ['user', 'action', 'timestamp', 'get_details_summary']
    
    # ฟิลเตอร์
    list_filter = ['action', 'timestamp', 'user__user_type']
    
    # ค้นหา
    search_fields = ['user__username', 'user__email']
    
    # เรียงลำดับ
    ordering = ['-timestamp']
    
    # อ่านอย่างเดียว
    readonly_fields = ['user', 'action', 'timestamp', 'details']
    
    # ไม่ให้เพิ่ม/แก้ไข/ลบ
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        # เฉพาะ superuser ลบ log ได้
        return request.user.user_type == 'superuser'
    
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


@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
    list_display = ['level', 'message_short', 'user', 'timestamp']
    list_filter = ['level', 'timestamp']
    search_fields = ['message', 'user__username']
    ordering = ['-timestamp']
    readonly_fields = ['level', 'message', 'timestamp', 'user']
    
    def message_short(self, obj):
        return obj.message[:100] + "..." if len(obj.message) > 100 else obj.message
    message_short.short_description = 'ข้อความ'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return request.user.user_type == 'superuser'

# เปลี่ยนชื่อ admin site
admin.site.site_header = "Bitmap to Vector - ระบบจัดการ"
admin.site.site_title = "Admin Panel"
admin.site.index_title = "ระบบจัดการหลังบ้าน"