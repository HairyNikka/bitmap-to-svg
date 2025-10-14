from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils import timezone
from django.db import models
from datetime import timedelta
from .models import User, UserActivityLog, GuestSession


class ExportUsageFilter(admin.SimpleListFilter):
    """Custom filter for export usage levels"""
    title = 'Export Usage'
    parameter_name = 'export_usage'
    
    def lookups(self, request, model_admin):
        return (
            ('high', 'High Usage (>80%)'),
            ('normal', 'Normal Usage (50-80%)'),
            ('low', 'Low Usage (<50%)'),
            ('unlimited', 'Unlimited Users'),
        )
    
    def queryset(self, request, queryset):
        if self.value() == 'high':
            return queryset.extra(
                where=["daily_export_limit > 0 AND daily_exports_used > daily_export_limit * 0.8"]
            )
        elif self.value() == 'normal':
            return queryset.extra(
                where=["daily_export_limit > 0 AND daily_exports_used >= daily_export_limit * 0.5 AND daily_exports_used <= daily_export_limit * 0.8"]
            )
        elif self.value() == 'low':
            return queryset.extra(
                where=["daily_export_limit > 0 AND daily_exports_used < daily_export_limit * 0.5"]
            )
        elif self.value() == 'unlimited':
            return queryset.filter(user_type__in=['admin', 'superuser'])


