from unittest.mock import patch, MagicMock
from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
import requests
from projects.models import Project, ReportEmailLog
from monitors.models import Monitor, MonitoringRecord
from notifications.models import Notification


@override_settings(
    BREVO_API_KEY='xkeysib-mock-test-key-report-12345',
    BREVO_SENDER_EMAIL='reports@siteshield.io',
    BREVO_SENDER_NAME='SiteShield'
)
class ProjectReportEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='reportowner',
            email='owner@example.com',
            password='testpassword123',
            first_name='Alex',
            last_name='Morgan'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpassword123'
        )

        self.project = Project.objects.create(
            user=self.user,
            name='Production Gateway',
            description='Main gateway cluster'
        )
        self.monitor = Monitor.objects.create(
            project=self.project,
            name='HTTP Gateway',
            url='https://gateway.example.com',
            current_status='UP'
        )
        MonitoringRecord.objects.create(
            monitor=self.monitor,
            status='UP',
            http_status_code=200,
            response_time=145
        )

        # Authenticate client as project owner
        self.client.force_authenticate(user=self.user)

    @patch('requests.post')
    def test_send_project_report_success_via_brevo(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 201
        mock_response.json.return_value = {'messageId': '<test-report-msg-id>'}
        mock_post.return_value = mock_response

        response = self.client.post(
            f'/api/projects/{self.project.id}/send-report/',
            {'email': 'manager@example.com', 'notes': 'Weekly audit inspection'}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('successfully sent', response.data['message'])
        self.assertEqual(response.data['recipient'], 'manager@example.com')

        # Verify Brevo API invocation
        self.assertTrue(mock_post.called)
        call_args, call_kwargs = mock_post.call_args
        self.assertEqual(call_args[0], 'https://api.brevo.com/v3/smtp/email')
        self.assertEqual(call_kwargs['headers']['api-key'], 'xkeysib-mock-test-key-report-12345')
        self.assertEqual(call_kwargs['json']['to'][0]['email'], 'manager@example.com')
        self.assertIn('Production Gateway', call_kwargs['json']['subject'])

        # Verify ReportEmailLog and Notification records
        log = ReportEmailLog.objects.filter(project=self.project).first()
        self.assertIsNotNone(log)
        self.assertEqual(log.status, 'SENT')
        self.assertEqual(log.recipient_email, 'manager@example.com')

        notification = Notification.objects.filter(project=self.project).first()
        self.assertIsNotNone(notification)

    @patch('requests.post')
    def test_send_project_report_defaults_to_user_email(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 201
        mock_response.json.return_value = {'messageId': '<test-report-msg-id>'}
        mock_post.return_value = mock_response

        # Call with no email in payload -> should default to request.user.email
        response = self.client.post(f'/api/projects/{self.project.id}/send-report/', {})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['recipient'], self.user.email)

    @patch('requests.post')
    def test_send_project_report_brevo_failure_returns_500(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.json.return_value = {'message': 'Key not found', 'code': 'unauthorized'}
        mock_post.return_value = mock_response

        response = self.client.post(
            f'/api/projects/{self.project.id}/send-report/',
            {'email': 'manager@example.com'}
        )

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.data)
        # Ensure API key is NEVER leaked in the response
        self.assertNotIn('xkeysib-mock-test-key-report-12345', response.data['error'])

        # Check ReportEmailLog records failure
        log = ReportEmailLog.objects.filter(project=self.project, status='FAILED').first()
        self.assertIsNotNone(log)

    def test_send_project_report_invalid_email_returns_400(self):
        response = self.client.post(
            f'/api/projects/{self.project.id}/send-report/',
            {'email': 'not-an-email'}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_send_project_report_unauthenticated_returns_401(self):
        self.client.logout()
        response = self.client.post(f'/api/projects/{self.project.id}/send-report/', {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_send_project_report_forbidden_for_other_user(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(f'/api/projects/{self.project.id}/send-report/', {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_send_project_report_not_found(self):
        response = self.client.post('/api/projects/999999/send-report/', {})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_send_project_report_non_numeric_id_returns_404(self):
        response = self.client.post('/api/projects/invalid-id/send-report/', {})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
