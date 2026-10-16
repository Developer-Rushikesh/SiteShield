import secrets
from datetime import timedelta
from django.db import models
from django.utils import timezone

class EmailOTP(models.Model):
    PURPOSE_CHOICES = [
        ('REGISTER', 'User Registration'),
        ('RESET_PASSWORD', 'Password Reset'),
    ]

    email = models.EmailField(db_index=True)
    otp_code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default='REGISTER')
    attempts = models.IntegerField(default=0)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', 'purpose']),
        ]

    def __str__(self):
        return f"OTP for {self.email} ({self.purpose}) - Verified: {self.is_verified}"

    def is_expired(self):
        return timezone.now() > self.expires_at

    def is_valid(self):
        return not self.is_verified and not self.is_expired() and self.attempts < 5

    @classmethod
    def generate_otp(cls, email, purpose='REGISTER', validity_minutes=10):
        email_clean = email.lower().strip()
        # Invalidate previous unverified OTPs
        cls.objects.filter(email__iexact=email_clean, purpose=purpose, is_verified=False).delete()
        
        # 6-digit cryptographically secure code
        code = f"{secrets.randbelow(900000) + 100000}"
        expires_at = timezone.now() + timedelta(minutes=validity_minutes)
        return cls.objects.create(
            email=email_clean,
            otp_code=code,
            purpose=purpose,
            expires_at=expires_at
        )
