from django.contrib import admin
from .models import Monitor, MonitoringRecord, Incident

@admin.register(Monitor)
class MonitorAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'url', 'project', 'current_status', 'check_interval', 'is_active', 'last_checked_at')
    list_filter = ('current_status', 'is_active', 'monitor_type')
    search_fields = ('name', 'url', 'project__name')
    ordering = ('-created_at',)

@admin.register(MonitoringRecord)
class MonitoringRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'monitor', 'status', 'http_status_code', 'response_time', 'checked_at')
    list_filter = ('status', 'checked_at')
    search_fields = ('monitor__name', 'error_message')
    ordering = ('-checked_at',)

@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ('id', 'monitor', 'status', 'started_at', 'resolved_at', 'duration', 'http_status_code')
    list_filter = ('status', 'started_at')
    search_fields = ('monitor__name', 'reason')
    ordering = ('-started_at',)
