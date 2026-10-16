from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet,
    ReportScheduleView,
    TestDailyReportView,
    SendAnalyticsReportView,
    TestRedAlertView
)

router = DefaultRouter()
router.register(r'', ProjectViewSet, basename='project')

urlpatterns = [
    path('report-schedule/', ReportScheduleView.as_view(), name='report_schedule'),
    path('test-daily-report/', TestDailyReportView.as_view(), name='test_daily_report'),
    path('test-red-alert/', TestRedAlertView.as_view(), name='test_red_alert'),
    path('send-analytics-report/', SendAnalyticsReportView.as_view(), name='send_analytics_report'),
] + router.urls
