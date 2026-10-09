from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

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
        user = User.objects.create_user(username='loginuser', email='login@example.com', password='password123')
        response = self.client.post('/api/auth/login/', {
            'email': 'login@example.com',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
