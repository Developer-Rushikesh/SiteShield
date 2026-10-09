import time
import socket
import ipaddress
from urllib.parse import urlparse
import requests
from django.utils import timezone
from django.db import transaction
from monitors.models import Monitor, MonitoringRecord, Incident
from notifications.models import Notification

DISALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '::1']

def is_ip_private(ip_str):
    try:
        ip = ipaddress.ip_address(ip_str)
        return ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved
    except ValueError:
        return False

def validate_url_security(url):
    """
    Validates URL to prevent SSRF attacks.
    Disallows internal network IP ranges, localhost, and non-http(s) schemes.
    """
    if not url:
        raise ValueError("URL is required.")

    parsed = urlparse(url)
    if parsed.scheme not in ['http', 'https']:
        raise ValueError("Only http:// and https:// URLs are allowed.")

    hostname = parsed.hostname
    if not hostname:
        raise ValueError("Invalid hostname in URL.")

    if hostname.lower() in DISALLOWED_HOSTS:
        raise ValueError("Monitoring internal loopback addresses is not permitted.")

    try:
        # Resolve hostname to IP address
        ip_list = socket.getaddrinfo(hostname, None)
        for item in ip_list:
            ip_str = item[4][0]
            if is_ip_private(ip_str):
                raise ValueError(f"Domain resolves to private/internal IP address ({ip_str}), which is restricted.")
    except socket.gaierror:
        # DNS resolution error will be handled gracefully during HTTP check
        pass

def check_website(monitor: Monitor):
    """
    Performs an HTTP check on the monitor's URL, calculates response time,
    determines UP/DOWN/WARNING status, records history, handles incidents,
    and dispatches notifications.
    """
    now = timezone.now()
    error_msg = ''
    http_code = None
    status = 'DOWN'
    response_time_ms = 0

    # Step 1: Validate URL security (SSRF prevention)
    try:
        validate_url_security(monitor.url)
    except ValueError as val_err:
        status = 'DOWN'
        error_msg = str(val_err)
        return _record_and_update(monitor, status, http_code, response_time_ms, error_msg, now)

    # Step 2: Perform HTTP GET request
    headers = {
        'User-Agent': '24Monitor-Bot/1.0 (+https://24monitor.local)'
    }
    
    start_time = time.time()
    try:
        response = requests.get(
            monitor.url,
            headers=headers,
            timeout=monitor.timeout,
            allow_redirects=True,
            verify=True
        )
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        http_code = response.status_code

        # Step 3: Determine Status Rules
        if 200 <= http_code < 400:
            if response_time_ms >= 1500:
                status = 'WARNING'
                error_msg = f"Slow response time: {response_time_ms}ms (threshold: 1500ms)"
            else:
                status = 'UP'
                error_msg = ''
        else:
            status = 'DOWN'
            error_msg = f"Server returned HTTP status code {http_code}"

    except requests.exceptions.Timeout:
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        status = 'DOWN'
        error_msg = f"Request timed out after {monitor.timeout} seconds"
    except requests.exceptions.SSLError as e:
        status = 'DOWN'
        error_msg = f"SSL Verification Failed: {str(e)}"
    except requests.exceptions.ConnectionError as e:
        status = 'DOWN'
        error_msg = "Connection failed or host unreachable (DNS/Network failure)"
    except Exception as e:
        status = 'DOWN'
        error_msg = f"HTTP request failed: {str(e)}"

    return _record_and_update(monitor, status, http_code, response_time_ms, error_msg, now)


def _record_and_update(monitor: Monitor, status: str, http_code: int, response_time_ms: int, error_msg: str, checked_at):
    with transaction.atomic():
        # Save MonitoringRecord
        record = MonitoringRecord.objects.create(
            monitor=monitor,
            status=status,
            http_status_code=http_code,
            response_time=response_time_ms,
            error_message=error_msg
        )

        # Update Monitor status & last_checked_at
        monitor.current_status = status
        monitor.last_checked_at = checked_at
        monitor.save(update_fields=['current_status', 'last_checked_at', 'updated_at'])

        # Handle Incidents
        open_incident = Incident.objects.filter(monitor=monitor, status='OPEN').first()

        if status == 'DOWN':
            if not open_incident:
                # Create NEW open incident
                incident = Incident.objects.create(
                    monitor=monitor,
                    started_at=checked_at,
                    status='OPEN',
                    reason=error_msg or "Service unreachable",
                    http_status_code=http_code
                )
                # Dispatch Website Down notification
                Notification.objects.create(
                    user=monitor.project.user,
                    project=monitor.project,
                    monitor=monitor,
                    type='DOWN',
                    title=f"Website Down: {monitor.name}",
                    message=f"'{monitor.name}' ({monitor.url}) is currently DOWN. Reason: {error_msg or 'HTTP Failure'}"
                )
        elif status in ['UP', 'WARNING']:
            if open_incident:
                # Resolve active incident
                started = open_incident.started_at
                duration_mins = max(1, int((checked_at - started).total_seconds() / 60))
                open_incident.resolved_at = checked_at
                open_incident.status = 'RESOLVED'
                open_incident.duration = duration_mins
                open_incident.save()

                # Dispatch Website Recovered notification
                Notification.objects.create(
                    user=monitor.project.user,
                    project=monitor.project,
                    monitor=monitor,
                    type='RECOVERED',
                    title=f"Website Recovered: {monitor.name}",
                    message=f"'{monitor.name}' ({monitor.url}) has recovered and is back online. Response time: {response_time_ms}ms"
                )

            # Throttle slow response notifications
            if status == 'WARNING':
                one_hour_ago = checked_at - timezone.timedelta(hours=1)
                recent_slow_notif = Notification.objects.filter(
                    monitor=monitor,
                    type='SLOW',
                    created_at__gte=one_hour_ago
                ).exists()

                if not recent_slow_notif:
                    Notification.objects.create(
                        user=monitor.project.user,
                        project=monitor.project,
                        monitor=monitor,
                        type='SLOW',
                        title=f"Slow Response: {monitor.name}",
                        message=f"'{monitor.name}' ({monitor.url}) response time exceeded threshold ({response_time_ms}ms)."
                    )

    return record
