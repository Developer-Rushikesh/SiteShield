from django.db import models
from projects.models import Project

class Monitor(models.Model):
    STATUS_CHOICES = [
        ('UP', 'UP'),
        ('DOWN', 'DOWN'),
        ('WARNING', 'WARNING'),
        ('PAUSED', 'PAUSED'),
        ('PENDING', 'PENDING'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='monitors')
    name = models.CharField(max_length=255)
    url = models.URLField(max_length=500)
    monitor_type = models.CharField(max_length=50, default='HTTP')
    check_interval = models.IntegerField(default=5, help_text="Check interval in minutes")
    timeout = models.IntegerField(default=10, help_text="Timeout in seconds")
    is_active = models.BooleanField(default=True)
    current_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    last_checked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.url} ({self.current_status})"


class MonitoringRecord(models.Model):
    STATUS_CHOICES = [
        ('UP', 'UP'),
        ('DOWN', 'DOWN'),
        ('WARNING', 'WARNING'),
    ]

    monitor = models.ForeignKey(Monitor, on_delete=models.CASCADE, related_name='records')
    checked_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    http_status_code = models.IntegerField(null=True, blank=True)
    response_time = models.IntegerField(default=0, help_text="Response time in milliseconds")
    error_message = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-checked_at']

    def __str__(self):
        return f"Record {self.monitor.name} at {self.checked_at}: {self.status}"


class Incident(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'OPEN'),
        ('RESOLVED', 'RESOLVED'),
    ]

    monitor = models.ForeignKey(Monitor, on_delete=models.CASCADE, related_name='incidents')
    started_at = models.DateTimeField()
    resolved_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    reason = models.TextField()
    http_status_code = models.IntegerField(null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True, help_text="Downtime duration in minutes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"Incident #{self.id} for {self.monitor.name} ({self.status})"
