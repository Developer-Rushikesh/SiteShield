from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            user_data = UserSerializer(user).data
            return Response({
                'token': token.key,
                'user': user_data,
                'message': 'Registration successful'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            token, _ = Token.objects.get_or_create(user=user)
            user_data = UserSerializer(user).data
            return Response({
                'token': token.key,
                'user': user_data,
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
        except Exception:
            pass
        logout(request)
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        user = request.user
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip()

        if name:
            parts = name.split(' ', 1)
            user.first_name = parts[0]
            user.last_name = parts[1] if len(parts) > 1 else ''

        if email and email.lower() != user.email.lower():
            if User.objects.filter(email__iexact=email).exclude(pk=user.pk).exists():
                return Response({'email': ['This email is already in use by another account.']}, status=status.HTTP_400_BAD_REQUEST)
            user.email = email

        user.save()
        return Response({
            'message': 'Profile updated successfully!',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password', '').strip() or request.data.get('old_password', '').strip()
        new_password = request.data.get('new_password', '').strip() or request.data.get('password', '').strip()

        if not current_password or not new_password:
            return Response({'detail': 'Current password and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(current_password):
            return Response({'current_password': ['Current password is incorrect.']}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({'new_password': ['New password must be at least 6 characters long.']}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        # Keep or renew auth token
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'message': 'Password changed successfully!',
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get('email', '').strip() or request.data.get('username', '').strip()
        if not identifier:
            return Response({'email': ['Email or username is required.']}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=identifier).first() or User.objects.filter(username__iexact=identifier).first()
        if not user:
            return Response({'email': ['No account registered with this email/username.']}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'message': f'Password reset request verified for {user.email or user.username}. You may now reset your password.',
            'email': user.email or user.username
        }, status=status.HTTP_200_OK)

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get('email', '').strip() or request.data.get('username', '').strip()
        new_password = request.data.get('new_password', '').strip() or request.data.get('password', '').strip()

        if not identifier or not new_password:
            return Response({'detail': 'Email/username and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({'password': ['Password must be at least 6 characters long.']}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=identifier).first() or User.objects.filter(username__iexact=identifier).first()
        if not user:
            return Response({'email': ['No account found with this email/username.']}, status=status.HTTP_404_NOT_FOUND)

        user.set_password(new_password)
        user.save()

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'message': 'Password updated successfully!',
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
