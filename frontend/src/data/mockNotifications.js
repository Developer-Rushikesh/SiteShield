export const mockNotifications = [
  {
    id: 1,
    user: 1,
    project: 4,
    project_name: "Legacy Microservice",
    monitor: 4,
    monitor_name: "Payment Gateway Callback",
    type: "DOWN",
    title: "Website Down: Payment Gateway Callback",
    message: "'Payment Gateway Callback' is currently down due to HTTP 500 Internal Server Error.",
    is_read: false,
    created_at: "2026-10-06T11:51:00Z"
  },
  {
    id: 2,
    user: 1,
    project: 1,
    project_name: "Khet Saathi",
    monitor: 1,
    monitor_name: "Khet Saathi Main HTTP",
    type: "SLOW",
    title: "Slow Response: Khet Saathi Main HTTP",
    message: "'Khet Saathi Main HTTP' response time exceeded threshold (1650ms).",
    is_read: false,
    created_at: "2026-10-06T12:20:00Z"
  },
  {
    id: 3,
    user: 1,
    project: 1,
    project_name: "Khet Saathi",
    monitor: 1,
    monitor_name: "Khet Saathi Main HTTP",
    type: "RECOVERED",
    title: "Website Recovered: Khet Saathi Main HTTP",
    message: "'Khet Saathi Main HTTP' is back online. Response time: 245ms.",
    is_read: true,
    created_at: "2026-10-04T09:30:00Z"
  }
];
