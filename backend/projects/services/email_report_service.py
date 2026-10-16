from datetime import datetime
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone
from django.db.models import Avg, Sum
from projects.models import Project, ReportSchedule, ReportEmailLog
from monitors.models import Monitor, MonitoringRecord, Incident
from notifications.models import Notification


def build_kpi_card(title, value, subtitle, bg_color="#eff6ff", text_color="#1e40af", border_color="#bfdbfe"):
    return f"""
    <div style="background-color: {bg_color}; border: 1px solid {border_color}; border-radius: 8px; padding: 16px; margin: 6px; flex: 1; min-width: 140px; box-sizing: border-box;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: {text_color}; font-weight: 700;">{title}</div>
      <div style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 4px 0;">{value}</div>
      <div style="font-size: 12px; color: #64748b;">{subtitle}</div>
    </div>
    """


def get_project_stats(project):
    """
    Computes real metrics for an individual project.
    """
    first_monitor = project.monitors.first()
    if not first_monitor:
        return {
            'name': project.name,
            'url': 'No URL configured',
            'status': 'PENDING',
            'status_color': '#94a3b8',
            'status_bg': '#f1f5f9',
            'uptime': 0.0,
            'avg_resp': 0,
            'latest_http': '-',
            'total_checks': 0,
            'active_incidents': 0
        }

    records = list(MonitoringRecord.objects.filter(monitor=first_monitor))
    total_checks = len(records)
    up_records = [r for r in records if r.status in ['UP', 'WARNING']]
    uptime = round((len(up_records) / total_checks * 100.0), 1) if total_checks > 0 else 0.0

    resp_times = [r.response_time for r in up_records if r.response_time > 0]
    avg_resp = int(sum(resp_times) / len(resp_times)) if resp_times else 0

    latest_rec = records[-1] if records else None
    latest_http = str(latest_rec.http_status_code) if (latest_rec and latest_rec.http_status_code) else '-'

    incidents_count = Incident.objects.filter(monitor=first_monitor, status='OPEN').count()

    status_str = first_monitor.current_status
    if status_str == 'UP':
        status_color = '#10b981'
        status_bg = '#ecfdf5'
    elif status_str == 'WARNING':
        status_color = '#f59e0b'
        status_bg = '#fffbeb'
    else:
        status_color = '#ef4444'
        status_bg = '#fef2f2'

    return {
        'name': project.name,
        'url': first_monitor.url,
        'status': status_str,
        'status_color': status_color,
        'status_bg': status_bg,
        'uptime': uptime,
        'avg_resp': avg_resp,
        'latest_http': latest_http,
        'total_checks': total_checks,
        'active_incidents': incidents_count
    }


