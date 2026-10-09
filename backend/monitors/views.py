from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from projects.models import Project
from .models import Monitor, MonitoringRecord, Incident
from .serializers import MonitorSerializer, MonitoringRecordSerializer, IncidentSerializer
from .services.monitoring_service import check_website

class MonitorViewSet(viewsets.ModelViewSet):
    serializer_class = MonitorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Monitor.objects.filter(project__user=self.request.user)

    def perform_create(self, serializer):
        project_id = self.request.data.get('project')
        try:
            project = Project.objects.get(id=project_id, user=self.request.user)
            serializer.save(project=project)
        except Project.DoesNotExist:
            raise serializers.ValidationError({"project": "Project not found or access denied."})

    @action(detail=True, methods=['post'], url_path='check')
    def check(self, request, pk=None):
        """
        Triggers an immediate HTTP check for this monitor.
        """
        monitor = self.get_object()
        record = check_website(monitor)
        record_data = MonitoringRecordSerializer(record).data
        monitor_data = MonitorSerializer(monitor).data
        return Response({
            'message': f"Checked {monitor.name}",
            'monitor': monitor_data,
            'record': record_data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='history')
    def history(self, request, pk=None):
        """
        Returns monitoring history records for this monitor.
        Supports status filtering and limit.
        """
        monitor = self.get_object()
        records = monitor.records.all()

        status_filter = request.query_params.get('status')
        if status_filter:
            records = records.filter(status=status_filter.upper())

        limit = request.query_params.get('limit')
        if limit and limit.isdigit():
            records = records[:int(limit)]
        else:
            records = records[:100]

        serializer = MonitoringRecordSerializer(records, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='statistics')
    def statistics(self, request, pk=None):
        """
        Returns aggregate statistics and chart data formatted for React Recharts.
        """
        monitor = self.get_object()
        records = list(monitor.records.all().order_by('checked_at'))

        total_checks = len(records)
        if total_checks == 0:
            return Response({
                'uptime': 100.0,
                'average_response_time': 0,
                'total_checks': 0,
                'incidents': 0,
                'downtime_minutes': 0,
                'response_time': [],
                'status_distribution': [],
                'timeline': []
            })

        up_records = [r for r in records if r.status in ['UP', 'WARNING']]
        up_count = len(up_records)
        uptime = round((up_count / total_checks) * 100.0, 2)

        avg_resp = int(sum(r.response_time for r in up_records) / len(up_records)) if up_records else 0

        incidents = monitor.incidents.all()
        incidents_count = incidents.count()
        total_downtime = incidents.filter(status='RESOLVED').aggregate(Sum('duration'))['duration__sum'] or 0

        recent_records = records[-30:]
        response_time_chart = [
            {
                'time': r.checked_at.strftime('%H:%M'),
                'response_time': r.response_time,
                'status': r.status,
                'http_status': r.http_status_code
            }
            for r in recent_records
        ]

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
            'uptime': uptime,
            'average_response_time': avg_resp,
            'total_checks': total_checks,
            'incidents': incidents_count,
            'downtime_minutes': total_downtime,
            'response_time': response_time_chart,
            'status_distribution': status_distribution,
            'timeline': timeline
        })

    @action(detail=True, methods=['get'], url_path='incidents')
    def incidents(self, request, pk=None):
        """
        Returns incidents recorded for this monitor.
        """
        monitor = self.get_object()
        incidents = monitor.incidents.all()
        serializer = IncidentSerializer(incidents, many=True)
        return Response(serializer.data)
