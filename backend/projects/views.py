import time
from rest_framework import viewsets, permissions, status, exceptions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Sum, Min, Max
from django.utils import timezone
from .models import Project
from .serializers import ProjectSerializer
from monitors.models import Monitor, MonitoringRecord, Incident
from monitors.serializers import MonitorSerializer, MonitoringRecordSerializer, IncidentSerializer
from monitors.services.monitoring_service import check_website, validate_url_security

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Always scope to authenticated user
        return Project.objects.filter(user=self.request.user)

    def get_object(self):
        pk = self.kwargs.get('pk')
        try:
            project = Project.objects.get(pk=pk)
            # Enforce authorization: project owner or admin staff only
            if project.user != self.request.user and not self.request.user.is_staff:
                raise exceptions.PermissionDenied("You do not have authorization to access this project.")
            return project
        except Project.DoesNotExist:
            raise exceptions.NotFound(f"Project with ID {pk} not found.")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='configure-monitor')
    def configure_monitor(self, request, pk=None):
        """
        Configures or updates the target URL & monitoring parameters for this project,
        then triggers an immediate initial live health check.
        """
        project = self.get_object()
        url = request.data.get('url', '').strip()
        if not url:
            return Response({'error': 'Target website URL is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate URL security (SSRF prevention)
        try:
            validate_url_security(url)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        check_interval = int(request.data.get('check_interval', 5))
        timeout_val = int(request.data.get('timeout', 10))
        monitor_name = request.data.get('name', '').strip() or f"{project.name} HTTP"

        monitor = project.monitors.first()
        if monitor:
            monitor.url = url
            monitor.name = monitor_name
            monitor.check_interval = check_interval
            monitor.timeout = timeout_val
            monitor.save()
        else:
            monitor = Monitor.objects.create(
                project=project,
                name=monitor_name,
                url=url,
                check_interval=check_interval,
                timeout=timeout_val
            )

        # Trigger immediate live check
        try:
            record = check_website(monitor)
            record_data = MonitoringRecordSerializer(record).data
        except Exception as e:
            record_data = {'error': str(e)}

        project.refresh_from_db()
        return Response({
            'message': f"Target URL for '{project.name}' successfully configured.",
            'project': ProjectSerializer(project).data,
            'monitor': MonitorSerializer(monitor).data,
            'latest_check': record_data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='check')
    def check(self, request, pk=None):
        """
        Triggers an immediate live HTTP health scan for this project's target website.
        Stores real check records and incidents in the database.
        """
        project = self.get_object()
        monitors = list(project.monitors.all())

        if not monitors:
            url = request.data.get('url', '').strip()
            if url:
                try:
                    validate_url_security(url)
                    monitor = Monitor.objects.create(
                        project=project,
                        name=f"{project.name} HTTP",
                        url=url,
                        check_interval=5,
                        timeout=10
                    )
                    monitors = [monitor]
                except ValueError as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    'error': 'No target website URL configured for this project. Please configure a target URL first.'
                }, status=status.HTTP_400_BAD_REQUEST)

        checked_records = []
        for monitor in monitors:
            try:
                record = check_website(monitor)
                checked_records.append(MonitoringRecordSerializer(record).data)
            except Exception as e:
                print(f"Error checking monitor {monitor.id}:", e)

        project.refresh_from_db()
        return Response({
            'message': f"Checked {len(checked_records)} monitor(s) for '{project.name}'",
            'project': ProjectSerializer(project).data,
            'records': checked_records
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='statistics')
    def statistics(self, request, pk=None):
        """
        Returns full real-time database statistics and chart metrics for this project.
        """
        project = self.get_object()
        first_monitor = project.monitors.first()

        if not first_monitor:
            return Response({
                'has_monitor': False,
                'uptime': 0.0,
                'average_response_time': 0,
                'latest_response_time': 0,
                'min_response_time': 0,
                'max_response_time': 0,
                'total_checks': 0,
                'incidents': 0,
                'downtime_minutes': 0,
                'health_score': 0,
                'status': 'PENDING',
                'latest_http_status': None,
                'target_url': '',
                'monitor_id': None,
                'check_interval': 5,
                'timeout': 10,
                'response_time': [],
                'status_distribution': [],
                'timeline': []
            }, status=status.HTTP_200_OK)

        records = list(MonitoringRecord.objects.filter(monitor__project=project).order_by('checked_at'))
        total_checks = len(records)

        if total_checks == 0:
            return Response({
                'has_monitor': True,
                'uptime': 0.0,
                'average_response_time': 0,
                'latest_response_time': 0,
                'min_response_time': 0,
                'max_response_time': 0,
                'total_checks': 0,
                'incidents': 0,
                'downtime_minutes': 0,
                'health_score': 0,
                'status': first_monitor.current_status,
                'latest_http_status': None,
                'target_url': first_monitor.url,
                'monitor_id': first_monitor.id,
                'check_interval': first_monitor.check_interval,
                'timeout': first_monitor.timeout,
                'response_time': [],
                'status_distribution': [],
                'timeline': []
            }, status=status.HTTP_200_OK)

        up_records = [r for r in records if r.status in ['UP', 'WARNING']]
        up_count = len(up_records)
        uptime = round((up_count / total_checks) * 100.0, 2)

        resp_times = [r.response_time for r in up_records if r.response_time > 0]
        avg_resp = int(sum(resp_times) / len(resp_times)) if resp_times else 0
        min_resp = min(resp_times) if resp_times else 0
        max_resp = max(resp_times) if resp_times else 0

        latest_record = records[-1]
        latest_resp = latest_record.response_time
        latest_http = latest_record.http_status_code

        incidents_qs = Incident.objects.filter(monitor__project=project)
        incidents_count = incidents_qs.count()
        open_incidents_count = incidents_qs.filter(status='OPEN').count()
        resolved_downtime = incidents_qs.filter(status='RESOLVED').aggregate(Sum('duration'))['duration__sum'] or 0

        # Calculate health score
        score = uptime * 0.7
        if avg_resp <= 300:
            score += 30
        elif avg_resp <= 800:
            score += 20
        elif avg_resp <= 1500:
            score += 10
        score -= (open_incidents_count * 15)
        health_score = max(0, min(100, int(score)))

        # Format recent 30 records for Recharts
        recent_records = records[-30:]
        response_time_chart = [
            {
                'time': r.checked_at.strftime('%H:%M:%S'),
                'response_time': r.response_time,
                'status': r.status,
                'http_status': r.http_status_code or 0
            }
            for r in recent_records
        ]

        # Status distribution
        status_counts = {}
        for r in records:
            code_str = str(r.http_status_code) if r.http_status_code else ('Timeout' if 'timeout' in r.error_message.lower() else 'Error')
            status_counts[code_str] = status_counts.get(code_str, 0) + 1

        status_distribution = [
            {'code': k, 'count': v} for k, v in status_counts.items()
        ]

        timeline = [
            {
                'id': r.id,
                'time': r.checked_at.strftime('%H:%M:%S'),
                'status': r.status,
                'response_time': r.response_time,
                'http_status': r.http_status_code
            }
            for r in recent_records
        ]

        return Response({
            'has_monitor': True,
            'uptime': uptime,
            'average_response_time': avg_resp,
            'latest_response_time': latest_resp,
            'min_response_time': min_resp,
            'max_response_time': max_resp,
            'total_checks': total_checks,
            'incidents': incidents_count,
            'active_incidents': open_incidents_count,
            'downtime_minutes': resolved_downtime,
            'health_score': health_score,
            'status': first_monitor.current_status,
            'latest_http_status': latest_http,
            'target_url': first_monitor.url,
            'monitor_id': first_monitor.id,
            'check_interval': first_monitor.check_interval,
            'timeout': first_monitor.timeout,
            'response_time': response_time_chart,
            'status_distribution': status_distribution,
            'timeline': timeline
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='history')
    def history(self, request, pk=None):
        """
        Returns monitoring history records for this project from the database.
        Supports status, date filtering, and limit.
        """
        project = self.get_object()
        records = MonitoringRecord.objects.filter(monitor__project=project).order_by('-checked_at')

        status_filter = request.query_params.get('status')
        if status_filter and status_filter.upper() != 'ALL':
            records = records.filter(status=status_filter.upper())

        from_date = request.query_params.get('from_date')
        if from_date:
            records = records.filter(checked_at__date__gte=from_date)

        to_date = request.query_params.get('to_date')
        if to_date:
            records = records.filter(checked_at__date__lte=to_date)

        limit = request.query_params.get('limit')
        if limit and limit.isdigit():
            records = records[:int(limit)]
        else:
            records = records[:100]

        serializer = MonitoringRecordSerializer(records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='incidents')
    def incidents(self, request, pk=None):
        """
        Returns recorded incidents for this project from the database.
        """
        project = self.get_object()
        incidents = Incident.objects.filter(monitor__project=project).order_by('-started_at')
        serializer = IncidentSerializer(incidents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