def send_daily_summary_report(schedule: ReportSchedule, force=False):
    """
    Compiles and sends the Daily 9:00 PM Performance & Health Report.
    """
    user = schedule.user
    recipient = schedule.get_effective_email()
    if not recipient:
        return False, "No recipient email configured."

    # Retrieve projects
    if schedule.include_all_projects:
        projects = list(Project.objects.filter(user=user, is_active=True))
    else:
        projects = list(schedule.selected_projects.filter(is_active=True))

    if not projects:
        # Fallback to all projects owned by user
        projects = list(Project.objects.filter(user=user))

    # Compile metrics
    project_stats_list = [get_project_stats(p) for p in projects]
    total_projects = len(project_stats_list)
    healthy_count = sum(1 for p in project_stats_list if p['status'] == 'UP')
    down_count = sum(1 for p in project_stats_list if p['status'] == 'DOWN')
    warning_count = sum(1 for p in project_stats_list if p['status'] == 'WARNING')

    total_active_incidents = sum(p['active_incidents'] for p in project_stats_list)

    avg_uptimes = [p['uptime'] for p in project_stats_list if p['total_checks'] > 0]
    overall_uptime = round(sum(avg_uptimes) / len(avg_uptimes), 1) if avg_uptimes else 100.0

    avg_resps = [p['avg_resp'] for p in project_stats_list if p['avg_resp'] > 0]
    overall_avg_resp = int(sum(avg_resps) / len(avg_resps)) if avg_resps else 0

    now_str = timezone.now().strftime("%B %d, %Y")
    now_time = timezone.now().strftime("%I:%M %p UTC")

    subject = f"[SiteShield 24 Monitor] Daily 9 PM Performance Report — {now_str}"

    # Build Project Rows
    table_rows_html = ""
    for p in project_stats_list:
        table_rows_html += f"""
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 14px; font-weight: 700; color: #1e293b;">{p['name']}</td>
          <td style="padding: 12px 14px; color: #3b82f6; font-size: 13px;">{p['url']}</td>
          <td style="padding: 12px 14px;">
            <span style="display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; background-color: {p['status_bg']}; color: {p['status_color']};">
              {p['status']}
            </span>
          </td>
          <td style="padding: 12px 14px; font-weight: 700; color: #10b981;">{p['uptime']}%</td>
          <td style="padding: 12px 14px; font-weight: 600; color: #334155;">{p['avg_resp']} ms</td>
          <td style="padding: 12px 14px; color: #64748b; font-size: 12px;">{p['latest_http']}</td>
        </tr>
        """

    incidents_banner = ""
    if total_active_incidents > 0:
        incidents_banner = f"""
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; color: #991b1b;">
          <strong>Attention Required:</strong> There are currently <strong>{total_active_incidents} active incident(s)</strong> detected across your monitored projects. Please inspect your monitoring console.
        </div>
        """
    else:
        incidents_banner = f"""
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; color: #065f46;">
          <strong>All Clear:</strong> All monitored web endpoints are operating within normal parameters. Zero active outages detected.
        </div>
        """

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>{subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b;">
      <div style="max-width: 680px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 30px; text-align: left; color: #ffffff;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #93c5fd; margin-bottom: 6px;">
            SiteShield 24 Monitor • Scheduled Daily Report (9:00 PM)
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
            Daily Website Availability & Health Audit
          </h1>
          <div style="margin-top: 8px; font-size: 13px; color: #bfdbfe;">
            Report Date: <strong>{now_str}</strong> • Recipient: <strong>{recipient}</strong>
          </div>
        </div>

        <div style="padding: 32px 28px;">
          {incidents_banner}

          <!-- KPI Cards Grid -->
          <div style="display: flex; flex-wrap: wrap; margin: -6px; margin-bottom: 28px;">
            {build_kpi_card("Overall Availability", f"{overall_uptime}%", "Average Uptime", "#ecfdf5", "#065f46", "#a7f3d0")}
            {build_kpi_card("Average Latency", f"{overall_avg_resp} ms", "Avg Response Time", "#eff6ff", "#1e40af", "#bfdbfe")}
            {build_kpi_card("Healthy Websites", f"{healthy_count} / {total_projects}", f"{down_count} Down", "#f0fdf4", "#15803d", "#bbf7d0")}
            {build_kpi_card("Active Incidents", str(total_active_incidents), "Unresolved", "#fef2f2" if total_active_incidents > 0 else "#f8fafc", "#b91c1c" if total_active_incidents > 0 else "#64748b", "#fecaca" if total_active_incidents > 0 else "#e2e8f0")}
          </div>

          <!-- Section Title -->
          <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 14px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">
            Monitored Environments Summary Table
          </div>

          <!-- Table -->
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; margin-bottom: 28px;">
            <thead>
              <tr style="background-color: #f1f5f9; color: #475569; font-weight: 700; border-bottom: 2px solid #cbd5e1;">
                <th style="padding: 10px 14px;">Project</th>
                <th style="padding: 10px 14px;">Target URL</th>
                <th style="padding: 10px 14px;">Status</th>
                <th style="padding: 10px 14px;">Uptime</th>
                <th style="padding: 10px 14px;">Latency</th>
                <th style="padding: 10px 14px;">HTTP</th>
              </tr>
            </thead>
            <tbody>
              {table_rows_html if table_rows_html else '<tr><td colspan="6" style="padding: 20px; text-align: center; color: #94a3b8;">No projects registered in monitoring catalog.</td></tr>'}
            </tbody>
          </table>

          <!-- Audit Information Notice -->
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 14px 18px; font-size: 12px; color: #64748b; line-height: 1.6; border: 1px solid #e2e8f0;">
            <strong>Audit Verification:</strong> This automated report was scheduled and delivered at 9:00 PM per your SiteShield configuration preferences. All statistics are compiled from live synthetic HTTP health checks recorded in the database.
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 20px 28px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          &copy; SiteShield 24 Monitor. All rights reserved.<br>
          Automated Nightly Health Audit • Dispatched via Google SMTP
        </div>
      </div>
    </body>
    </html>
    """

    plain_text = f"""
SiteShield 24 Monitor — Daily 9:00 PM Performance Report
Date: {now_str}
Recipient: {recipient}

SUMMARY:
- Monitored Projects: {total_projects}
- Healthy: {healthy_count} | Down: {down_count} | Warning: {warning_count}
- Overall Uptime: {overall_uptime}%
- Average Latency: {overall_avg_resp} ms
- Active Incidents: {total_active_incidents}

PROJECTS:
"""
    for p in project_stats_list:
        plain_text += f"\n- {p['name']} ({p['url']}): Status={p['status']}, Uptime={p['uptime']}%, Latency={p['avg_resp']}ms"

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'SiteShield 24 Monitor <rushikeshpawar977@gmail.com>')
    msg = EmailMultiAlternatives(subject, plain_text, from_email, [recipient])
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)

    # Update schedule & log
    schedule.last_sent_at = timezone.now()
    schedule.save(update_fields=['last_sent_at'])

    ReportEmailLog.objects.create(
        user=user,
        recipient_email=recipient,
        report_type='DAILY_9PM',
        subject=subject,
        status='SENT'
    )

    # In-app notification
    Notification.objects.create(
        user=user,
        type='SYSTEM',
        title="Daily 9 PM Performance Report Dispatched",
        message=f"Your automated nightly availability audit was successfully sent to {recipient}."
    )

    return True, f"Daily 9 PM report dispatched successfully to {recipient}."


def send_project_report_email(user, project: Project, recipient_email: str, notes=""):
    """
    Sends an in-depth audit report for an individual project on-demand.
    """
    recipient = recipient_email.strip() if recipient_email else user.email
    if not recipient:
        raise ValueError("Recipient email is required.")

    stats = get_project_stats(project)
    now_str = timezone.now().strftime("%B %d, %Y, %I:%M %p")

    # Recent history records
    records = list(MonitoringRecord.objects.filter(monitor__project=project).order_by('-checked_at')[:10])

    subject = f"[SiteShield 24 Monitor] Project Audit Report: {project.name}"

    history_rows = ""
    for r in records:
        badge_color = "#10b981" if r.status == 'UP' else ("#f59e0b" if r.status == 'WARNING' else "#ef4444")
        badge_bg = "#ecfdf5" if r.status == 'UP' else ("#fffbeb" if r.status == 'WARNING' else "#fef2f2")
        time_str = r.checked_at.strftime("%H:%M:%S")
        history_rows += f"""
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 12px; font-family: monospace; font-size: 12px; color: #475569;">{time_str}</td>
          <td style="padding: 8px 12px;"><span style="padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background-color: {badge_bg}; color: {badge_color};">{r.status}</span></td>
          <td style="padding: 8px 12px; font-weight: 600;">{r.response_time} ms</td>
          <td style="padding: 8px 12px; color: #64748b;">{r.http_status_code or '-'}</td>
          <td style="padding: 8px 12px; color: #ef4444; font-size: 11px;">{r.error_message or 'OK'}</td>
        </tr>
        """

    notes_section = ""
    if notes:
        notes_section = f"""
        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; font-size: 13px; color: #92400e;">
          <strong>Sender Notes:</strong> {notes}
        </div>
        """

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><title>{subject}</title></head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b;">
      <div style="max-width: 640px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 28px 24px; color: #ffffff;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #93c5fd; margin-bottom: 4px;">Project Health Audit</div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">{project.name}</h1>
          <div style="margin-top: 6px; font-size: 13px; color: #cbd5e1;">Target: <strong>{stats['url']}</strong> • Audited: {now_str}</div>
        </div>

        <div style="padding: 28px 24px;">
          {notes_section}

          <div style="display: flex; flex-wrap: wrap; margin: -6px; margin-bottom: 24px;">
            {build_kpi_card("Current Status", stats['status'], f"HTTP {stats['latest_http']}", stats['status_bg'], stats['status_color'])}
            {build_kpi_card("Availability", f"{stats['uptime']}%", f"{stats['total_checks']} checks", "#ecfdf5", "#065f46", "#a7f3d0")}
            {build_kpi_card("Avg Latency", f"{stats['avg_resp']} ms", "Response Time", "#eff6ff", "#1e40af", "#bfdbfe")}
            {build_kpi_card("Active Outages", str(stats['active_incidents']), "Incidents", "#fef2f2" if stats['active_incidents'] > 0 else "#f8fafc", "#b91c1c" if stats['active_incidents'] > 0 else "#64748b", "#fecaca" if stats['active_incidents'] > 0 else "#e2e8f0")}
          </div>

          <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px; border-bottom: 2px solid #3b82f6; padding-bottom: 6px;">
            Recent Synthetic Health Checks
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #f1f5f9; color: #475569; font-weight: 700;">
                <th style="padding: 8px 12px;">Time</th>
                <th style="padding: 8px 12px;">Status</th>
                <th style="padding: 8px 12px;">Latency</th>
                <th style="padding: 8px 12px;">Code</th>
                <th style="padding: 8px 12px;">Details</th>
              </tr>
            </thead>
            <tbody>
              {history_rows if history_rows else '<tr><td colspan="5" style="padding: 16px; text-align: center; color: #94a3b8;">No check records recorded yet.</td></tr>'}
            </tbody>
          </table>

          <div style="font-size: 12px; color: #64748b; background-color: #f8fafc; padding: 12px 16px; border-radius: 6px; border: 1px solid #e2e8f0;">
            Report generated on-demand by <strong>{user.username}</strong> ({user.email}). Powered by SiteShield 24 Monitor synthetic scanner.
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          &copy; SiteShield 24 Monitor • Real-time Monitoring Intelligence
        </div>
      </div>
    </body>
    </html>
    """

    plain_text = f"SiteShield 24 Monitor — Project Audit: {project.name}\nStatus: {stats['status']}\nUptime: {stats['uptime']}%\nLatency: {stats['avg_resp']}ms\nTarget URL: {stats['url']}"

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'SiteShield 24 Monitor <rushikeshpawar977@gmail.com>')
    msg = EmailMultiAlternatives(subject, plain_text, from_email, [recipient])
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)

    ReportEmailLog.objects.create(
        user=user,
        recipient_email=recipient,
        report_type='PROJECT_AUDIT',
        subject=subject,
        project=project,
        status='SENT'
    )

    Notification.objects.create(
        user=user,
        project=project,
        type='SYSTEM',
        title=f"Report Dispatched for {project.name}",
        message=f"Performance audit for '{project.name}' was successfully emailed to {recipient}."
    )

    return True


