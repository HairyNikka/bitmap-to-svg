# backend/accounts/urls.py
"""
Updated URLs for Refactored Views Structure
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

# Import จาก views module ใหม่
from .views import (
    # Authentication Views
    RegisterView, UserView, login_view, logout_view, 
    CustomTokenObtainPairView, jwt_logout_view,
    
    # Password & Security Views
    forgot_password, verify_security_answers, reset_password, get_security_questions,
    get_user_password, admin_change_password, get_user_security_questions, 
    update_user_security_questions,
    
    # Activity & Export Views
    user_activity_logs, log_conversion, log_export, log_upload, get_export_limits,
    
    # Profile Management Views
    update_profile, admin_promote_user
)

# Import Admin Views (ยังอยู่ในไฟล์เดิม)
from .admin_views import (
    admin_dashboard_stats, admin_users_list, admin_user_detail, admin_activity_logs
)

urlpatterns = [
    # =========================================================================
    # AUTHENTICATION ENDPOINTS
    # =========================================================================
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),  # JWT Login with logging
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # JWT Refresh
    path('token/logout/', jwt_logout_view, name='jwt_logout'),  # JWT Logout with logging
    path('user/', UserView.as_view(), name='user'),
    
    # Session-based authentication (สำรอง)
    path('login/', login_view, name='session_login'),  # Session Login
    path('logout/', logout_view, name='logout'),       # Session Logout
    
    # =========================================================================
    # PROFILE MANAGEMENT
    # =========================================================================
    path('profile/', update_profile, name='update_profile'),
    
    # =========================================================================
    # PASSWORD RESET WITH SECURITY QUESTIONS
    # =========================================================================
    path('forgot-password/', forgot_password, name='forgot_password'),
    path('verify-security-answers/', verify_security_answers, name='verify_security_answers'),
    path('reset-password/', reset_password, name='reset_password'),
    path('security-questions/', get_security_questions, name='get_security_questions'),

    # =========================================================================
    # ACTIVITY LOGS & EXPORT MANAGEMENT
    # =========================================================================
    path('logs/', user_activity_logs, name='user_logs'),  # ดู activity logs
    path('export-limits/', get_export_limits, name='get_export_limits'),    # ดู export limits
    
    # Upload, Conversion & Export logging
    path('log-upload/', log_upload, name='log_upload'),          # บันทึกการอัปโหลด
    path('log-conversion/', log_conversion, name='log_conversion'),  # บันทึกการแปลง
    path('log-export/', log_export, name='log_export'),              # บันทึกการส่งออก

    # =========================================================================
    # ADMIN APIs - USER MANAGEMENT
    # =========================================================================
    path('admin/stats/', admin_dashboard_stats, name='admin_dashboard_stats'),
    path('admin/users/', admin_users_list, name='admin_users_list'),
    path('admin/users/<int:user_id>/', admin_user_detail, name='admin_user_detail'),
    path('admin/logs/', admin_activity_logs, name='admin_activity_logs'),
    
    # Admin Password Management
    path('admin/users/<int:user_id>/password/', get_user_password, name='get_user_password'),
    path('admin/users/<int:user_id>/password/change/', admin_change_password, name='admin_change_password'),
    
    # Admin Security Questions Management
    path('admin/users/<int:user_id>/security-questions/', get_user_security_questions, name='get_user_security_questions'),
    path('admin/users/<int:user_id>/security-questions/update/', update_user_security_questions, name='update_user_security_questions'),
    
    # Admin User Promotion
    path('admin/promote-user/<int:user_id>/', admin_promote_user, name='admin_promote_user'),
]