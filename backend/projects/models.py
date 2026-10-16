from django.db import models
from django.contrib.auth.models import User

class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    alert_email = models.EmailField(blank=True, default='', help_text="Particular email address to receive immediate Red Alert emails when this website goes down.")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    def get_alert_recipient_email(self):
        """
        Returns the particular email address to notify when this project/website goes down.
        Order of priority:
        1. Project-specific alert_email (if set)
        2. User's ReportSchedule.recipient_email (if set)
        3. User's account email
        """
        if self.alert_email and self.alert_email.strip():
            return self.alert_email.strip()
        try:
            if hasattr(self.user, 'report_schedule') and self.user.report_schedule.recipient_email:
                schedule_email = self.user.report_schedule.recipient_email.strip()
                if schedule_email:
                    return schedule_email
        except Exception:
            pass
        return self.user.email


class ReportSchedule(models.Model):
    """
    User preference for automated daily performance reports sent at 9:00 PM and alerts.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='report_schedule')
    is_enabled = models.BooleanField(default=False)
    send_down_alerts = models.BooleanField(default=True, help_text="Dispatch immediate Red Alert email when website goes down.")
    recipient_email = models.EmailField(blank=True, default='', help_text="Specific email to receive the report & red alerts. Defaults to user's account email if blank.")
    scheduled_time = models.CharField(max_length=10, default="21:00", help_text="Daily time to send report (default 21:00 / 9 PM)")
    include_all_projects = models.BooleanField(default=True)
    selected_projects = models.ManyToManyField(Project, blank=True, related_name='scheduled_reports')
    last_sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        status = "Active" if self.is_enabled else "Disabled"
        email = self.recipient_email or self.user.email
        return f"Daily 9PM Report for {self.user.username} -> {email} ({status})"

    def get_effective_email(self):
        return (self.recipient_email.strip() if self.recipient_email else '') or self.user.email


class ReportEmailLog(models.Model):
    """
    Log of sent email reports and red alerts for auditing and history.
    """
    REPORT_TYPES = [
        ('DAILY_9PM', 'Daily 9:00 PM Scheduled Report'),
        ('ANALYTICS_REPORT', 'On-Demand Analytics Report'),
        ('PROJECT_AUDIT', 'On-Demand Project Audit Report'),
        ('RED_ALERT_DOWN', 'Website Down Red Alert'),
        ('ALERT_RECOVERED', 'Website Recovered Alert'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_report_logs')
    recipient_email = models.EmailField()
    report_type = models.CharField(max_length=50, choices=REPORT_TYPES, default='DAILY_9PM')
    subject = models.CharField(max_length=255)
    project = models.ForeignKey(Project, null=True, blank=True, on_delete=models.SET_NULL, related_name='sent_reports')
    status = models.CharField(max_length=20, default='SENT')
    error_message = models.TextField(blank=True, default='')
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f"[{self.status}] {self.report_type} to {self.recipient_email} at {self.sent_at}"
