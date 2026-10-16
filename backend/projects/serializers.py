from django.db import models
from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    url = serializers.CharField(write_only=True, required=False, allow_blank=True)
    check_interval = serializers.IntegerField(required=False, default=5)
    timeout = serializers.IntegerField(required=False, default=10)

    monitor_id = serializers.SerializerMethodField()
    monitors_count = serializers.SerializerMethodField()
    healthy_count = serializers.SerializerMethodField()
    down_count = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    uptime = serializers.SerializerMethodField()
    average_response_time = serializers.SerializerMethodField()
    latest_response_time = serializers.SerializerMethodField()
    latest_http_status = serializers.SerializerMethodField()
    downtime_minutes = serializers.SerializerMethodField()
    health_score = serializers.SerializerMethodField()
    total_checks = serializers.SerializerMethodField()
    incidents_count = serializers.SerializerMethodField()
    website_url = serializers.SerializerMethodField()
    last_checked = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'alert_email', 'is_active', 'created_at', 'updated_at',
            'url', 'check_interval', 'timeout', 'monitor_id',
            'monitors_count', 'healthy_count', 'down_count', 'status',
            'uptime', 'average_response_time', 'latest_response_time',
            'latest_http_status', 'downtime_minutes', 'health_score',
            'total_checks', 'incidents_count',
            'website_url', 'last_checked'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        url = validated_data.pop('url', None)
        check_interval = validated_data.pop('check_interval', 5)
        timeout = validated_data.pop('timeout', 10)

        from django.db import transaction
        with transaction.atomic():
            project = Project.objects.create(**validated_data)
            if url:
                from monitors.models import Monitor
                from monitors.services.monitoring_service import check_website
                monitor = Monitor.objects.create(
                    project=project,
                    name=f"{project.name} HTTP",
                    url=url,
                    check_interval=check_interval,
                    timeout=timeout
                )
                try:
                    check_website(monitor)
                except Exception as e:
                    print("Initial health scan error:", e)
            return project

    def update(self, instance, validated_data):
        url = validated_data.pop('url', None)
        check_interval = validated_data.pop('check_interval', None)
        timeout = validated_data.pop('timeout', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if url:
            from monitors.models import Monitor
            from monitors.services.monitoring_service import check_website
            monitor = instance.monitors.first()
            if monitor:
                monitor.url = url
                if check_interval is not None:
                    monitor.check_interval = check_interval
                if timeout is not None:
                    monitor.timeout = timeout
                monitor.save()
            else:
                monitor = Monitor.objects.create(
                    project=instance,
                    name=f"{instance.name} HTTP",
                    url=url,
                    check_interval=check_interval or 5,
                    timeout=timeout or 10
                )
            try:
                check_website(monitor)
            except Exception as e:
                print("Update health scan error:", e)
        return instance

    def get_monitor_id(self, obj):
        first_monitor = obj.monitors.first()
        return first_monitor.id if first_monitor else None

    def get_monitors_count(self, obj):
        return obj.monitors.count()

    def get_healthy_count(self, obj):
        return obj.monitors.filter(current_status='UP').count()

    def get_down_count(self, obj):
        return obj.monitors.filter(current_status='DOWN').count()

    def get_status(self, obj):
        monitors = list(obj.monitors.all())
        if not monitors:
            return 'PENDING'
        if any(m.current_status == 'DOWN' for m in monitors):
            return 'DOWN'
        if any(m.current_status == 'WARNING' for m in monitors):
            return 'WARNING'
        if all(m.current_status == 'PAUSED' for m in monitors):
            return 'PAUSED'
        return 'UP'

    def get_website_url(self, obj):
        first_monitor = obj.monitors.first()
        return first_monitor.url if first_monitor else ''

    def get_last_checked(self, obj):
        first_monitor = obj.monitors.exclude(last_checked_at__isnull=True).order_by('-last_checked_at').first()
        return first_monitor.last_checked_at if first_monitor else None

    def get_uptime(self, obj):
        monitors = obj.monitors.all()
        if not monitors.exists():
            return 0.0
        uptimes = []
        for m in monitors:
            records = m.records.all()
            if records.exists():
                total = records.count()
                up_count = records.filter(status__in=['UP', 'WARNING']).count()
                uptimes.append((up_count / total) * 100.0)
        return round(sum(uptimes) / len(uptimes), 2) if uptimes else 0.0

    def get_average_response_time(self, obj):
        monitors = obj.monitors.all()
        resp_times = []
        for m in monitors:
            records = m.records.filter(status__in=['UP', 'WARNING'])
            if records.exists():
                avg = records.aggregate(models.Avg('response_time'))['response_time__avg']
                if avg is not None:
                    resp_times.append(avg)
        return int(sum(resp_times) / len(resp_times)) if resp_times else 0

    def get_latest_response_time(self, obj):
        from monitors.models import MonitoringRecord
        rec = MonitoringRecord.objects.filter(monitor__project=obj).order_by('-checked_at').first()
        return rec.response_time if rec else 0

    def get_latest_http_status(self, obj):
        from monitors.models import MonitoringRecord
        rec = MonitoringRecord.objects.filter(monitor__project=obj).order_by('-checked_at').first()
        return rec.http_status_code if rec else None

    def get_downtime_minutes(self, obj):
        from monitors.models import Incident
        total = Incident.objects.filter(monitor__project=obj, status='RESOLVED').aggregate(models.Sum('duration'))['duration__sum'] or 0
        return total

    def get_total_checks(self, obj):
        from monitors.models import MonitoringRecord
        return MonitoringRecord.objects.filter(monitor__project=obj).count()

    def get_incidents_count(self, obj):
        from monitors.models import Incident
        return Incident.objects.filter(monitor__project=obj).count()

    def get_health_score(self, obj):
        first_monitor = obj.monitors.first()
        if not first_monitor:
            return 0
        records = first_monitor.records.all()
        if not records.exists():
            return 0
        total = records.count()
        up_count = records.filter(status__in=['UP', 'WARNING']).count()
        uptime = (up_count / total) * 100.0
        avg_resp = records.filter(status__in=['UP', 'WARNING']).aggregate(models.Avg('response_time'))['response_time__avg'] or 0
        incidents_count = first_monitor.incidents.filter(status='OPEN').count()

        score = uptime * 0.7
        if avg_resp <= 300:
            score += 30
        elif avg_resp <= 800:
            score += 20
        elif avg_resp <= 1500:
            score += 10
        score -= (incidents_count * 15)
        return max(0, min(100, int(score)))


class ReportScheduleSerializer(serializers.ModelSerializer):
    selected_project_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    effective_email = serializers.SerializerMethodField()
    selected_projects = serializers.SerializerMethodField()

    class Meta:
        model = Project.report_schedule.related.related_model if hasattr(Project, 'report_schedule') else None
        # We will reference ReportSchedule directly
        fields = [
            'id', 'is_enabled', 'send_down_alerts', 'recipient_email', 'scheduled_time',
            'include_all_projects', 'selected_projects', 'selected_project_ids',
            'last_sent_at', 'effective_email', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'last_sent_at', 'created_at', 'updated_at', 'selected_projects']

    def __init__(self, *args, **kwargs):
        from .models import ReportSchedule
        self.Meta.model = ReportSchedule
        super().__init__(*args, **kwargs)

    def get_effective_email(self, obj):
        return obj.get_effective_email()

    def get_selected_projects(self, obj):
        return [{'id': p.id, 'name': p.name} for p in obj.selected_projects.all()]

    def update(self, instance, validated_data):
        selected_ids = validated_data.pop('selected_project_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if selected_ids is not None:
            projects = Project.objects.filter(user=instance.user, id__in=selected_ids)
            instance.selected_projects.set(projects)
        return instance

