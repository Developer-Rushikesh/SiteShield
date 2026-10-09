from rest_framework import serializers
from .models import Monitor, MonitoringRecord, Incident

class MonitorSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    uptime = serializers.SerializerMethodField()
    average_response_time = serializers.SerializerMethodField()
    health_score = serializers.SerializerMethodField()

    class Meta:
        model = Monitor
        fields = [
            'id', 'project', 'project_name', 'name', 'url', 'monitor_type',
            'check_interval', 'timeout', 'is_active', 'current_status',
            'last_checked_at', 'created_at', 'updated_at',
            'uptime', 'average_response_time', 'health_score'
        ]
        read_only_fields = ['id', 'current_status', 'last_checked_at', 'created_at', 'updated_at']

    def validate_url(self, value):
        from urllib.parse import urlparse
        parsed = urlparse(value)
        if parsed.scheme not in ['http', 'https']:
            raise serializers.ValidationError("URL must start with http:// or https://")
        return value

    def get_uptime(self, obj):
        records = obj.records.all()
        if not records.exists():
            return 100.0
        total = records.count()
        up_count = records.filter(status__in=['UP', 'WARNING']).count()
        return round((up_count / total) * 100.0, 2)

    def get_average_response_time(self, obj):
        records = obj.records.filter(status__in=['UP', 'WARNING'])
        if not records.exists():
            return 0
        from django.db.models import Avg
        avg_resp = records.aggregate(Avg('response_time'))['response_time__avg']
        return int(avg_resp) if avg_resp is not None else 0

    def get_health_score(self, obj):
        uptime = self.get_uptime(obj)
        avg_resp = self.get_average_response_time(obj)
        incidents_count = obj.incidents.filter(status='OPEN').count()

        # Simple algorithm to compute health score out of 100
        score = uptime * 0.7
        if avg_resp <= 300:
            score += 30
        elif avg_resp <= 800:
            score += 20
        elif avg_resp <= 1500:
            score += 10
        score -= (incidents_count * 15)
        return max(0, min(100, int(score)))


class MonitoringRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonitoringRecord
        fields = [
            'id', 'monitor', 'checked_at', 'status',
            'http_status_code', 'response_time', 'error_message'
        ]


class IncidentSerializer(serializers.ModelSerializer):
    monitor_name = serializers.CharField(source='monitor.name', read_only=True)
    monitor_url = serializers.CharField(source='monitor.url', read_only=True)

    class Meta:
        model = Incident
        fields = [
            'id', 'monitor', 'monitor_name', 'monitor_url',
            'started_at', 'resolved_at', 'status',
            'reason', 'http_status_code', 'duration', 'created_at'
        ]
