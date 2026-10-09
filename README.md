# 24/7 Website Monitoring & Uptime SaaS Application

A full-stack, enterprise-grade 24/7 Website & Web Application Monitoring SaaS solution built with **Django REST Framework (Backend)**, **SQLite (Database)**, and **React + Vite + Recharts (Frontend)**.

---

## 🌟 Key Features

* **Real HTTP/HTTPS Website Ping & Health Checks**: Measures HTTP status codes, response duration (in ms), timeouts, and network/SSL errors.
* **SSRF Protection & URL Security**: Built-in validation blocking loopback (`127.0.0.1`, `localhost`), internal RFC1918 private IP ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`), and non-HTTP protocols.
* **Instant "Check Now" Trigger**: Allows users to trigger immediate website health checks from the dashboard UI.
* **Intelligent Incident Management**: Groups consecutive failures into a single **OPEN Incident**, records downtime duration upon recovery, and avoids notification spam.
* **Automated Alert Notifications**: Generates real-time alerts for **Website Down**, **Website Recovered**, and **Slow Response (>1500ms)**.
* **Interactive SaaS Dashboard**: Recharts-powered visualization for average response times, uptime trends, HTTP status distributions, and health score widget.
* **User Isolation & Token Auth**: Endpoints are strictly scoped to the authenticated user's projects and monitors.

---

## 📁 Repository Structure

```text
24 monitor/
├── backend/                  # Django REST API Backend
│   ├── manage.py
│   ├── config/               # Project Settings & Routing
│   ├── users/                # Authentication & User Profiles
│   ├── projects/             # Project Management
│   ├── monitors/             # Monitors, Records, Incidents & Monitoring Service
│   │   ├── services/
│   │   │   └── monitoring_service.py # Core HTTP ping, SSRF check, incident engine
│   │   └── management/
│   │       └── commands/
│   │           ├── seed_demo.py     # python manage.py seed_demo
│   │           └── check_monitors.py# python manage.py check_monitors
│   ├── notifications/        # Real-time Alert Notifications
│   ├── requirements.txt
│   ├── .env.example
│   └── db.sqlite3
│
├── frontend/                 # React + Vite SaaS Frontend
│   ├── src/
│   │   ├── components/       # Reusable Cards, Badges, Charts, Tables, Dropdowns
│   │   ├── context/          # AuthContext
│   │   ├── data/             # Centralized Mock Fallbacks
│   │   ├── pages/            # Login, Register, Dashboard, Projects, Detail, Settings
│   │   ├── services/         # Axios API Services (Auth, Project, Monitor, Dashboard)
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup (Django)

```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
# On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations users projects monitors notifications
python manage.py migrate

# Seed Demo Data (Creates demo user, projects, monitors, and history)
python manage.py seed_demo

# Run backend development server
python manage.py runserver 8000
```

*Backend server will start at:* `http://127.0.0.1:8000/`

---

### 2. Frontend Setup (React + Vite)

```bash
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```

*Frontend application will start at:* `http://localhost:5173/`

---

## 🔑 Demo Login Credentials

* **Email**: `demo@example.com`
* **Password**: `password123`

---

## 🔐 Environment Variables

### Backend `.env` (`backend/.env`)

```env
SECRET_KEY=django-insecure-24monitor-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Frontend `.env` (`frontend/.env`)

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

---

## 📡 Key API Endpoints

### Authentication
* `POST /api/auth/register/` - Register new account
* `POST /api/auth/login/` - Login & obtain token
* `POST /api/auth/logout/` - Invalidate session/token
* `GET  /api/auth/me/` - Get authenticated profile

### Projects
* `GET  /api/projects/` - List user projects
* `POST /api/projects/` - Create new project
* `GET  /api/projects/<id>/` - Retrieve project detail
* `PATCH /api/projects/<id>/` - Update project settings
* `DELETE /api/projects/<id>/` - Delete project

### Monitors & Real Pings
* `GET  /api/monitors/` - List user monitors
* `POST /api/monitors/` - Create monitor
* `POST /api/monitors/<id>/check/` - **Trigger immediate HTTP ping**
* `GET  /api/monitors/<id>/history/` - Get check history records
* `GET  /api/monitors/<id>/statistics/` - Get Recharts metrics (uptime, response time series, status distribution)
* `GET  /api/monitors/<id>/incidents/` - Get incident log

### Notifications & Dashboard
* `GET   /api/notifications/` - List alerts
* `PATCH /api/notifications/<id>/read/` - Mark single alert read
* `POST  /api/notifications/read-all/` - Mark all alerts read
* `GET   /api/dashboard/summary/` - Aggregate metrics for main dashboard UI

---

## 📮 Postman Testing Instructions

1. **Register User**:
   - `POST http://127.0.0.1:8000/api/auth/register/`
   - Body: `{"email": "test@example.com", "password": "password123", "name": "Test User"}`
2. **Login**:
   - `POST http://127.0.0.1:8000/api/auth/login/`
   - Copy returned `token` key.
3. **Set Auth Header**:
   - Header: `Authorization: Token <YOUR_TOKEN>`
4. **Create Project**:
   - `POST http://127.0.0.1:8000/api/projects/`
   - Body: `{"name": "Production App", "description": "Main website"}`
5. **Create Monitor**:
   - `POST http://127.0.0.1:8000/api/monitors/`
   - Body: `{"project": 1, "name": "Main Site", "url": "https://khet-saathi-wheat.vercel.app", "check_interval": 5, "timeout": 10}`
6. **Trigger Check Now**:
   - `POST http://127.0.0.1:8000/api/monitors/1/check/`
   - Verifies real HTTP request, measures response time in ms, updates database record.
7. **Get Statistics**:
   - `GET http://127.0.0.1:8000/api/monitors/1/statistics/`

---

## 🔄 Future Celery + Redis Production Architecture Plan

In production environments requiring continuous background checking across thousands of URLs:

1. **Celery Beat**: Schedules periodic tasks based on `monitor.check_interval`.
2. **Redis**: Acts as the message broker and cache layer.
3. **Celery Workers**: Execute `check_website(monitor)` asynchronously in parallel worker pools.

---

## 🧪 Running Unit Tests

```bash
cd backend
python manage.py test
```
