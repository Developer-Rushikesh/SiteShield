from django.apps import AppConfig

class ProjectsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'projects'

    def ready(self):
        try:
            from .scheduler import start_report_scheduler
            start_report_scheduler()
        except Exception as e:
            print("[SiteShield] Could not start scheduler:", e)
