# สร้างไฟล์ใหม่: backend/accounts/admin_views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import User, UserActivityLog, SystemLog
from .serializers import UserSerializer, UserActivityLogSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# 🔒 Permission Decorator สำหรับ Admin
def admin_required(view_func):
    """Decorator เพื่อตรวจสอบว่าเป็น admin หรือ superuser"""
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if request.user.user_type not in ['admin', 'superuser']:
            return Response({'error': 'Admin permission required'}, status=status.HTTP_403_FORBIDDEN)
        
        return view_func(request, *args, **kwargs)
    return wrapper

def superuser_required(view_func):
    """Decorator เพื่อตรวจสอบว่าเป็น superuser เท่านั้น"""
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if request.user.user_type != 'superuser':
            return Response({'error': 'Superuser permission required'}, status=status.HTTP_403_FORBIDDEN)
        
        return view_func(request, *args, **kwargs)
    return wrapper

# 📊 API 1: Dashboard Statistics
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_dashboard_stats(request):
    """สถิติสำหรับ Dashboard"""
    
    # สถิติผู้ใช้
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    users_by_type = User.objects.values('user_type').annotate(count=Count('id'))
    
    # สถิติการใช้งานย้อนหลัง 7 วัน
    seven_days_ago = timezone.now() - timedelta(days=7)
    recent_registrations = User.objects.filter(date_joined__gte=seven_days_ago).count()
    recent_logins = UserActivityLog.objects.filter(
        action='login', 
        timestamp__gte=seven_days_ago
    ).count()
    
    # สถิติการแปลงภาพ
    total_conversions = UserActivityLog.objects.filter(action='convert_image').count()
    conversions_today = UserActivityLog.objects.filter(
        action='convert_image',
        timestamp__date=timezone.now().date()
    ).count()
    
    # สถิติการส่งออก
    exports_stats = UserActivityLog.objects.filter(
        action__in=['export_png', 'export_svg', 'export_pdf', 'export_eps']
    ).values('action').annotate(count=Count('id'))
    
    # ผู้ใช้ที่ active ที่สุด (ย้อนหลัง 7 วัน)
    top_users = UserActivityLog.objects.filter(
        timestamp__gte=seven_days_ago
    ).values(
        'user__username', 'user__id'
    ).annotate(
        activity_count=Count('id')
    ).order_by('-activity_count')[:5]
    
    # การใช้งานรายวัน (7 วันล่าสุด)
    daily_activity = []
    for i in range(7):
        date = timezone.now().date() - timedelta(days=i)
        day_logs = UserActivityLog.objects.filter(timestamp__date=date).count()
        daily_activity.append({
            'date': date.strftime('%Y-%m-%d'),
            'count': day_logs
        })
    
    return Response({
        'users': {
            'total': total_users,
            'active': active_users,
            'recent_registrations': recent_registrations,
            'by_type': list(users_by_type)
        },
        'conversions': {
            'total': total_conversions,
            'today': conversions_today
        },
        'exports': list(exports_stats),
        'activity': {
            'recent_logins': recent_logins,
            'top_users': list(top_users),
            'daily_activity': daily_activity
        }
    })

