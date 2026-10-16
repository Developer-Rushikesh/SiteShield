from unittest.mock import patch, MagicMock
from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
import requests
from users.models import EmailOTP
from users.email_service import send_brevo_transactional_email, send_otp_email


class UserAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_user(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'password123',
            'name': 'Test User'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(User.objects.count(), 1)

    def test_login_user(self):
        User.objects.create_user(username='loginuser', email='login@example.com', password='password123')
        response = self.client.post('/api/auth/login/', {
            'email': 'login@example.com',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)


@override_settings(
    BREVO_API_KEY='xkeysib-mock-test-key-12345',
    BREVO_SENDER_EMAIL='noreply@siteshield.io',
    BREVO_SENDER_NAME='SiteShield'
)
class BrevoOTPTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.test_email = 'newuser@example.com'

    @patch('requests.post')
    def test_send_register_otp_success(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 201
        mock_response.json.return_value = {'messageId': '<test-msg-id-123>'}
        mock_post.return_value = mock_response

        response = self.client.post('/api/auth/send-register-otp/', {
            'email': self.test_email,
            'name': 'John Doe'
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('email'), self.test_email)
        self.assertEqual(response.data.get('cooldown_seconds'), 60)

        # Verify Brevo API was called via HTTPS
        self.assertTrue(mock_post.called)
        call_args, call_kwargs = mock_post.call_args
        self.assertEqual(call_args[0], 'https://api.brevo.com/v3/smtp/email')
        self.assertEqual(call_kwargs['headers']['api-key'], 'xkeysib-mock-test-key-12345')
        self.assertEqual(call_kwargs['json']['sender']['email'], 'noreply@siteshield.io')
        self.assertEqual(call_kwargs['json']['to'][0]['email'], self.test_email)

        # Verify OTP record created
        otp_record = EmailOTP.objects.filter(email=self.test_email).first()
        self.assertIsNotNone(otp_record)
        self.assertFalse(otp_record.is_verified)
        self.assertEqual(len(otp_record.otp_code), 6)

    @patch('requests.post')
    def test_send_register_otp_cooldown(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 201
        mock_response.json.return_value = {'messageId': '<test-msg-id>'}
        mock_post.return_value = mock_response

        # First request succeeds
        res1 = self.client.post('/api/auth/send-register-otp/', {'email': self.test_email})
        self.assertEqual(res1.status_code, status.HTTP_200_OK)

        # Second immediate request should hit 429 cooldown
        res2 = self.client.post('/api/auth/send-register-otp/', {'email': self.test_email})
        self.assertEqual(res2.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertIn('cooldown_remaining', res2.data)

    @patch('requests.post')
    def test_send_register_otp_brevo_api_failure(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.json.return_value = {'message': 'Key not found', 'code': 'unauthorized'}
        mock_post.return_value = mock_response

        response = self.client.post('/api/auth/send-register-otp/', {'email': self.test_email})
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('Failed to send verification email', response.data['detail'])
        # Ensure API key is NOT exposed
        self.assertNotIn('xkeysib-mock-test-key-12345', response.data['detail'])

    @patch('requests.post')
    def test_send_register_otp_timeout_handling(self, mock_post):
        mock_post.side_effect = requests.exceptions.Timeout("Connection timed out")

        response = self.client.post('/api/auth/send-register-otp/', {'email': self.test_email})
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('timed out', response.data['detail'])

    @override_settings(BREVO_API_KEY='')
    def test_missing_brevo_api_key_raises_error(self):
        with self.assertRaises(ValueError):
            send_brevo_transactional_email(
                to_email='user@example.com',
                subject='Test',
                html_content='<p>Test</p>'
            )

    def test_verify_register_otp_success_and_login(self):
        otp_record = EmailOTP.generate_otp(self.test_email, purpose='REGISTER')

        response = self.client.post('/api/auth/verify-register-otp/', {
            'email': self.test_email,
            'name': 'Jane Doe',
            'password': 'strongpassword123',
            'otp': otp_record.otp_code
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['email'], self.test_email)

        # Check DB user created and OTP marked verified
        self.assertTrue(User.objects.filter(email=self.test_email).exists())
        otp_record.refresh_from_db()
        self.assertTrue(otp_record.is_verified)

    def test_verify_register_otp_invalid_code(self):
        EmailOTP.generate_otp(self.test_email, purpose='REGISTER')

        response = self.client.post('/api/auth/verify-register-otp/', {
            'email': self.test_email,
            'name': 'Jane Doe',
            'password': 'strongpassword123',
            'otp': '999999'  # Wrong code
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid verification code', response.data['otp'][0])
