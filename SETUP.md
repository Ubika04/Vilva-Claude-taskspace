# Vilva Taskspace — Developer Setup Guide

## Prerequisites
- Docker + Docker Compose
- Node.js 20+
- PHP 8.3+ (for local dev without Docker)
- Composer 2.x

---

## Quick Start (Docker)

```bash
# 1. Clone and enter project
cd "ilva taskapce"

# 2. Copy environment file
cp backend/.env.example backend/.env

# 3. Fill in your credentials in backend/.env
#    (DB passwords, S3/DO Spaces keys, etc.)

# 4. Start all services
docker compose up -d

# 5. Generate app key
docker exec vilva_php php artisan key:generate

# 6. Run migrations + seeders
docker exec vilva_php php artisan migrate --seed

# 7. Create Horizon symlinks
docker exec vilva_php php artisan horizon:install

# 8. Link storage
docker exec vilva_php php artisan storage:link

# 9. Open app
open http://localhost
# API:      http://localhost/api/v1
# Horizon:  http://localhost/horizon
# Frontend: http://localhost:3000 (dev server)
```

---

## Backend Only (No Docker)

```bash
cd backend

composer install

cp .env.example .env
php artisan key:generate

# Update .env with your DB/Redis credentials

php artisan migrate --seed

php artisan serve          # http://localhost:8000

# Queue worker (separate terminal)
php artisan queue:work --queue=default,notifications,heavy

# Scheduler (separate terminal)
php artisan schedule:work
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev                # http://localhost:3000
```

---

## Production Build

```bash
# Frontend
cd frontend && npm run build
# Outputs to frontend/dist/ — serve via Nginx

# Backend
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

---

## Key API Endpoints (Quick Reference)

```
POST /api/v1/register           Register
POST /api/v1/login              Login → returns Bearer token

GET  /api/v1/dashboard          Dashboard data
GET  /api/v1/projects           List projects
POST /api/v1/projects           Create project
GET  /api/v1/projects/{id}/kanban  Kanban board data

POST /api/v1/tasks/{id}/timer/start   Start timer
POST /api/v1/tasks/{id}/timer/stop    Stop timer
POST /api/v1/tasks/{id}/move          Move task (Kanban DnD)

GET  /api/v1/notifications/unread     Unread notifications
GET  /api/v1/reports/time-tracking    Time tracking report
```

---

## Default Credentials (after seeding)

| Role  | Email                    | Password      |
|-------|--------------------------|---------------|
| Admin | admin@vilva.example.com  | password123   |

---

## Directory Structure

```
ilva taskapce/
├── backend/                    Laravel 11 API
│   ├── app/
│   │   ├── Console/
│   │   │   └── Kernel.php      Scheduled jobs
│   │   ├── Events/             Domain events
│   │   ├── Http/
│   │   │   ├── Controllers/API/ REST controllers
│   │   │   ├── Middleware/
│   │   │   ├── Requests/       Form validation
│   │   │   └── Resources/      API transformers
│   │   ├── Jobs/               Queue jobs
│   │   ├── Listeners/          Event listeners
│   │   ├── Models/             Eloquent models
│   │   ├── Notifications/      DB notifications
│   │   ├── Policies/           RBAC policies
│   │   ├── Providers/          Service providers
│   │   ├── Repositories/       Data access layer
│   │   └── Services/           Business logic
│   ├── database/
│   │   ├── migrations/         9 migration files
│   │   └── seeders/            Role + Permission seeder
│   ├── routes/
│   │   └── api.php             Full REST API routes
│   └── config/horizon.php      Queue config
│
├── frontend/                   Vite + Vanilla JS SPA
│   ├── index.html              App shell
│   ├── vite.config.js
│   └── src/
│       ├── api/                API client + endpoints
│       ├── assets/css/         Global styles
│       ├── components/         modal, toast, taskCard
│       ├── modules/            dashboard, projects, tasks,
│       │                       kanban, timer, notifications, reports, auth
│       ├── store/              Reactive state store
│       └── utils/              helpers
│
├── docker/
│   ├── nginx/default.conf      Nginx + SSL config
│   ├── php/Dockerfile          PHP 8.3-FPM
│   └── mysql/my.cnf            MySQL tuning
│
├── docker-compose.yml          Full stack orchestration
├── ARCHITECTURE.md             System design diagrams
├── SCALABILITY.md              Scaling + security guide
└── SETUP.md                    This file
```
