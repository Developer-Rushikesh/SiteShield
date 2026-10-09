from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project
from .serializers import ProjectSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='check')
    def check(self, request, pk=None):
        """
        Triggers immediate HTTP health scans for all monitors in this project.
        """
        project = self.get_object()
        from monitors.services.monitoring_service import check_website
        monitors = project.monitors.all()
        checked_records = []
        for monitor in monitors:
            try:
                record = check_website(monitor)
                checked_records.append(record.id)
            except Exception as e:
                print(f"Error checking monitor {monitor.id}:", e)

        # Refresh project instance to serialize updated stats
        project.refresh_from_db()
        data = ProjectSerializer(project).data
        return Response({
            'message': f"Checked {len(checked_records)} monitor(s) for project '{project.name}'",
            'project': data
        }, status=status.HTTP_200_OK)
