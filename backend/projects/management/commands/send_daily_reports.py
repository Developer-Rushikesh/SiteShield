from django.core.management.base import BaseCommand
from django.utils import timezone
from projects.models import ReportSchedule
from projects.services.email_report_service import send_daily_summary_report

class Command(BaseCommand):
    help = "Dispatches daily 9:00 PM website availability & performance reports to users who have enabled the feature."

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force send reports regardless of current time or previous send timestamp today'
        )
        parser.add_argument(
            '--user',
            type=str,
            help='Dispatch only for a specific username or email'
        )

    def handle(self, *args, **options):
        force = options.get('force', False)
        target_user = options.get('user')

        schedules = ReportSchedule.objects.filter(is_enabled=True)
        if target_user:
            schedules = schedules.filter(user__username__iexact=target_user) | schedules.filter(user__email__iexact=target_user)

        self.stdout.write(f"Found {schedules.count()} active daily report schedule(s).")

        sent_count = 0
        error_count = 0
        today = timezone.localdate()

        for schedule in schedules:
            # If not force, check if already sent today
            if not force and schedule.last_sent_at and schedule.last_sent_at.date() == today:
                self.stdout.write(f"Skipping {schedule.user.username} - already sent today at {schedule.last_sent_at}")
                continue

            try:
                success, msg = send_daily_summary_report(schedule, force=force)
                if success:
                    sent_count += 1
                    self.stdout.write(self.style.SUCCESS(f"[SUCCESS] {schedule.user.username}: {msg}"))
                else:
                    error_count += 1
                    self.stdout.write(self.style.WARNING(f"[WARNING] {schedule.user.username}: {msg}"))
            except Exception as e:
                error_count += 1
                self.stdout.write(self.style.ERROR(f"[ERROR] Failed to send report for {schedule.user.username}: {str(e)}"))

        self.stdout.write(self.style.SUCCESS(f"Finished dispatching daily reports. Sent: {sent_count}, Errors: {error_count}"))
