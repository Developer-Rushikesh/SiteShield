import threading
import time
import os
import sys
from datetime import datetime
from django.utils import timezone

_scheduler_started = False
_scheduler_lock = threading.Lock()
_last_run_date = None

def _run_daily_report_checker():
    global _last_run_date
    time.sleep(10)  # Initial delay for server startup
    
    while True:
        try:
            now = timezone.localtime()
            # 21:00 is 9:00 PM
            if now.hour == 21 and now.minute >= 0 and now.minute <= 5:
                today_str = now.strftime('%Y-%m-%d')
                if _last_run_date != today_str:
                    _last_run_date = today_str
                    print(f"[SiteShield Scheduler] 9:00 PM Trigger Reached ({now}). Dispatching daily reports...")
                    from projects.models import ReportSchedule
                    from projects.services.email_report_service import send_daily_summary_report

                    schedules = ReportSchedule.objects.filter(is_enabled=True)
                    for schedule in schedules:
                        try:
                            send_daily_summary_report(schedule)
                        except Exception as e:
                            print(f"[SiteShield Scheduler] Error sending report for {schedule.user.username}:", e)
        except Exception as ex:
            print("[SiteShield Scheduler] Unexpected error in loop:", ex)

        # Sleep for 30 seconds before next check
        time.sleep(30)

def start_report_scheduler():
    global _scheduler_started
    with _scheduler_lock:
        if _scheduler_started:
            return

        # Avoid running in autoreloader parent process
        if 'runserver' in sys.argv and os.environ.get('RUN_MAIN') != 'true':
            return

        _scheduler_started = True
        thread = threading.Thread(target=_run_daily_report_checker, daemon=True, name="SiteShieldReportScheduler")
        thread.start()
        print("[SiteShield] Background Daily 9:00 PM Report Scheduler initialized successfully.")
