from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),  #รวม core.urls

    # 🔐 Auth API
    path('api/', include('accounts.urls')),  # /api/register/, /api/user/

    # 🔑 JWT Token endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),      # login
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),     # refresh
]
