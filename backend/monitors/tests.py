from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from projects.models import Project
from monitors.models import Monitor, MonitoringRecord, Incident
from notifications.models import Notification
from monitors.services.monitoring_service import validate_url_security, check_website

class MonitoringSystemTests(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', email='u1@example.com', password='password123')
        self.user2 = User.objects.create_user(username='user2', email='u2@example.com', password='password123')
        
        self.token1 = Token.objects.create(user=self.user1)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1.key)

        self.project1 = Project.objects.create(user=self.user1, name="Project 1")
        self.project2 = Project.objects.create(user=self.user2, name="Project 2")

    def test_ssrf_url_validation(self):
        with self.assertRaises(ValueError):
            validate_url_security('http://127.0.0.1/admin')
        with self.assertRaises(ValueError):
            validate_url_security('http://localhost:8000')
        with self.assertRaises(ValueError):
            validate_url_security('ftp://example.com')

    def test_user_isolation(self):
        # User 1 should see Project 1, but NOT Project 2
        response = self.client.get('/api/projects/')
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.project1.id)

    def test_monitor_creation(self):
        response = self.client.post('/api/monitors/', {
            'project': self.project1.id,
            'name': 'Google Check',
            'url': 'https://google.com',
            'check_interval': 5,
            'timeout': 10
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Monitor.objects.count(), 1)

    def test_incident_creation_and_resolution(self):
        monitor = Monitor.objects.create(
            project=self.project1,
            name='Test Site',
            url='https://example.com/unreachable',
            check_interval=5,
            timeout=5
        )

        # Simulate DOWN check
        from monitors.services.monitoring_service import _record_and_update
        from django.utils import timezone
        now = timezone.now()

        _record_and_update(monitor, 'DOWN', 500, 200, 'Server Error 500', now)
        self.assertEqual(Incident.objects.filter(monitor=monitor, status='OPEN').count(), 1)
        self.assertEqual(Notification.objects.filter(monitor=monitor, type='DOWN').count(), 1)

        # Repeat DOWN check -> Should NOT create second open incident
        _record_and_update(monitor, 'DOWN', 500, 220, 'Server Error 500', now + timezone.timedelta(minutes=5))
        self.assertEqual(Incident.objects.filter(monitor=monitor, status='OPEN').count(), 1)

        # Recovery UP check -> Should RESOLVE incident and send RECOVERED notification
        _record_and_update(monitor, 'UP', 200, 180, '', now + timezone.timedelta(minutes=10))
        self.assertEqual(Incident.objects.filter(monitor=monitor, status='OPEN').count(), 0)
        self.assertEqual(Incident.objects.filter(monitor=monitor, status='RESOLVED').count(), 1)
        self.assertEqual(Notification.objects.filter(monitor=monitor, type='RECOVERED').count(), 1)
