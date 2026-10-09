from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from projects.models import Project
from projects.serializers import ProjectSerializer
from monitors.models import Monitor, Incident, MonitoringRecord

class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        projects = Project.objects.filter(user=user)
        monitors = Monitor.objects.filter(project__user=user)

        total_projects = projects.count()
        healthy_websites = monitors.filter(current_status='UP').count()
        down_websites = monitors.filter(current_status='DOWN').count()
        active_incidents = Incident.objects.filter(monitor__project__user=user, status='OPEN').count()

        all_records = MonitoringRecord.objects.filter(monitor__project__user=user)
        total_checks = all_records.count()

        if total_checks > 0:
            up_records = all_records.filter(status__in=['UP', 'WARNING'])
            average_uptime = round((up_records.count() / total_checks) * 100.0, 2)
            resp_times = [r.response_time for r in up_records if r.response_time > 0]
            average_response_time = int(sum(resp_times) / len(resp_times)) if resp_times else 0
        else:
            average_uptime = 100.0
            average_response_time = 0

        project_serializer = ProjectSerializer(projects, many=True)

        return Response({
            'total_projects': total_projects,
            'healthy_websites': healthy_websites,
            'down_websites': down_websites,
            'active_incidents': active_incidents,
            'average_uptime': average_uptime,
            'average_response_time': average_response_time,
            'total_checks': total_checks,
            'projects': project_serializer.data
        }, status=status.HTTP_200_OK)