def send_analytics_report_email(user, recipient_email: str, project_id=None, from_date=None, to_date=None, notes=""):
    """
    Sends an analytical report covering all or a specific project with custom date filtering.
    """
    recipient = recipient_email.strip() if recipient_email else user.email
    if not recipient:
        raise ValueError("Recipient email is required.")

    if project_id and project_id != 'ALL':
        projects = list(Project.objects.filter(user=user, id=project_id))
    else:
        projects = list(Project.objects.filter(user=user, is_active=True))

    project_stats_list = [get_project_stats(p) for p in projects]
    total_projects = len(project_stats_list)
    healthy_count = sum(1 for p in project_stats_list if p['status'] == 'UP')
    down_count = sum(1 for p in project_stats_list if p['status'] == 'DOWN')

    avg_uptimes = [p['uptime'] for p in project_stats_list if p['total_checks'] > 0]
    overall_uptime = round(sum(avg_uptimes) / len(avg_uptimes), 1) if avg_uptimes else 100.0

    avg_resps = [p['avg_resp'] for p in project_stats_list if p['avg_resp'] > 0]
    overall_avg_resp = int(sum(avg_resps) / len(avg_resps)) if avg_resps else 0

    date_label = f"{from_date or 'Recent'} to {to_date or 'Today'}"
    subject = f"[SiteShield 24 Monitor] Analytical Performance Audit ({date_label})"

    table_rows = ""
    for p in project_stats_list:
        table_rows += f"""
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 14px; font-weight: 700; color: #1e293b;">{p['name']}</td>
          <td style="padding: 10px 14px; color: #3b82f6; font-size: 13px;">{p['url']}</td>
          <td style="padding: 10px 14px;"><span style="padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; background-color: {p['status_bg']}; color: {p['status_color']};">{p['status']}</span></td>
          <td style="padding: 10px 14px; font-weight: 700; color: #10b981;">{p['uptime']}%</td>
          <td style="padding: 10px 14px; font-weight: 600;">{p['avg_resp']} ms</td>
        </tr>
        """

    notes_section = ""
    if notes:
        notes_section = f"""
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; font-size: 13px; color: #1e40af;">
          <strong>Attached Notes:</strong> {notes}
        </div>
        """

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><title>{subject}</title></head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b;">
      <div style="max-width: 680px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px 26px; color: #ffffff;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #bfdbfe; margin-bottom: 4px;">SiteShield 24 Monitor • Analytics Audit</div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Availability & Latency Report</h1>
          <div style="margin-top: 6px; font-size: 13px; color: #e0e7ff;">Date Scope: <strong>{date_label}</strong> • Requested by: <strong>{user.email}</strong></div>
        </div>

        <div style="padding: 30px 26px;">
          {notes_section}

          <div style="display: flex; flex-wrap: wrap; margin: -6px; margin-bottom: 24px;">
            {build_kpi_card("Availability", f"{overall_uptime}%", "Aggregate Uptime", "#ecfdf5", "#065f46", "#a7f3d0")}
            {build_kpi_card("Avg Latency", f"{overall_avg_resp} ms", "Aggregate Latency", "#eff6ff", "#1e40af", "#bfdbfe")}
            {build_kpi_card("Scope Endpoints", f"{healthy_count} / {total_projects} UP", f"{down_count} Down", "#f0fdf4", "#15803d", "#bbf7d0")}
          </div>

          <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px; border-bottom: 2px solid #3b82f6; padding-bottom: 6px;">
            Endpoints Breakdown
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #f1f5f9; color: #475569; font-weight: 700;">
                <th style="padding: 10px 14px;">Project</th>
                <th style="padding: 10px 14px;">Target URL</th>
                <th style="padding: 10px 14px;">Status</th>
                <th style="padding: 10px 14px;">Uptime</th>
                <th style="padding: 10px 14px;">Latency</th>
              </tr>
            </thead>
            <tbody>
              {table_rows if table_rows else '<tr><td colspan="5" style="padding: 16px; text-align: center; color: #94a3b8;">No projects found for current filter.</td></tr>'}
            </tbody>
          </table>

          <div style="font-size: 12px; color: #64748b; background-color: #f8fafc; padding: 12px 16px; border-radius: 6px; border: 1px solid #e2e8f0;">
            Generated from SiteShield 24 Monitor Analytical Engine. Recipient: <strong>{recipient}</strong>.
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 18px 26px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          &copy; SiteShield 24 Monitor • Automated Digital Health Audit
        </div>
      </div>
    </body>
    </html>
    """

    plain_text = f"SiteShield 24 Monitor — Analytical Report ({date_label})\nUptime: {overall_uptime}%\nAvg Latency: {overall_avg_resp}ms\nProjects: {total_projects}"

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'SiteShield 24 Monitor <rushikeshpawar977@gmail.com>')
    msg = EmailMultiAlternatives(subject, plain_text, from_email, [recipient])
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)

    ReportEmailLog.objects.create(
        user=user,
        recipient_email=recipient,
        report_type='ANALYTICS_REPORT',
        subject=subject,
        status='SENT'
    )

    Notification.objects.create(
        user=user,
        type='SYSTEM',
        title="Analytical Report Sent to Email",
        message=f"Analytical performance report was successfully dispatched to {recipient}."
    )

    return True


def send_red_alert_down_email(monitor, record, incident=None, recipient_override=None, is_test=False):
    """
    Sends an urgent Red Alert email when a website/monitor goes DOWN.
    Delivers to the particular email designated on the project or user schedule.
    """
    project = monitor.project
    user = project.user

    # If the user disabled down alerts globally in settings, skip automated alerts
    if not is_test and not recipient_override:
        try:
            if hasattr(user, 'report_schedule') and not user.report_schedule.send_down_alerts:
                return False, "Down alerts disabled in user settings"
        except Exception:
            pass

    recipient = recipient_override.strip() if recipient_override else project.get_alert_recipient_email()
    if not recipient:
        recipient = getattr(settings, 'EMAIL_HOST_USER', 'rushikeshpawar977@gmail.com')

    now = timezone.localtime()
    timestamp_str = now.strftime("%B %d, %Y at %I:%M:%S %p %Z")

    error_desc = record.error_message or (f"HTTP Status {record.http_status_code}" if record.http_status_code else "Server unreachable")
    http_code_display = str(record.http_status_code) if record.http_status_code else "NO RESPONSE"

    test_prefix = "[TEST ALERT] " if is_test else ""
    subject = f"🚨 {test_prefix}[RED ALERT] Website DOWN: {project.name} ({monitor.url})"

    badge_text = "🚨 TEST OUTAGE SIMULATION" if is_test else "🚨 CRITICAL OUTAGE RED ALERT"
    banner_desc = (
        f"This is a verified test dispatch to confirm that outage alerts immediately reach <strong>{recipient}</strong>."
        if is_test else
        "SiteShield 24 Monitor synthetic scanner detected that your website endpoint failed its availability health check."
    )

    project_link = f"http://localhost:5173/projects/{project.id}" if hasattr(project, 'id') and project.id else "http://localhost:5173/projects"

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>{subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fef2f2; color: #1e293b;">
      <div style="max-width: 620px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 2px solid #ef4444; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.15);">
        
        <!-- Emergency Red Header -->
        <div style="background: linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #ef4444 100%); padding: 32px 28px; text-align: left; color: #ffffff;">
          <div style="display: inline-block; background-color: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.4); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;">
            {badge_text}
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; line-height: 1.2;">
            Website Down: {project.name}
          </h1>
          <div style="margin-top: 8px; font-size: 13px; color: #fecaca;">
            Target URL: <strong style="color: #ffffff;">{monitor.url}</strong>
          </div>
        </div>

        <!-- Alert Content Body -->
        <div style="padding: 28px 24px;">
          <div style="background-color: #fff1f2; border-left: 5px solid #e11d48; padding: 14px 18px; border-radius: 6px; margin-bottom: 24px;">
            <div style="font-size: 13px; font-weight: 700; color: #9f1239; margin-bottom: 4px;">
              Immediate Action Required
            </div>
            <div style="font-size: 14px; color: #881337; line-height: 1.5;">
              {banner_desc}
            </div>
          </div>

          <!-- Outage Details Grid -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
              Incident Technical Diagnostics
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 140px; font-weight: 600;">Status:</td>
                <td style="padding: 6px 0;">
                  <span style="background-color: #fef2f2; color: #dc2626; border: 1px solid #fecaca; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 12px;">
                    ● DOWN (OUTAGE)
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">HTTP Status Code:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #b91c1c; font-family: monospace;">{http_code_display}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Failure Reason:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">{error_desc}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Detected Timestamp:</td>
                <td style="padding: 6px 0; color: #334155;">{timestamp_str}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Latency:</td>
                <td style="padding: 6px 0; color: #334155;">{record.response_time} ms</td>
              </tr>
            </table>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 28px 0;">
            <a href="{project_link}" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);">
              Inspect Live Incident in Console →
            </a>
          </div>

          <!-- SRE Checklist -->
          <div style="font-size: 12px; color: #475569; background-color: #f1f5f9; padding: 14px 18px; border-radius: 6px; line-height: 1.6;">
            <strong>Recommended Immediate Steps:</strong>
            <ul style="margin: 6px 0 0 16px; padding: 0;">
              <li>Verify web server and reverse proxy processes (Nginx / Apache / Cloudflare).</li>
              <li>Inspect application server error logs for fatal exceptions or memory issues.</li>
              <li>Confirm domain DNS resolution and SSL/TLS certificate validity.</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 18px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          Sent to <strong>{recipient}</strong> by SiteShield 24 Monitor Emergency Alert Engine.<br>
          Automated Red Alert Notification • Dispatched via Google SMTP
        </div>
      </div>
    </body>
    </html>
    """

    plain_text = f"""
🚨 {test_prefix}[RED ALERT] WEBSITE DOWN: {project.name}
Target URL: {monitor.url}
Status: DOWN
HTTP Code: {http_code_display}
Reason: {error_desc}
Detected At: {timestamp_str}

Please inspect your application server immediately.
Dashboard: {project_link}

SiteShield 24 Monitor Emergency Alert System
    """.strip()

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'SiteShield 24 Monitor <rushikeshpawar977@gmail.com>')
    try:
        msg = EmailMultiAlternatives(subject, plain_text, from_email, [recipient])
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)

        real_project = project if (hasattr(project, 'pk') and project.pk) else None
        real_user = user if (hasattr(user, 'pk') and user.pk) else None

        if real_user:
            ReportEmailLog.objects.create(
                user=real_user,
                recipient_email=recipient,
                report_type='RED_ALERT_DOWN',
                subject=subject,
                project=real_project,
                status='SENT'
            )
        return True, recipient
    except Exception as e:
        real_project = project if (hasattr(project, 'pk') and project.pk) else None
        real_user = user if (hasattr(user, 'pk') and user.pk) else None
        if real_user:
            ReportEmailLog.objects.create(
                user=real_user,
                recipient_email=recipient,
                report_type='RED_ALERT_DOWN',
                subject=subject,
                project=real_project,
                status='FAILED',
                error_message=str(e)
            )
        return False, str(e)