# 👥 API 2: จัดการผู้ใช้
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_users_list(request):
    """รายชื่อผู้ใช้ทั้งหมด พร้อม pagination และ search"""
    
    # สิทธิ์การดู: superuser เห็นทุกคน, admin เห็นแค่ user
    if request.user.user_type == 'superuser':
        users = User.objects.all()
    else:
        users = User.objects.exclude(user_type='superuser')
    
    # Search
    search = request.GET.get('search', '')
    if search:
        users = users.filter(
            Q(username__icontains=search) | 
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )
    
    # Filter by user_type
    user_type_filter = request.GET.get('user_type', '')
    if user_type_filter:
        users = users.filter(user_type=user_type_filter)
    
    # Filter by active status
    is_active_filter = request.GET.get('is_active', '')
    if is_active_filter:
        users = users.filter(is_active=is_active_filter.lower() == 'true')
    
    # Ordering
    order_by = request.GET.get('order_by', '-date_joined')
    users = users.order_by(order_by)
    
    # Pagination
    page = int(request.GET.get('page', 1))
    per_page = int(request.GET.get('per_page', 20))
    start = (page - 1) * per_page
    end = start + per_page
    
    users_page = users[start:end]
    total_count = users.count()
    
    # เพิ่มข้อมูล activity ล่าสุด
    users_data = []
    for user in users_page:
        last_activity = UserActivityLog.objects.filter(user=user).first()
        user_data = UserSerializer(user).data
        user_data['last_activity'] = {
            'action': last_activity.get_action_display() if last_activity else None,
            'timestamp': last_activity.timestamp if last_activity else None,
        }
        user_data['total_activities'] = UserActivityLog.objects.filter(user=user).count()
        users_data.append(user_data)
    
    return Response({
        'users': users_data,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total_count,
            'pages': (total_count + per_page - 1) // per_page
        }
    })

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_user_detail(request, user_id):
    """จัดการผู้ใช้รายบุคคล"""
    
    user = get_object_or_404(User, id=user_id)
    
    # ตรวจสอบสิทธิ์
    if request.user.user_type == 'admin' and user.user_type in ['admin', 'superuser']:
        return Response({'error': 'ไม่มีสิทธิ์จัดการ admin หรือ superuser'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        # ดูข้อมูลผู้ใช้พร้อม activity logs
        user_data = UserSerializer(user).data
        
        # Activity logs ล่าสุด 20 รายการ
        logs = UserActivityLog.objects.filter(user=user)[:20]
        user_data['recent_logs'] = UserActivityLogSerializer(logs, many=True).data
        
        # สถิติ
        user_data['stats'] = {
            'total_logins': UserActivityLog.objects.filter(user=user, action='login').count(),
            'total_conversions': UserActivityLog.objects.filter(user=user, action='convert_image').count(),
            'total_exports': UserActivityLog.objects.filter(
                user=user, 
                action__in=['export_png', 'export_svg', 'export_pdf', 'export_eps']
            ).count(),
        }
        
        return Response(user_data)
    
    elif request.method == 'PUT':
        # แก้ไขข้อมูลผู้ใช้
        allowed_fields = ['email', 'first_name', 'last_name', 'is_active', 'daily_conversion_limit']
        
        # เฉพาะ superuser ถึงจะแก้ไข user_type ได้
        if request.user.user_type == 'superuser':
            allowed_fields.append('user_type')
        
        updated_data = {}
        for field in allowed_fields:
            if field in request.data:
                updated_data[field] = request.data[field]
        
        # ป้องกันการแก้ไข superuser โดย admin
        if 'user_type' in updated_data and request.user.user_type == 'admin':
            if updated_data['user_type'] in ['admin', 'superuser']:
                return Response({'error': 'Admin ไม่สามารถเลื่อนเป็น admin หรือ superuser ได้'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = UserSerializer(user, data=updated_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # บันทึก log การแก้ไข
            from .views import log_user_activity
            log_user_activity(request.user, 'admin_edit_user', request, details={
                'target_user': user.username,
                'changes': updated_data
            })
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # ลบผู้ใช้
        if user == request.user:
            return Response({'error': 'ไม่สามารถลบตัวเองได้'}, status=status.HTTP_400_BAD_REQUEST)
        
        # เฉพาะ superuser ถึงจะลบ admin ได้
        if user.user_type == 'admin' and request.user.user_type != 'superuser':
            return Response({'error': 'เฉพาะ superuser เท่านั้นที่ลบ admin ได้'}, status=status.HTTP_403_FORBIDDEN)
        
        if user.user_type == 'superuser':
            return Response({'error': 'ไม่สามารถลบ superuser ได้'}, status=status.HTTP_403_FORBIDDEN)
        
        username = user.username
        user.delete()
        
        # บันทึก log การลบ
        from .views import log_user_activity
        log_user_activity(request.user, 'admin_delete_user', request, details={
            'deleted_user': username
        })
        
        return Response({'message': f'ลบผู้ใช้ {username} เรียบร้อยแล้ว'})

# 📋 API 3: Activity Logs
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_activity_logs(request):
    """ดู activity logs ทั้งระบบ"""
    
    # สิทธิ์การดู logs
    if request.user.user_type == 'superuser':
        logs = UserActivityLog.objects.all()
    else:
        # admin เห็นแค่ logs ของ user ทั่วไป
        logs = UserActivityLog.objects.exclude(user__user_type='superuser')
    
    # Filters
    action_filter = request.GET.get('action', '')
    if action_filter:
        logs = logs.filter(action=action_filter)
    
    user_filter = request.GET.get('user', '')
    if user_filter:
        logs = logs.filter(user__username__icontains=user_filter)
    
    # Date range filter
    date_from = request.GET.get('date_from', '')
    date_to = request.GET.get('date_to', '')
    if date_from:
        logs = logs.filter(timestamp__date__gte=date_from)
    if date_to:
        logs = logs.filter(timestamp__date__lte=date_to)
    
    # Ordering
    logs = logs.order_by('-timestamp')
    
    # Pagination
    page = int(request.GET.get('page', 1))
    per_page = int(request.GET.get('per_page', 50))
    start = (page - 1) * per_page
    end = start + per_page
    
    logs_page = logs[start:end]
    total_count = logs.count()
    
    return Response({
        'logs': UserActivityLogSerializer(logs_page, many=True).data,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total_count,
            'pages': (total_count + per_page - 1) // per_page
        },
        'available_actions': [choice[0] for choice in UserActivityLog.ACTION_CHOICES]
    })