from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def get_object(self):
        pk = self.kwargs.get('pk')
        try:
            notif = Notification.objects.get(pk=pk)
            if notif.user != self.request.user and not self.request.user.is_staff:
                from rest_framework import exceptions
                raise exceptions.PermissionDenied("You do not have authorization to access this notification.")
            return notif
        except Notification.DoesNotExist:
            from rest_framework import exceptions
            raise exceptions.NotFound(f"Notification with ID {pk} not found.")

    @action(detail=True, methods=['patch'], url_path='read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(NotificationSerializer(notification).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='read-all')
    def read_all(self, request):
        updated_count = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({
            'message': f'Marked {updated_count} notifications as read',
            'count': updated_count
        }, status=status.HTTP_200_OK)
