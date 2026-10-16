from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    CurrentUserView,
    ChangePasswordView,
    ForgotPasswordView,
    ResetPasswordView,
    SendRegisterOTPView,
    VerifyRegisterOTPView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('send-register-otp/', SendRegisterOTPView.as_view(), name='auth_send_register_otp'),
    path('resend-register-otp/', SendRegisterOTPView.as_view(), name='auth_resend_register_otp'),
    path('verify-register-otp/', VerifyRegisterOTPView.as_view(), name='auth_verify_register_otp'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('me/', CurrentUserView.as_view(), name='auth_me'),
    path('change-password/', ChangePasswordView.as_view(), name='auth_change_password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='auth_forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='auth_reset_password'),
]
