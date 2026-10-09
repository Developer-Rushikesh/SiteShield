from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True, default='')
    monitor_name = serializers.CharField(source='monitor.name', read_only=True, default='')

    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'project', 'project_name', 'monitor', 'monitor_name',
            'type', 'title', 'message', 'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']
