from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.conf import settings
from zoneinfo import ZoneInfo
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class User(AbstractUser):
    """Custom User Model with role-based access and export limits"""
    
    email = models.EmailField(
        unique=True,
        verbose_name='Email Address',
        help_text='Email address (must be unique)'
    )

    USER_TYPES = [
        ('user', 'User'),
        ('admin', 'Admin'),
        ('superuser', 'Super User')
    ]
    
    # ข้อมูลเพิ่มเติมของผู้ใช้
    user_type = models.CharField(
        max_length=10, 
        choices=USER_TYPES, 
        default='user',
        verbose_name='User Type',
        help_text='ระดับสิทธิ์การใช้งาน'
    )
    
    # เปลี่ยนจากการแปลงเป็นการส่งออก
    daily_export_limit = models.IntegerField(
        default=10,
        validators=[MinValueValidator(1), MaxValueValidator(1000)],
        verbose_name='Daily Export Limit',
        help_text='จำนวนครั้งสูงสุดที่ส่งออกไฟล์ได้ต่อวัน'
    )
    daily_exports_used = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Daily Exports Used'
    )
    last_export_date = models.DateField(
        null=True, 
        blank=True,
        verbose_name='Last Export Date'
    )
    
    # สถิติการใช้งาน
    total_conversions = models.IntegerField(
        default=0,
        verbose_name='Total Conversions'
    )
    total_exports = models.IntegerField(
        default=0,
        verbose_name='Total Exports'
    )
    
    # คำถามความปลอดภัย สำหรับ Password Reset
    security_question_1 = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='Security Question 1',
        help_text='Security question for password recovery'
    )
    security_answer_1 = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='Security Answer 1',
        help_text='Answer for security question 1'
    )
    security_question_2 = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='Security Question 2',
        help_text='Security question for password recovery'
    )
    security_answer_2 = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='Security Answer 2',
        help_text='Answer for security question 2'
    )


    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"
    
    def save(self, *args, **kwargs):
        """Override save method เพื่อ sync user_type กับ Django permissions"""
        # Sync user_type กับ Django built-in permissions
        if self.user_type == 'superuser':
            self.is_superuser = True
            self.is_staff = True
        elif self.user_type == 'admin':
            self.is_superuser = False
            self.is_staff = True  # Admin สามารถเข้า Django admin ได้
        else:  # user_type == 'user'
            self.is_superuser = False
            self.is_staff = False
            
        super().save(*args, **kwargs)

    # Export-related methods
    def reset_daily_exports_if_new_day(self):
        
        """Reset การนับการส่งออกรายวันถ้าเป็นวันใหม่"""
        from zoneinfo import ZoneInfo
        bangkok_tz = ZoneInfo("Asia/Bangkok")
        bangkok_time = timezone.now().astimezone(bangkok_tz)
        today = bangkok_time.date()
        
        if self.last_export_date != today:
            self.daily_exports_used = 0
            self.last_export_date = today
            self.save()

    def can_export_today(self):
        """ตรวจสอบว่าสามารถส่งออกไฟล์ได้อีกหรือไม่"""
        self.reset_daily_exports_if_new_day()
        
        # Admin/Superuser ไม่มีขีดจำกัด
        if self.user_type in ['admin', 'superuser']:
            return True
            
        return self.daily_exports_used < self.daily_export_limit
    
    def increment_export_count(self):
        """เพิ่มจำนวนการส่งออกรายวัน"""
        self.reset_daily_exports_if_new_day()
        self.daily_exports_used += 1
        self.total_exports += 1
        self.save()
    
    def get_remaining_exports_today(self):
        """ดูจำนวนการส่งออกที่เหลือวันนี้"""
        self.reset_daily_exports_if_new_day()
        
        if self.user_type in ['admin', 'superuser']:
            return -1  # ใช้ -1 แทน float('inf') เพื่อให้ JSON serializable
            
        return max(0, self.daily_export_limit - self.daily_exports_used)
    
    def increment_conversion_count(self):
        """เพิ่มจำนวนการแปลงทั้งหมด"""
        self.total_conversions += 1
        self.save()

    def get_remaining_conversions_today(self):
        """ดูจำนวนการแปลงที่เหลือ (สำหรับแสดงใน logs)"""
        # ตอนนี้การแปลงไม่มีขีดจำกัด
        if self.user_type in ['admin', 'superuser']:
            return -1  # ไม่จำกัด
        return -1  # ผู้ใช้ทั่วไปก็ไม่จำกัดการแปลง เฉพาะการส่งออกเท่านั้น

    # Other methods (ไม่เปลี่ยน)
    def is_admin_or_superuser(self):
        """ตรวจสอบว่าเป็น admin หรือ superuser"""
        return self.user_type in ['admin', 'superuser']
    
    def can_manage_users(self):
        """ตรวจสอบว่าสามารถจัดการผู้ใช้ได้หรือไม่"""
        return self.user_type in ['admin', 'superuser']
    
    def can_delete_admin(self):
        """เฉพาะ superuser เท่านั้นที่ลบ admin ได้"""
        return self.user_type == 'superuser'

    #  Security Questions Methods
    def has_security_questions(self):
        """ตรวจสอบว่ามีคำถามความปลอดภัยหรือไม่"""
        return bool(
            self.security_question_1 and self.security_answer_1 and
            self.security_question_2 and self.security_answer_2
        )
    
    def verify_security_answers(self, answer_1, answer_2):
        """ตรวจสอบคำตอบคำถามความปลอดภัย"""
        if not self.has_security_questions():
            return False
        
        # แปลงเป็นตัวพิมพ์เล็กและตัดช่องว่างเพื่อเปรียบเทียบ
        stored_answer_1 = self.security_answer_1.lower().strip()
        stored_answer_2 = self.security_answer_2.lower().strip()
        input_answer_1 = answer_1.lower().strip()
        input_answer_2 = answer_2.lower().strip()
        
        return (stored_answer_1 == input_answer_1 and 
                stored_answer_2 == input_answer_2)
    
    def set_security_questions(self, question_1, answer_1, question_2, answer_2):
        """ตั้งคำถามและคำตอบความปลอดภัย"""
        self.security_question_1 = question_1
        self.security_answer_1 = answer_1.lower().strip()  
        self.security_question_2 = question_2
        self.security_answer_2 = answer_2.lower().strip()  
        self.save()
    
    @classmethod
    def get_predefined_security_questions(cls):
        """รายการคำถามความปลอดภัยที่เตรียมไว้"""
        return [
            "สีที่คุณชอบมากที่สุดคืออะไร?",
            "สัตว์ที่คุณชอบมากที่สุดคืออะไร?",
            "ชื่อโรงเรียนประถมของคุณคืออะไร?",
            "ชื่อจังหวัดที่คุณเกิดคืออะไร?",
            "อาหารโปรดของคุณคืออะไร?",
            "ชื่อหนังที่คุณชอบมากที่สุดคืออะไร?",
            "ชื่อเพลงที่คุณชอบมากที่สุดคืออะไร?",
            "ชื่อเล่นของคุณตอนเด็กคืออะไร?",
            "ศิลปินที่คุณชอบมากที่สุดชื่อว่าอะไร?",
            "ชื่อตำบลที่คุณเกิดคืออะไร?",
            "เกมโปรดของคุณที่ชอบมากที่สุดคือเกมอะไร?"
        ]
    
    

