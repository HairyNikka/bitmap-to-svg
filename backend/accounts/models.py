from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)  # เชื่อมโยงกับ User
    signup_date = models.DateTimeField(auto_now_add=True)  # วันที่สมัคร

    def __str__(self):
        return self.user.username