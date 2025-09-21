# backend/accounts/views/utils.py
"""
Shared Utility Functions for Views
"""

from ..models import UserActivityLog

def log_user_activity(user, action, request, details=None):
    """
    บันทึกการใช้งานของ user
    
    Args:
        user: User instance
        action: str - action type from UserActivityLog.ACTION_CHOICES
        request: HttpRequest instance
        details: dict - additional details (optional)
    """
    UserActivityLog.objects.create(
        user=user,
        action=action,
        details=details
    )