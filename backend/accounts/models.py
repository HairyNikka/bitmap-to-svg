from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    """Custom User Model with role-based access and conversion limits"""
    
    USER_TYPES = [
        ('user', 'ผู้ใช้ทั่วไป'),
        ('admin', 'ผู้ดูแลระบบ'),
        ('superuser', 'ผู้ดูแลระบบสูงสุด')
    ]
    
    # ข้อมูลเพิ่มเติมของผู้ใช้
    user_type = models.CharField(
        max_length=10, 
        choices=USER_TYPES, 
        default='user',
        verbose_name='ประเภทผู้ใช้',
        help_text='ระดับสิทธิ์การใช้งาน'
    )
    
    # ระบบจำกัดการใช้งานรายวัน
    daily_conversion_limit = models.IntegerField(
        default=50,
        validators=[MinValueValidator(1), MaxValueValidator(1000)],
        verbose_name='จำกัดการแปลงต่อวัน',
        help_text='จำนวนครั้งสูงสุดที่แปลงภาพได้ต่อวัน'
    )
    daily_conversions_used = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='จำนวนการแปลงที่ใช้วันนี้'
    )
    last_conversion_date = models.DateField(
        null=True, 
        blank=True,
        verbose_name='วันที่แปลงครั้งล่าสุด'
    )
    
    # สถิติการใช้งาน
    total_conversions = models.IntegerField(
        default=0,
        verbose_name='จำนวนการแปลงทั้งหมด'
    )
    
    class Meta:
        verbose_name = 'ผู้ใช้'
        verbose_name_plural = 'ผู้ใช้'
        ordering = ['-date_joined']
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"
    
    def reset_daily_conversions_if_new_day(self):
        """Reset การนับรายวันถ้าเป็นวันใหม่"""
        today = timezone.now().date()
        if self.last_conversion_date != today:
            self.daily_conversions_used = 0
            self.last_conversion_date = today
            self.save()
    
    def can_convert_today(self):
        """ตรวจสอบว่าสามารถแปลงภาพได้อีกหรือไม่"""
        self.reset_daily_conversions_if_new_day()
        
        # Superuser ไม่มีขีดจำกัด
        if self.user_type == 'superuser':
            return True
            
        return self.daily_conversions_used < self.daily_conversion_limit
    
    def increment_conversion_count(self):
        """เพิ่มจำนวนการแปลงรายวัน"""
        self.reset_daily_conversions_if_new_day()
        self.daily_conversions_used += 1
        self.total_conversions += 1
        self.save()
    
    def get_remaining_conversions_today(self):
        """ดูจำนวนการแปลงที่เหลือวันนี้"""
        self.reset_daily_conversions_if_new_day()
        
        if self.user_type == 'superuser':
            return float('inf')  # ไม่จำกัด
            
        return max(0, self.daily_conversion_limit - self.daily_conversions_used)
    
    def is_admin_or_superuser(self):
        """ตรวจสอบว่าเป็น admin หรือ superuser"""
        return self.user_type in ['admin', 'superuser']
    
    def can_manage_users(self):
        """ตรวจสอบว่าสามารถจัดการผู้ใช้ได้หรือไม่"""
        return self.user_type in ['admin', 'superuser']
    
    def can_delete_admin(self):
        """เฉพาะ superuser เท่านั้นที่ลบ admin ได้"""
        return self.user_type == 'superuser'


class UserActivityLog(models.Model):
    """บันทึกการใช้งานของผู้ใช้แต่ละคน"""
    
    ACTION_CHOICES = [
        ('register', 'สมัครสมาชิก'),
        ('login', 'เข้าสู่ระบบ'),
        ('logout', 'ออกจากระบบ'),
        ('upload_image', 'อัปโหลดภาพ'),
        ('convert_image', 'แปลงภาพ'),
        ('export_png', 'ส่งออก PNG'),
        ('export_svg', 'ส่งออก SVG'),
        ('export_pdf', 'ส่งออก PDF'),
        ('export_eps', 'ส่งออก EPS'),
        ('admin_create_user', 'สร้างผู้ใช้ใหม่'),
        ('admin_delete_user', 'ลบผู้ใช้'),
        ('admin_edit_user', 'แก้ไขข้อมูลผู้ใช้'),
        ('admin_promote_user', 'เลื่อนตำแหน่งผู้ใช้'),
        ('admin_view_logs', 'ดูบันทึกการใช้งาน'),
    ]
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='activity_logs',
        verbose_name='ผู้ใช้'
    )
    action = models.CharField(
        max_length=30, 
        choices=ACTION_CHOICES,
        verbose_name='การกระทำ'
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name='เวลา',
        db_index=True  # เพิ่ม index สำหรับการค้นหา
    )
    details = models.JSONField(
        null=True, 
        blank=True,
        verbose_name='รายละเอียดเพิ่มเติม',
        help_text='ข้อมูลเพิ่มเติม เช่น ชื่อไฟล์ภาพที่แปลง, ขนาดไฟล์'
    )
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'บันทึกการใช้งาน'
        verbose_name_plural = 'บันทึกการใช้งาน'
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['action', '-timestamp']),
            models.Index(fields=['timestamp']),  # สำหรับการค้นหาตามช่วงเวลา
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.get_action_display()} - {self.formatted_timestamp}"
    
    @property
    def formatted_timestamp(self):
        """Format timestamp สำหรับแสดงผลภาษาไทย"""
        return self.timestamp.strftime('%d/%m/%Y %H:%M:%S')
    
    @property 
    def time_ago(self):
        """แสดงเวลาที่ผ่านมา"""
        now = timezone.now()
        diff = now - self.timestamp
        
        if diff.days > 0:
            return f"{diff.days} วันที่แล้ว"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} ชั่วโมงที่แล้ว"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} นาทีที่แล้ว"
        else:
            return "เมื่อสักครู่"
    
    def get_device_info(self):
        """แยกข้อมูล device จาก user agent"""
        if not self.user_agent:
            return "ไม่ทราบ"
        
        ua = self.user_agent.lower()
        if 'mobile' in ua or 'android' in ua or 'iphone' in ua:
            return "มือถือ"
        elif 'tablet' in ua or 'ipad' in ua:
            return "แท็บเล็ต"
        else:
            return "คอมพิวเตอร์"


class SystemLog(models.Model):
    """บันทึกการทำงานของระบบโดยรวม"""
    
    LOG_LEVELS = [
        ('info', 'ข้อมูล'),
        ('warning', 'คำเตือน'),
        ('error', 'ข้อผิดพลาด'),
        ('critical', 'ร้ายแรง'),
    ]
    
    level = models.CharField(
        max_length=10,
        choices=LOG_LEVELS,
        default='info',
        verbose_name='ระดับ'
    )
    message = models.TextField(
        verbose_name='ข้อความ'
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name='เวลา'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='ผู้ใช้ที่เกี่ยวข้อง'
    )
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'บันทึกระบบ'
        verbose_name_plural = 'บันทึกระบบ'
    
    def __str__(self):
        return f"[{self.get_level_display()}] {self.message[:50]}... - {self.timestamp.strftime('%d/%m/%Y %H:%M')}"