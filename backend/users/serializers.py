from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'name']

    def get_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name if name else obj.username

class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'name']
        extra_kwargs = {
            'username': {'required': False, 'allow_blank': True},
            'email': {'required': True}
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        name = validated_data.pop('name', '')
        email = validated_data['email']
        username = validated_data.get('username') or email

        # Split name into first_name, last_name
        parts = name.strip().split(' ', 1)
        first_name = parts[0] if parts else ''
        last_name = parts[1] if len(parts) > 1 else ''

        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        raw_identifier = attrs.get('email', '') or attrs.get('username', '')
        raw_identifier = raw_identifier.strip()
        password = attrs.get('password', '')

        if not raw_identifier or not password:
            raise serializers.ValidationError("Email/Username and password are required.")

        # Case-insensitive lookup by email or username
        user_obj = User.objects.filter(email__iexact=raw_identifier).first() or \
                   User.objects.filter(username__iexact=raw_identifier).first()

        user = None
        if user_obj:
            user = authenticate(username=user_obj.username, password=password)
        else:
            user = authenticate(username=raw_identifier, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")

        attrs['user'] = user
        return attrs

