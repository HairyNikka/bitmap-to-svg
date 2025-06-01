from django.urls import path
from .views import RegisterView, UserView
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # ✅ Login
    path('user/', UserView.as_view(), name='user'),
]
