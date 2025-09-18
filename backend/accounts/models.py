from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.conf import settings
from zoneinfo import ZoneInfo
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class User(AbstractUser):
    """Custom User Model with role-based access and export limits"""
    
    USER_TYPES = [
        ('user', 'ผู้ใช้ทั่วไป'),
        ('admin', 'ผู้ดูแลระบบ'),
        ('superuser', 'ซุปเปอร์ยูสเซอร์')
    ]
    
    # ข้อมูลเพิ่มเติมของผู้ใช้
    user_type = models.CharField(
        max_length=10, 
        choices=USER_TYPES, 
        default='user',
        verbose_name='ประเภทผู้ใช้',
        help_text='ระดับสิทธิ์การใช้งาน'
    )
    
    # 🔄 เปลี่ยนจากการแปลงเป็นการส่งออก
    daily_export_limit = models.IntegerField(
        default=10,  # เปลี่ยนจาก 50 เป็น 10 สำหรับ user ปกติ
        validators=[MinValueValidator(1), MaxValueValidator(1000)],
        verbose_name='จำกัดการส่งออกต่อวัน',
        help_text='จำนวนครั้งสูงสุดที่ส่งออกไฟล์ได้ต่อวัน'
    )
    daily_exports_used = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='จำนวนการส่งออกที่ใช้วันนี้'
    )
    last_export_date = models.DateField(
        null=True, 
        blank=True,
        verbose_name='วันที่ส่งออกครั้งล่าสุด'
    )
    
    # ⚠️ เก็บ conversion fields ไว้ก่อน (backward compatibility)
    daily_conversion_limit = models.IntegerField(
        default=50,
        validators=[MinValueValidator(1), MaxValueValidator(1000)],
        verbose_name='จำกัดการแปลงต่อวัน (เก่า)',
        help_text='เก็บไว้เพื่อ backward compatibility'
    )
    daily_conversions_used = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='จำนวนการแปลงที่ใช้วันนี้ (เก่า)'
    )
    last_conversion_date = models.DateField(
        null=True, 
        blank=True,
        verbose_name='วันที่แปลงครั้งล่าสุด (เก่า)'
    )
    
    # สถิติการใช้งาน
    total_conversions = models.IntegerField(
        default=0,
        verbose_name='จำนวนการแปลงทั้งหมด'
    )
    total_exports = models.IntegerField(
        default=0,
        verbose_name='จำนวนการส่งออกทั้งหมด'
    )
    
    # 🔐 Security Questions สำหรับ Password Reset
    security_question_1 = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='คำถามความปลอดภัยข้อ 1',
        help_text='คำถามสำหรับรีเซ็ตรหัสผ่าน'
    )
    security_answer_1 = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='คำตอบคำถามข้อ 1',
        help_text='คำตอบสำหรับคำถามข้อ 1 (จะถูกแปลงเป็นตัวพิมพ์เล็ก)'
    )
    security_question_2 = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='คำถามความปลอดภัยข้อ 2',
        help_text='คำถามสำหรับรีเซ็ตรหัสผ่าน'
    )
    security_answer_2 = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='คำตอบคำถามข้อ 2',
        help_text='คำตอบสำหรับคำถามข้อ 2 (จะถูกแปลงเป็นตัวพิมพ์เล็ก)'
    )


    class Meta:
        verbose_name = 'ผู้ใช้'
        verbose_name_plural = 'ผู้ใช้'
        ordering = ['-date_joined']
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"
    
    # 🔄 Export-related methods (ใหม่)
    def reset_daily_exports_if_new_day(self):
        """Reset การนับการส่งออกรายวันถ้าเป็นวันใหม่"""
        
        # ✅ ใช้ zoneinfo สำหรับ Python 3.11
        from zoneinfo import ZoneInfo
        bangkok_tz = ZoneInfo("Asia/Bangkok")
        bangkok_time = timezone.now().astimezone(bangkok_tz)
        today = bangkok_time.date()
        
        # ✅ Debug logs - ไม่มี emoji
        print(f"DEBUG Reset Check - {self.username}:")
        print(f"   UTC time: {timezone.now()}")
        print(f"   Bangkok time: {bangkok_time}")
        print(f"   Today (Bangkok): {today}")
        print(f"   Last export date: {self.last_export_date}")
        print(f"   Current exports used: {self.daily_exports_used}")
        
        if self.last_export_date != today:
            print(f"RESET! Different date detected")
            old_used = self.daily_exports_used
            self.daily_exports_used = 0
            self.last_export_date = today
            self.save()
            print(f"   Reset exports: {old_used} -> 0")
        else:
            print(f"No reset - same date")
        
        print(f"   Final exports used: {self.daily_exports_used}")
        print("=" * 50)
    
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
            return -1  # ✅ ใช้ -1 แทน float('inf') เพื่อให้ JSON serializable
            
        return max(0, self.daily_export_limit - self.daily_exports_used)
    
    # ⚠️ เก็บ conversion methods เดิมไว้ (backward compatibility)
    def reset_daily_conversions_if_new_day(self):
        """Reset การนับรายวันถ้าเป็นวันใหม่"""
        today = timezone.now().date()
        if self.last_conversion_date != today:
            self.daily_conversions_used = 0
            self.last_conversion_date = today
            self.save()
    
    def can_convert_today(self):
        """ตรวจสอบว่าสามารถแปลงภาพได้อีกหรือไม่ (เก่า)"""
        # ตอนนี้การแปลงไม่มีขีดจำกัดแล้ว เฉพาะการส่งออกเท่านั้น
        return True
    
    def increment_conversion_count(self):
        """เพิ่มจำนวนการแปลงรายวัน (เก่า)"""
        self.reset_daily_conversions_if_new_day()
        self.daily_conversions_used += 1
        self.total_conversions += 1
        self.save()
    
    def get_remaining_conversions_today(self):
        """ดูจำนวนการแปลงที่เหลือวันนี้ (เก่า)"""
        # ส่งค่าไม่จำกัดเพราะไม่ได้ใช้แล้ว
        return -1  # ✅ ใช้ -1 แทน float('inf')
    
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

    # 🔐 Security Questions Methods
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
        self.security_answer_1 = answer_1.lower().strip()  # เก็บเป็นตัวพิมพ์เล็ก
        self.security_question_2 = question_2
        self.security_answer_2 = answer_2.lower().strip()  # เก็บเป็นตัวพิมพ์เล็ก
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
        max_length=36,  # UUID length
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
        verbose_name='จำนวนการส่งออกที่ใช้วันนี้'
    )
    last_export_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='วันที่ส่งออกครั้งล่าสุด'
    )
    
    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='วันที่สร้าง session'
    )
    last_activity = models.DateTimeField(
        auto_now=True,
        verbose_name='กิจกรรมล่าสุด'
    )
    user_agent = models.TextField(
        blank=True,
        null=True,
        verbose_name='User Agent'
    )
    
    class Meta:
        verbose_name = 'Guest Session'
        verbose_name_plural = 'Guest Sessions'
        ordering = ['-last_activity']
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
        
        # ✅ ใช้ zoneinfo สำหรับ Python 3.11
        from zoneinfo import ZoneInfo
        bangkok_tz = ZoneInfo("Asia/Bangkok")
        bangkok_time = timezone.now().astimezone(bangkok_tz)
        today = bangkok_time.date()
        
        # ✅ Debug logs - ไม่มี emoji
        print(f"DEBUG Reset Check - Guest {self.guest_id[:8]}:")
        print(f"   UTC time: {timezone.now()}")
        print(f"   Bangkok time: {bangkok_time}")
        print(f"   Today (Bangkok): {today}")
        print(f"   Last export date: {self.last_export_date}")
        print(f"   Current exports used: {self.daily_exports_used}")
        
        if self.last_export_date != today:
            print(f"RESET! Different date detected")
            old_used = self.daily_exports_used
            self.daily_exports_used = 0
            self.last_export_date = today
            self.save()
            print(f"   Reset exports: {old_used} -> 0")
        else:
            print(f"No reset - same date")
        
        print(f"   Final exports used: {self.daily_exports_used}")
        print("=" * 50)
    
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