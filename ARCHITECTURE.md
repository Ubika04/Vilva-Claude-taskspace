# Vilva Taskspace — System Architecture

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        VILVA TASKSPACE                                  │
│                   Enterprise Task Management SaaS                       │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│  FRONTEND LAYER  (Vite + Vanilla JS)                                     │
│                                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Dashboard │  │Projects  │  │ Kanban   │  │  Timer   │  │ Reports  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                                          │
│  apiClient.js → fetch() → Bearer Token (Sanctum) → REST API             │
└──────────────────────────────────────────────────────────────────────────┘
                              │  HTTPS / JSON
                              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  NGINX REVERSE PROXY (Port 80/443)                                       │
│  SSL Termination · Gzip · Rate Limiting                                  │
└──────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  LARAVEL 11 REST API (PHP-FPM)                                           │
│                                                                          │
│  routes/api.php                                                          │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  HTTP Layer                                                      │    │
│  │  Middleware: auth:sanctum · throttle · CORS · ForceJson          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Controllers  (app/Http/Controllers/API/)                        │    │
│  │  FormRequest Validation → Policy Check → Service Call           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Service Layer  (app/Services/)                                  │    │
│  │  Business Logic · Event Dispatch · Job Dispatch                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Repository Layer  (app/Repositories/)                           │    │
│  │  Data Access · Query Optimisation · Cache Layer                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Eloquent Models  (app/Models/)                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
         │                    │                      │
         ▼                    ▼                      ▼
  ┌────────────┐      ┌──────────────┐      ┌──────────────┐
  │   MySQL    │      │    Redis     │      │  S3 / DO     │
  │  Database  │      │  Cache+Queue │      │  Spaces      │
  └────────────┘      └──────────────┘      └──────────────┘
                              │
                              ▼
                      ┌──────────────┐
                      │Queue Workers │
                      │(Horizon)     │
                      └──────────────┘

```

---

## 2. Authentication Flow (Laravel Sanctum)

```
Client                          API                          Database
  │                              │                               │
  │── POST /api/login ──────────>│                               │
  │   {email, password}          │── validate credentials ──────>│
  │                              │<── user record ───────────────│
  │                              │── generate token ─────────────│
  │<── 200 {token, user} ────────│                               │
  │                              │                               │
  │── GET /api/projects ────────>│                               │
  │   Authorization: Bearer xxx  │── auth:sanctum middleware      │
  │                              │── find token in DB ───────────>│
  │                              │<── valid token ────────────────│
  │<── 200 {projects} ───────────│                               │
  │                              │                               │
  │── POST /api/logout ─────────>│                               │
  │                              │── delete current token ───────>│
  │<── 204 No Content ───────────│                               │
```

---

## 3. File Upload Flow (DigitalOcean Spaces)

```
Client                   API                    S3/DO Spaces          Database
  │                       │                          │                    │
  │── POST /api/tasks/    │                          │                    │
  │   {id}/attachments    │                          │                    │
  │   multipart/form-data │                          │                    │
  │──────────────────────>│                          │                    │
  │                       │── ValidateFile           │                    │
  │                       │── Generate UUID path     │                    │
  │                       │── Storage::disk('s3')    │                    │
  │                       │   ->put(path, file) ────>│                    │
  │                       │<── S3 URL ───────────────│                    │
  │                       │── Store attachment ─────────────────────────>│
  │<── 201 {attachment} ──│                          │                    │
```

---

## 4. Notification Event Flow

```
Action (e.g. Task Assigned)
          │
          ▼
   TaskAssigned Event dispatched
          │
          ▼
   SendTaskAssignedNotification Listener
          │
          ├──► Database Notification (notifications table)
          │
          └──► BroadcastNotification Job → Redis Queue
                        │
                        ▼
               Queue Worker processes
                        │
                        ▼
               WebSocket broadcast (future: Pusher/Soketi)
```

---

## 5. Time Tracking Logic

```
User → POST /api/tasks/{id}/start-timer
              │
              ▼
        TimerService::start()
              │
        Check: any active timer for this user?
              │
         YES ─┴─ NO
          │         │
        409       Create task_time_log
        Error     {user_id, task_id, start_time, status=active}
                     │
                     ▼
                  Return log

User → POST /api/tasks/{id}/pause-timer
              │
        Find active log for user+task
        Set paused_at = now()
        Set status = paused

User → POST /api/tasks/{id}/resume-timer
              │
        Find paused log for user+task
        Accumulate elapsed = paused_at - start_time
        Set new start_time = now(), status = active

User → POST /api/tasks/{id}/stop-timer
              │
        Find active/paused log
        Calculate total duration
        Set end_time = now(), status = stopped
        Update task total_time_spent
```

---

## 6. Kanban Board Flow

```
User drags Task Card from "To Do" → "In Progress"
              │
              ▼ (JavaScript)
   Optimistic UI Update:
   - Remove card from source column DOM
   - Insert card into target column DOM
   - Show loading indicator on card
              │
              ▼
   POST /api/tasks/{id}/move
   { status: "in_progress", position: 3 }
              │
              ▼
   API validates status transition
   Updates task.status + task.position in DB
   Dispatches TaskStatusChanged event
              │
         SUCCESS ──── FAILURE
              │              │
   Remove loading     Revert optimistic
   indicator          UI update
                      Show error toast
```
