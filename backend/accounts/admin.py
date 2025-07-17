from django.contrib import admin
from django.contrib.auth.models import User
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'signup_date')  # แสดงข้อมูลที่ต้องการ
    list_filter = ('signup_date',)  # กรองข้อมูลตามวันที่สมัคร
    search_fields = ('user_username',)  # ค้นหาตามชื่อผู้ใช้
    ordering = ('signup_date',)  # เรียงข้อมูลตามวันที่สมัคร