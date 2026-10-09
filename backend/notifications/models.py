from django.db import models
from django.contrib.auth.models import User
from projects.models import Project
from monitors.models import Monitor

class Notification(models.Model):
    TYPE_CHOICES = [
        ('DOWN', 'Website Down'),
        ('RECOVERED', 'Website Recovered'),
        ('SLOW', 'Slow Response'),
        ('SYSTEM', 'System Notification'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    monitor = models.ForeignKey(Monitor, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='SYSTEM')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification ({self.type}): {self.title} for {self.user.username}"
