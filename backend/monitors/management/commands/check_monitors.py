from django.core.management.base import BaseCommand
from monitors.models import Monitor
from monitors.services.monitoring_service import check_website

class Command(BaseCommand):
    help = 'Executes HTTP monitoring check for all active monitors.'

    def handle(self, *args, **options):
        active_monitors = Monitor.objects.filter(is_active=True)
        count = active_monitors.count()
        self.stdout.write(f"Checking {count} active monitor(s)...")

        for monitor in active_monitors:
            self.stdout.write(f"Checking {monitor.name} ({monitor.url})...")
            try:
                record = check_website(monitor)
                self.stdout.write(self.style.SUCCESS(
                    f"-> {monitor.name}: Status={record.status}, HTTP={record.http_status_code}, Time={record.response_time}ms"
                ))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"-> Error checking {monitor.name}: {str(e)}"))

        self.stdout.write(self.style.SUCCESS("Finished checking monitors."))
