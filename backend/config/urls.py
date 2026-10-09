from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/v1/auth/', include('users.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/v1/projects/', include('projects.urls')),
    path('api/monitors/', include('monitors.urls')),
    path('api/v1/monitors/', include('monitors.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
    path('api/dashboard/', include('monitors.dashboard_urls')),
    path('api/v1/dashboard/', include('monitors.dashboard_urls')),
]
