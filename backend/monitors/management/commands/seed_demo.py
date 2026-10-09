import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.authtoken.models import Token
from projects.models import Project
from monitors.models import Monitor, MonitoringRecord, Incident
from notifications.models import Notification

class Command(BaseCommand):
    help = 'Seeds initial demo user, projects, monitors, records, incidents, and notifications.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding demo data...")

        # 1. Create Demo User
        email = "demo@example.com"
        password = "password123"
        user, created = User.objects.get_or_create(
            username="demo_user",
            defaults={
                'email': email,
                'first_name': 'Demo',
                'last_name': 'Admin'
            }
        )
        user.set_password(password)
        user.save()
        token, _ = Token.objects.get_or_create(user=user)
        self.stdout.write(f"User created: {email} / {password} (Token: {token.key})")

        # 2. Create Projects
        projects_data = [
            {
                'name': 'Khet Saathi',
                'description': 'Smart Agri-tech platform and web service',
                'url': 'https://khet-saathi-wheat.vercel.app'
            },
            {
                'name': 'Portfolio Website',
                'description': 'Personal developer portfolio and showcase',
                'url': 'https://example.com'
            },
            {
                'name': 'Client E-Commerce API',
                'description': 'Backend REST API for online retail client',
                'url': 'https://httpbin.org/status/200'
            },
            {
                'name': 'Legacy Microservice',
                'description': 'Payment gateway callback microservice',
                'url': 'https://httpbin.org/status/500'
            }
        ]

        now = timezone.now()

        for p_info in projects_data:
            project, _ = Project.objects.get_or_create(
                user=user,
                name=p_info['name'],
                defaults={'description': p_info['description']}
            )

            monitor, _ = Monitor.objects.get_or_create(
                project=project,
                name=f"{p_info['name']} Main HTTP",
                defaults={
                    'url': p_info['url'],
                    'check_interval': 5,
                    'timeout': 10,
                    'is_active': True,
                    'current_status': 'UP' if '500' not in p_info['url'] else 'DOWN',
                    'last_checked_at': now
                }
            )

            # Generate 20 historical monitoring records for each monitor
            is_failing_site = '500' in p_info['url']
            for i in range(20):
                checked_time = now - timezone.timedelta(minutes=(20 - i) * 5)
                if is_failing_site and i >= 12:
                    st = 'DOWN'
                    code = 500
                    resp_t = random.randint(1800, 2500)
                    err = "Internal Server Error (HTTP 500)"
                elif i == 5 and not is_failing_site:
                    st = 'WARNING'
                    code = 200
                    resp_t = 1650
                    err = "Slow response detected (1650ms)"
                else:
                    st = 'UP'
                    code = 200
                    resp_t = random.randint(120, 340)
                    err = ''

                MonitoringRecord.objects.create(
                    monitor=monitor,
                    checked_at=checked_time,
                    status=st,
                    http_status_code=code,
                    response_time=resp_t,
                    error_message=err
                )

            # Create Incident if failing site
            if is_failing_site:
                Incident.objects.get_or_create(
                    monitor=monitor,
                    status='OPEN',
                    defaults={
                        'started_at': now - timezone.timedelta(minutes=40),
                        'reason': 'Server returned HTTP 500 Internal Server Error',
                        'http_status_code': 500
                    }
                )
                Notification.objects.create(
                    user=user,
                    project=project,
                    monitor=monitor,
                    type='DOWN',
                    title=f"Website Down: {monitor.name}",
                    message=f"'{monitor.name}' is currently down due to HTTP 500 Internal Server Error."
                )

            # Create resolved incident history for Khet Saathi
            if p_info['name'] == 'Khet Saathi':
                inc, created = Incident.objects.get_or_create(
                    monitor=monitor,
                    reason='Temporary network timeout',
                    defaults={
                        'started_at': now - timezone.timedelta(days=2, hours=3),
                        'resolved_at': now - timezone.timedelta(days=2, hours=2, minutes=45),
                        'status': 'RESOLVED',
                        'http_status_code': 504,
                        'duration': 15
                    }
                )
                Notification.objects.create(
                    user=user,
                    project=project,
                    monitor=monitor,
                    type='RECOVERED',
                    title=f"Website Recovered: {monitor.name}",
                    message=f"'{monitor.name}' is back online. All checks passing."
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded demo data!"))
