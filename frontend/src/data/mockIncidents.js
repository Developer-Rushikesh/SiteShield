export const mockIncidents = [
  {
    id: 1,
    monitor: 4,
    monitor_name: "Payment Gateway Callback",
    monitor_url: "https://httpbin.org/status/500",
    started_at: "2026-10-06T11:51:00Z",
    resolved_at: null,
    status: "OPEN",
    reason: "Internal Server Error (HTTP 500)",
    http_status_code: 500,
    duration: null,
    created_at: "2026-10-06T11:51:00Z"
  },
  {
    id: 2,
    monitor: 1,
    monitor_name: "Khet Saathi Main HTTP",
    monitor_url: "https://khet-saathi-wheat.vercel.app",
    started_at: "2026-10-04T09:15:00Z",
    resolved_at: "2026-10-04T09:30:00Z",
    status: "RESOLVED",
    reason: "Gateway Timeout (HTTP 504)",
    http_status_code: 504,
    duration: 15,
    created_at: "2026-10-04T09:15:00Z"
  }
];