def send_test_red_alert_email(project=None, user=None, recipient_email=None):
    """
    Dispatches a sample Red Alert outage email to test emergency alert delivery and email layout.
    """
    if not user and project:
        user = project.user

    recipient = recipient_email.strip() if recipient_email else None
    if not recipient and project:
        recipient = project.get_alert_recipient_email()
    if not recipient and user:
        try:
            if hasattr(user, 'report_schedule') and user.report_schedule.recipient_email:
                recipient = user.report_schedule.recipient_email.strip()
        except Exception:
            pass
        if not recipient:
            recipient = user.email

    if not recipient:
        recipient = getattr(settings, 'EMAIL_HOST_USER', 'rushikeshpawar977@gmail.com')

    if not project and user:
        project = Project.objects.filter(user=user).first()

    if not project:
        class MockProject:
            def __init__(self, owner, email_to):
                self.id = 1
                self.name = "Production Web Gateway"
                self.user = owner
                self.recipient = email_to

            def get_alert_recipient_email(self):
                return self.recipient
        project = MockProject(user, recipient)

    monitor = project.monitors.first() if hasattr(project, 'monitors') else None

    class MockMonitor:
        def __init__(self, parent_proj, target_url, monitor_name):
            self.project = parent_proj
            self.url = target_url
            self.name = monitor_name

    active_url = getattr(monitor, 'url', None) or "https://myapp.production.com"
    active_name = getattr(monitor, 'name', None) or f"{project.name} HTTP"
    active_monitor = monitor or MockMonitor(project, active_url, active_name)

    class MockRecord:
        http_status_code = 503
        error_message = "Service Unavailable / Connection Timeout (Synthetic Red Alert Test)"
        response_time = 4120

    mock_rec = MockRecord()
    return send_red_alert_down_email(
        monitor=active_monitor,
        record=mock_rec,
        incident=None,
        recipient_override=recipient,
        is_test=True
    )


