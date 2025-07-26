from django.urls import path
from .views import (
    RegisterView, UserView, login_view, logout_view, 
    user_activity_logs, CustomTokenObtainPairView, jwt_logout_view,
    log_conversion, log_export, log_upload
)
from .admin_views import (
    admin_dashboard_stats, admin_users_list, admin_user_detail, admin_activity_logs
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),  # JWT Login with logging
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # JWT Refresh
    path('token/logout/', jwt_logout_view, name='jwt_logout'),  # JWT Logout with logging
    path('user/', UserView.as_view(), name='user'),
    
    # Session-based authentication (สำรอง)
    path('login/', login_view, name='session_login'),  # Session Login
    path('logout/', logout_view, name='logout'),       # Session Logout
    
    # Activity logs
    path('logs/', user_activity_logs, name='user_logs'),  # ดู activity logs
    
    # Conversion & Export logging
    path('log-conversion/', log_conversion, name='log_conversion'),  # บันทึกการแปลง
    path('log-export/', log_export, name='log_export'),              # บันทึกการส่งออก
    path('log-upload/', log_upload, name='log_upload'),      

    # 🔧 Admin APIs
    path('admin/stats/', admin_dashboard_stats, name='admin_dashboard_stats'),
    path('admin/users/', admin_users_list, name='admin_users_list'),
    path('admin/users/<int:user_id>/', admin_user_detail, name='admin_user_detail'),
    path('admin/logs/', admin_activity_logs, name='admin_activity_logs'),
]