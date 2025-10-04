# backend/accounts/views/__init__.py
"""
Views Module for Accounts App
Imports all views to maintain backward compatibility
"""

# Authentication Views
from .auth_views import (
    RegisterView,
    UserView,
    login_view,
    logout_view,
    CustomTokenObtainPairView,
    jwt_logout_view,
    check_email_availability,  
    check_username_availability
)

# Password & Security Views
from .password_views import (
    forgot_password,
    verify_security_answers,
    reset_password,
    get_security_questions,
    get_user_password,
    admin_change_password,
    get_user_security_questions,
    update_user_security_questions
)

# Activity & Export Views
from .activity_views import (
    user_activity_logs,
    log_upload,
    log_conversion,
    log_export,
    get_export_limits
)

# Profile Management Views
from .profile_views import (
    update_profile,
    admin_promote_user,
)

# Admin Views (คงเดิมอยู่ในไฟล์ admin_views.py ระดับเดียวกับ views/)
# These will be imported directly from accounts.admin_views

__all__ = [
    # Authentication
    'RegisterView',
    'UserView', 
    'login_view',
    'logout_view',
    'CustomTokenObtainPairView',
    'jwt_logout_view',
    'check_email_availability',
    'check_username_availability',
    
    # Password & Security
    'forgot_password',
    'verify_security_answers',
    'reset_password',
    'get_security_questions',
    'get_user_password',
    'admin_change_password',
    'get_user_security_questions',
    'update_user_security_questions',
    
    # Activity & Export
    'user_activity_logs',
    'log_upload',
    'log_conversion',
    'log_export',
    'get_export_limits',
    
    # Profile Management
    'update_profile',
    'admin_promote_user',
]