def send_alert_recovered_email(monitor, record, incident=None):
    """
    Sends a Recovery Alert email when a website comes back UP.
    """
    project = monitor.project
    user = project.user
    recipient = project.get_alert_recipient_email()
    if not recipient:
        recipient = getattr(settings, 'EMAIL_HOST_USER', 'rushikeshpawar977@gmail.com')

    duration_mins = incident.duration if (incident and incident.duration) else 1
    now = timezone.localtime()
    timestamp_str = now.strftime("%B %d, %Y at %I:%M:%S %p %Z")
    subject = f"✅ [RESOLVED] Website Back Online: {project.name} ({monitor.url})"

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><title>{subject}</title></head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f0fdf4; color: #1e293b;">
      <div style="max-width: 620px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 2px solid #10b981; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.15);">
        <div style="background: linear-gradient(135deg, #065f46 0%, #059669 50%, #10b981 100%); padding: 32px 28px; color: #ffffff;">
          <div style="display: inline-block; background-color: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.4); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;">
            ✅ OUTAGE RESOLVED
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Website Recovered: {project.name}</h1>
          <div style="margin-top: 8px; font-size: 13px; color: #d1fae5;">Target URL: <strong>{monitor.url}</strong></div>
        </div>
        <div style="padding: 28px 24px;">
          <div style="background-color: #ecfdf5; border-left: 5px solid #10b981; padding: 14px 18px; border-radius: 6px; margin-bottom: 24px; color: #065f46;">
            <strong>All Systems Restored:</strong> Endpoint has successfully recovered and is responding with HTTP {record.http_status_code or 200}.
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
            <tr><td style="padding: 6px 0; color: #64748b; width: 140px; font-weight: 600;">Status:</td><td style="padding: 6px 0; color: #10b981; font-weight: 800;">● UP (ONLINE)</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Total Downtime:</td><td style="padding: 6px 0; font-weight: 700; color: #0f172a;">{duration_mins} minute(s)</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Latest Response Time:</td><td style="padding: 6px 0; font-weight: 700; color: #0f172a;">{record.response_time} ms</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Resolved At:</td><td style="padding: 6px 0; color: #334155;">{timestamp_str}</td></tr>
          </table>
          <div style="text-align: center; margin: 24px 0;">
            <a href="http://localhost:5173/projects/{project.id}" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
              View Health Dashboard →
            </a>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          Sent to <strong>{recipient}</strong> by SiteShield 24 Monitor Recovery Dispatcher.
        </div>
      </div>
    </body>
    </html>
    """
    plain_text = f"✅ [RESOLVED] Website Back Online: {project.name}\nURL: {monitor.url}\nDowntime: {duration_mins} mins\nLatency: {record.response_time}ms"

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'SiteShield 24 Monitor <rushikeshpawar977@gmail.com>')
    try:
        msg = EmailMultiAlternatives(subject, plain_text, from_email, [recipient])
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)

        ReportEmailLog.objects.create(
            user=user,
            recipient_email=recipient,
            report_type='ALERT_RECOVERED',
            subject=subject,
            project=project,
            status='SENT'
        )
        return True, recipient
    except Exception as e:
        return False, str(e)