class UserActivityLogInline(admin.TabularInline):
    """Inline display of recent user activity logs"""
    model = UserActivityLog
    fields = ['action_display', 'timestamp_formatted', 'details_summary']
    readonly_fields = ['action_display', 'timestamp_formatted', 'details_summary']
    extra = 0
    max_num = 5
    ordering = ['-timestamp']
    
    def action_display(self, obj):
        return obj.get_action_display()
    action_display.short_description = 'Action'
    
    def timestamp_formatted(self, obj):
        from zoneinfo import ZoneInfo
        bangkok_tz = ZoneInfo("Asia/Bangkok")
        local_time = obj.timestamp.astimezone(bangkok_tz)
        return local_time.strftime('%Y-%m-%d %H:%M')
    timestamp_formatted.short_description = 'Time'
    
    def details_summary(self, obj):
        if obj.details:
            if isinstance(obj.details, dict):
                keys = list(obj.details.keys())[:2]
                return f"{', '.join(keys)}..."
            return str(obj.details)[:30] + "..."
        return "-"
    details_summary.short_description = 'Details'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Enhanced User Admin with export tracking and security features"""
    
    list_display = [
        'username', 'email', 'user_type_display', 'status_display', 
        'export_usage_display', 'total_conversions', 'total_exports', 'last_login_formatted', 'date_joined_formatted'
    ]
    
    list_filter = [
        'user_type', 'is_active', ExportUsageFilter, 'date_joined', 'last_login'
    ]
    
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Export Management', {
            'fields': ('user_type', 'daily_export_limit', 'daily_exports_used', 
                      'last_export_date', 'total_exports'),
            'description': 'Current export limits and usage statistics'
        }),
        ('Security Questions', {
            'fields': ('security_question_1', 'security_answer_1', 
                      'security_question_2', 'security_answer_2'),
            'classes': ('collapse',),
            'description': 'Security questions for password recovery'
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Information', {
            'fields': ('email', 'user_type', 'daily_export_limit')
        }),
        ('Security Questions (Optional)', {
            'fields': ('security_question_1', 'security_answer_1', 
                      'security_question_2', 'security_answer_2'),
            'classes': ('collapse',),
            'description': 'Set security questions for password recovery (optional)'
        }),
    )
    
    inlines = [UserActivityLogInline]
    actions = ['reset_export_limits', 'promote_to_admin', 'export_user_stats']
    
    # Custom display methods
    def status_display(self, obj):
        """Display user active status"""
        return "Active" if obj.is_active else "Inactive"
    status_display.short_description = 'Status'
    
    def user_type_display(self, obj):
        """Display user type with proper formatting"""
        return obj.get_user_type_display()
    user_type_display.short_description = 'User Type'
    
    def export_usage_display(self, obj):
        """Display export usage as progress indicator"""
        if obj.user_type in ['admin', 'superuser']:
            return "Unlimited"
        
        if obj.daily_export_limit == 0:
            return "Unlimited"
        
        percentage = (obj.daily_exports_used / obj.daily_export_limit) * 100
        
        if percentage >= 100:
            return f"{obj.daily_exports_used}/{obj.daily_export_limit} (Full)"
        elif percentage >= 80:
            return f"{obj.daily_exports_used}/{obj.daily_export_limit} ({percentage:.0f}%)"
        else:
            return f"{obj.daily_exports_used}/{obj.daily_export_limit} ({percentage:.0f}%)"
    export_usage_display.short_description = 'Export Usage'
    
    def last_login_formatted(self, obj):
        """Format last login date"""
        if not obj.last_login:
            return 'Never'
        from zoneinfo import ZoneInfo
        bangkok_tz = ZoneInfo("Asia/Bangkok")
        local_time = obj.last_login.astimezone(bangkok_tz)
        return local_time.strftime('%Y-%m-%d %H:%M')
    last_login_formatted.short_description = 'Last Login'
    
    def date_joined_formatted(self, obj):
        """Format join date"""
        from zoneinfo import ZoneInfo
        bangkok_tz = ZoneInfo("Asia/Bangkok")
        local_time = obj.date_joined.astimezone(bangkok_tz)
        return local_time.strftime('%Y-%m-%d')
    date_joined_formatted.short_description = 'Joined'
    
    # Permission controls
    def get_queryset(self, request):
        """Filter queryset based on user permissions"""
        qs = super().get_queryset(request)
        if request.user.user_type == 'superuser':
            return qs
        elif request.user.user_type == 'admin':
            return qs.exclude(user_type='superuser')
        else:
            return qs.filter(id=request.user.id)
    
    def has_delete_permission(self, request, obj=None):
        """Control delete permissions"""
        if not obj:
            return True
        
        if request.user.user_type == 'superuser':
            return obj != request.user
        
        if request.user.user_type == 'admin':
            return obj.user_type == 'user'
            
        return False
    
    def get_form(self, request, obj=None, **kwargs):
        """Customize form based on user permissions"""
        form = super().get_form(request, obj, **kwargs)
        
        # เพิ่มส่วนนี้ - แปลง security questions เป็น dropdown
        from django import forms
        
        if 'security_question_1' in form.base_fields:
            form.base_fields['security_question_1'] = forms.ChoiceField(
                choices=[('', '--- Select Question ---')] + [
                    (q, q) for q in User.get_predefined_security_questions()
                ],
                required=False,
                label='Security Question 1',
                help_text='Security question for password recovery'
            )
        
        if 'security_question_2' in form.base_fields:
            form.base_fields['security_question_2'] = forms.ChoiceField(
                choices=[('', '--- Select Question ---')] + [
                    (q, q) for q in User.get_predefined_security_questions()
                ],
                required=False,
                label='Security Question 2', 
                help_text='Security question for password recovery'
            )
        
        # Hide sensitive fields from non-superusers (โค้ดเดิม)
        if request.user.user_type != 'superuser':
            sensitive_fields = ['is_superuser', 'user_permissions', 'groups']
            for field in sensitive_fields:
                if field in form.base_fields:
                    del form.base_fields[field]
        
        return form
    
    # Custom actions
    def reset_export_limits(self, request, queryset):
        """Reset export limits for selected users"""
        count = 0
        for user in queryset:
            user.daily_exports_used = 0
            user.last_export_date = None
            user.save()
            count += 1
        self.message_user(request, f'Reset export limits for {count} users')
    reset_export_limits.short_description = "Reset Export Limits"
    
    def promote_to_admin(self, request, queryset):
        """Promote users to admin (superuser only)"""
        if request.user.user_type != 'superuser':
            self.message_user(request, 'Only superusers can promote users to admin!', level='ERROR')
            return
        
        count = queryset.filter(user_type='user').update(user_type='admin')
        self.message_user(request, f'Promoted {count} users to admin')
    promote_to_admin.short_description = "Promote to Admin"
    
    def export_user_stats(self, request, queryset):
        """Export user statistics as CSV"""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="user_stats.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Username', 'Email', 'User Type', 'Total Exports', 
            'Daily Limit', 'Last Login', 'Date Joined'
        ])
        
        for user in queryset:
            writer.writerow([
                user.username, user.email, user.user_type, user.total_exports,
                user.daily_export_limit, user.last_login, user.date_joined
            ])
        
        return response
    export_user_stats.short_description = "Export User Statistics"
    
    def changelist_view(self, request, extra_context=None):
        """Add summary statistics to changelist"""
        extra_context = extra_context or {}
        
        # Calculate summary stats
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        admin_users = User.objects.filter(user_type__in=['admin', 'superuser']).count()
        
        # Today's activity
        today = timezone.now().date()
        active_today = UserActivityLog.objects.filter(
            timestamp__date=today
        ).values('user').distinct().count()
        
        exports_today = UserActivityLog.objects.filter(
            action__contains='export',
            timestamp__date=today
        ).count()
        
        extra_context['summary_stats'] = {
            'total_users': total_users,
            'active_users': active_users,
            'admin_users': admin_users,
            'active_today': active_today,
            'exports_today': exports_today,
        }
        
        return super().changelist_view(request, extra_context)


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    """Enhanced Activity Log Admin with analytics"""
    
    list_display = [
        'user_link', 'action_display', 'timestamp_formatted', 
        'user_type_display', 'details_summary'
    ]
    
    list_filter = [
        'action', 'timestamp', 'user__user_type'
    ]
    
    search_fields = ['user__username', 'user__email']
    ordering = ['-timestamp']
    date_hierarchy = 'timestamp'
    
    readonly_fields = ['user', 'action', 'timestamp', 'details']
    actions = ['delete_old_logs_7days', 'delete_old_logs_30days', 'export_logs_csv']
    
    # Permissions
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return request.user.user_type == 'superuser'
    
    # Custom display methods
    def user_link(self, obj):
        """Create link to user admin page"""
        from django.urls import reverse
        from django.utils.html import format_html
        
        url = reverse('admin:accounts_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.username)
    user_link.short_description = 'User'
    
    def action_display(self, obj):
        """Display action with clean formatting"""
        return obj.get_action_display()
    action_display.short_description = 'Action'
    
    def timestamp_formatted(self, obj):
        """Format timestamp"""
        from zoneinfo import ZoneInfo
        bangkok_tz = ZoneInfo("Asia/Bangkok")
        local_time = obj.timestamp.astimezone(bangkok_tz)
        return local_time.strftime('%Y-%m-%d %H:%M:%S')
    timestamp_formatted.short_description = 'Time'
    
    def user_type_display(self, obj):
        """Display user type"""
        return obj.user.get_user_type_display()
    user_type_display.short_description = 'User Type'
    
    def details_summary(self, obj):
        """Display summary of details"""
        if obj.details:
            if isinstance(obj.details, dict):
                keys = list(obj.details.keys())[:2]
                return f"{', '.join(keys)}..."
            return str(obj.details)[:50] + "..."
        return "-"
    details_summary.short_description = 'Details'
    
    # Filter queryset based on permissions
    def get_queryset(self, request):
        """Filter logs based on user permissions"""
        qs = super().get_queryset(request)
        if request.user.user_type == 'superuser':
            return qs
        elif request.user.user_type == 'admin':
            return qs.exclude(user__user_type='superuser')
        else:
            return qs.filter(user=request.user)
    
    # Custom actions
    def delete_old_logs_7days(self, request, queryset):
        """Delete logs older than 7 days"""
        cutoff_date = timezone.now() - timedelta(days=7)
        old_logs = queryset.filter(timestamp__lt=cutoff_date)
        count = old_logs.count()
        old_logs.delete()
        
        self.message_user(request, f'Deleted {count} activity logs older than 7 days')
    delete_old_logs_7days.short_description = "Delete Logs (>7 days)"
    
    def delete_old_logs_30days(self, request, queryset):
        """Delete logs older than 30 days"""
        cutoff_date = timezone.now() - timedelta(days=30)
        old_logs = queryset.filter(timestamp__lt=cutoff_date)
        count = old_logs.count()
        old_logs.delete()
        
        self.message_user(request, f'Deleted {count} activity logs older than 30 days')
    delete_old_logs_30days.short_description = "Delete Logs (>30 days)"
    
    def export_logs_csv(self, request, queryset):
        """Export selected logs as CSV"""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="activity_logs.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['User', 'Action', 'Timestamp', 'User Type', 'Details'])
        
        for log in queryset:
            writer.writerow([
                log.user.username, log.get_action_display(), log.timestamp,
                log.user.get_user_type_display(), str(log.details)
            ])
        
        return response
    export_logs_csv.short_description = "Export Logs as CSV"
    
    def changelist_view(self, request, extra_context=None):
        """Add analytics to changelist"""
        extra_context = extra_context or {}
        
        # Calculate daily activity for last 7 days
        daily_stats = []
        for i in range(7):
            date = (timezone.now() - timedelta(days=i)).date()
            count = UserActivityLog.objects.filter(timestamp__date=date).count()
            daily_stats.append({
                'date': date.strftime('%Y-%m-%d'),
                'count': count
            })
        
        # Action statistics
        action_stats = UserActivityLog.objects.values('action').annotate(
            count=models.Count('id')
        ).order_by('-count')[:10]
        
        extra_context['daily_activity'] = daily_stats
        extra_context['action_stats'] = action_stats
        
        return super().changelist_view(request, extra_context)


class GuestExportUsageFilter(admin.SimpleListFilter):
    """Filter for guest export usage"""
    title = 'Export Usage'
    parameter_name = 'guest_usage'
    
    def lookups(self, request, model_admin):
        return (
            ('full', 'Full Quota (3/3)'),
            ('high', 'High Usage (2/3)'),
            ('low', 'Low Usage (1/3)'),
            ('unused', 'Unused (0/3)'),
        )
    
    def queryset(self, request, queryset):
        if self.value() == 'full':
            return queryset.filter(daily_exports_used__gte=3)
        elif self.value() == 'high':
            return queryset.filter(daily_exports_used=2)
        elif self.value() == 'low':
            return queryset.filter(daily_exports_used=1)
        elif self.value() == 'unused':
            return queryset.filter(daily_exports_used=0)
        return queryset

@admin.register(GuestSession)
class GuestSessionAdmin(admin.ModelAdmin):
    """Guest Session Management"""
    
    list_display = [
        'guest_id_short', 'ip_address', 'device_info', 'export_usage_display', 
        'last_export_date', 'created_at_formatted'
    ]
    
    list_filter = [GuestExportUsageFilter, 'last_export_date', 'created_at']
    search_fields = ['guest_id', 'ip_address']
    readonly_fields = ['guest_id', 'ip_address', 'created_at', 'user_agent']
    ordering = ['-last_export_date']
    date_hierarchy = 'created_at'
    
    actions = ['delete_old_sessions', 'reset_guest_limits']
    
    # Permissions
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    # Custom display methods
    def guest_id_short(self, obj):
        """Display shortened guest ID"""
        return f"{obj.guest_id[:12]}..."
    guest_id_short.short_description = 'Guest ID'
    
    def export_usage_display(self, obj):
        """Display guest export usage"""
        percentage = (obj.daily_exports_used / obj.GUEST_DAILY_LIMIT) * 100
        
        if percentage >= 100:
            return f"{obj.daily_exports_used}/{obj.GUEST_DAILY_LIMIT} (Full)"
        elif percentage >= 80:
            return f"{obj.daily_exports_used}/{obj.GUEST_DAILY_LIMIT} ({percentage:.0f}%)"
        else:
            return f"{obj.daily_exports_used}/{obj.GUEST_DAILY_LIMIT} ({percentage:.0f}%)"
    export_usage_display.short_description = 'Export Usage'
    
    def created_at_formatted(self, obj):
        """Format creation date"""
        from zoneinfo import ZoneInfo
        bangkok_tz = ZoneInfo("Asia/Bangkok")
        local_time = obj.created_at.astimezone(bangkok_tz)
        return local_time.strftime('%Y-%m-%d %H:%M')
    created_at_formatted.short_description = 'Created'
    
    # Custom actions
    def delete_old_sessions(self, request, queryset):
        """Delete guest sessions that haven't exported for more than 7 days"""
        cutoff_date = timezone.now().date() - timedelta(days=7)
        old_sessions = queryset.filter(last_export_date__lt=cutoff_date)
        count = old_sessions.count()
        old_sessions.delete()
        
        self.message_user(request, f'Deleted {count} inactive guest sessions')
    delete_old_sessions.short_description = "Delete Inactive Sessions (>7 days)"
    
    def reset_guest_limits(self, request, queryset):
        """Reset export limits for selected guest sessions"""
        count = 0
        for session in queryset:
            session.daily_exports_used = 0
            session.last_export_date = None
            session.save()
            count += 1
        self.message_user(request, f'Reset export limits for {count} guest sessions')
    reset_guest_limits.short_description = "Reset Guest Export Limits"

    def changelist_view(self, request, extra_context=None):
        """Add summary statistics for guest sessions"""
        extra_context = extra_context or {}
        
        from django.db.models import Count, Q
        
        # สถิติ Guest
        total_guests = GuestSession.objects.count()
        active_today = GuestSession.objects.filter(
        last_export_date=timezone.now().date() 
        ).count()
        
        full_quota = GuestSession.objects.filter(
            daily_exports_used__gte=GuestSession.GUEST_DAILY_LIMIT
        ).count()
        
        # Guest ที่ต้อง cleanup (เก่ากว่า 7 วัน)
        needs_cleanup = GuestSession.objects.filter(
            last_export_date__lt=timezone.now().date() - timedelta(days=7) 
        ).count()
        
        extra_context['guest_stats'] = {
            'total_guests': total_guests,
            'active_today': active_today,
            'full_quota': full_quota,
            'needs_cleanup': needs_cleanup,
        }
        
        return super().changelist_view(request, extra_context)
    
    def device_info(self, obj):
        """Extract device info from user agent"""
        if not obj.user_agent:
            return "Unknown"
        
        ua = obj.user_agent.lower()
        if 'mobile' in ua or 'android' in ua or 'iphone' in ua:
            return "Mobile"
        elif 'tablet' in ua or 'ipad' in ua:
            return "Tablet"
        else:
            return "Desktop"
    device_info.short_description = 'Device'

# Customize admin site
admin.site.site_header = "Bitmap to Vector - Administration"
admin.site.site_title = "Admin Panel"
admin.site.index_title = "System Administration"