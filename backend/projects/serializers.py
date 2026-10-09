from django.db import models
from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    url = serializers.CharField(write_only=True, required=False, allow_blank=True)
    check_interval = serializers.IntegerField(write_only=True, required=False, default=5)
    timeout = serializers.IntegerField(write_only=True, required=False, default=10)

    monitors_count = serializers.SerializerMethodField()
    healthy_count = serializers.SerializerMethodField()
    down_count = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    uptime = serializers.SerializerMethodField()
    average_response_time = serializers.SerializerMethodField()
    website_url = serializers.SerializerMethodField()
    last_checked = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'is_active', 'created_at', 'updated_at',
            'url', 'check_interval', 'timeout',
            'monitors_count', 'healthy_count', 'down_count', 'status',
            'uptime', 'average_response_time', 'website_url', 'last_checked'
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
            return 100.0
        uptimes = []
        for m in monitors:
            records = m.records.all()
            if records.exists():
                total = records.count()
                up_count = records.filter(status__in=['UP', 'WARNING']).count()
                uptimes.append((up_count / total) * 100.0)
        return round(sum(uptimes) / len(uptimes), 2) if uptimes else 100.0

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