class GuestSession(models.Model):
    """บันทึกการใช้งานของ Guest (ไม่ได้ login)"""
    
    guest_id = models.CharField(
        max_length=36,  #UUID 
        verbose_name='Guest ID',
        help_text='UUID จาก LocalStorage'
    )
    ip_address = models.GenericIPAddressField(
        verbose_name='IP Address',
        help_text='IP Address สำรอง'
    )
    
    # Export limits สำหรับ Guest
    daily_exports_used = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Exports Used Today'
    )
    last_export_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Last Export Date'
    )
    
    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Session Created Date'
    )
    user_agent = models.TextField(
        blank=True,
        null=True,
        verbose_name='User Agent'
    )
    
    class Meta:
        verbose_name = 'Guest Session'
        verbose_name_plural = 'Guest Sessions'
        ordering = ['-last_export_date']
        indexes = [
            models.Index(fields=['guest_id']),
            models.Index(fields=['ip_address']),
            models.Index(fields=['last_export_date']),
        ]
        # Unique constraint: one session per guest_id
        constraints = [
            models.UniqueConstraint(fields=['guest_id'], name='unique_guest_id')
        ]
    
    def __str__(self):
        return f"Guest {self.guest_id[:8]}... (IP: {self.ip_address})"
    
    GUEST_DAILY_LIMIT = 3  # Guest ได้ 3 ครั้งต่อวัน
    
    def reset_daily_exports_if_new_day(self):
        """Reset การนับการส่งออกรายวันถ้าเป็นวันใหม่"""
        from zoneinfo import ZoneInfo
        bangkok_tz = ZoneInfo("Asia/Bangkok")
        bangkok_time = timezone.now().astimezone(bangkok_tz)
        today = bangkok_time.date()
        
        if self.last_export_date != today:
            self.daily_exports_used = 0
            self.last_export_date = today
            self.save()

    def can_export_today(self):
        """ตรวจสอบว่า Guest สามารถส่งออกไฟล์ได้อีกหรือไม่"""
        self.reset_daily_exports_if_new_day()
        return self.daily_exports_used < self.GUEST_DAILY_LIMIT
    
    def increment_export_count(self):
        """เพิ่มจำนวนการส่งออกรายวันสำหรับ Guest"""
        self.reset_daily_exports_if_new_day()
        self.daily_exports_used += 1
        self.save()
    
    def get_remaining_exports_today(self):
        """ดูจำนวนการส่งออกที่เหลือวันนี้สำหรับ Guest"""
        self.reset_daily_exports_if_new_day()
        return max(0, self.GUEST_DAILY_LIMIT - self.daily_exports_used)
    
    @classmethod
    def get_or_create_session(cls, guest_id, ip_address, user_agent=None):
        """หาหรือสร้าง Guest Session ใหม่"""
        try:
            # หาด้วย guest_id ก่อน
            session = cls.objects.get(guest_id=guest_id)
            # อัปเดต IP ถ้าเปลี่ยน
            if session.ip_address != ip_address:
                session.ip_address = ip_address
                session.save()
            return session
        except cls.DoesNotExist:
            # ถ้าไม่เจอ ลองหาด้วย IP
            try:
                session = cls.objects.filter(ip_address=ip_address).first()
                if session:
                    # อัปเดต guest_id ใหม่
                    session.guest_id = guest_id
                    session.save()
                    return session
            except:
                pass
            
            # สร้างใหม่
            return cls.objects.create(
                guest_id=guest_id,
                ip_address=ip_address,
                user_agent=user_agent
            )


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
        ('admin_delete_user', 'ลบผู้ใช้'),
        ('admin_edit_user', 'แก้ไขข้อมูลผู้ใช้'),
        ('admin_promote_user', 'เลื่อนตำแหน่งผู้ใช้'),
        ('admin_view_logs', 'ดูบันทึกการใช้งาน'),
        ('password_reset', 'เปลี่ยนรหัสผ่าน'),  
        ('security_questions_verified', 'ยืนยันคำถามความปลอดภัย'), 
        ('admin_change_password', 'เปลี่ยนรหัสผ่านโดย Admin'),
        ('admin_edit_security_questions', 'แก้ไขคำถามความปลอดภัยโดย Admin'),
        ('profile_email_change', 'เปลี่ยนอีเมล (ผ่านโปรไฟล์)'),
        ('profile_password_change', 'เปลี่ยนรหัสผ่าน (ผ่านโปรไฟล์)'),  
        ('profile_security_questions_change', 'เปลี่ยนคำถามความปลอดภัย (ผ่านโปรไฟล์)'),
    ]
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='activity_logs',
        verbose_name='User'
    )
    action = models.CharField(
        max_length=50, 
        choices=ACTION_CHOICES,
        verbose_name='Action'
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Timestamp',
        db_index=True  
    )
    details = models.JSONField(
        null=True, 
        blank=True,
        verbose_name='Details',
        help_text='ข้อมูลเพิ่มเติม'
    )
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['action', '-timestamp']),
            models.Index(fields=['timestamp']),  
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.get_action_display()} - {self.formatted_timestamp}"
    
    @property
    def formatted_timestamp(self):
        """Format timestamp สำหรับแสดงผลภาษาไทยตามเวลา Bangkok"""
        from zoneinfo import ZoneInfo
        bangkok_tz = ZoneInfo("Asia/Bangkok")
        bangkok_time = self.timestamp.astimezone(bangkok_tz)
        return bangkok_time.strftime('%d/%m/%Y %H:%M:%S')

    @property 
    def time_ago(self):
        """แสดงเวลาที่ผ่านมาตามเวลา Bangkok"""
        from zoneinfo import ZoneInfo
        bangkok_tz = ZoneInfo("Asia/Bangkok")
        
        now_bangkok = timezone.now().astimezone(bangkok_tz)
        timestamp_bangkok = self.timestamp.astimezone(bangkok_tz)
        diff = now_bangkok - timestamp_bangkok
        
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
