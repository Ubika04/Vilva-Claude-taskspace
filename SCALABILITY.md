# Vilva Taskspace — Scalability & Security Design

## 1. Redis Caching Strategy

```
Layer                   TTL       Keys
──────────────────────────────────────────────
Dashboard per user      60s       dashboard:{user_id}
Project stats           300s      project:{id}:stats
User permissions        600s      user:{id}:perms
Kanban board            30s       kanban:{project_id}

Invalidation Strategy:
  - Cache-aside pattern
  - Event-driven invalidation (TaskService, ProjectService)
  - Cache::tags(['project:{id}']) for grouped invalidation
```

## 2. Queue Architecture (Redis + Horizon)

```
Queue Name       Workers   Use Case
──────────────────────────────────────────────
default          3         General jobs
notifications    5         Email + DB notifications
heavy            2         Report generation, bulk ops

Job Classes:
  - SendDeadlineReminders     → notifications queue
  - RecalculateProjectProgress → default queue
  - GenerateReport             → heavy queue
  - SendEmailNotification      → notifications queue
```

## 3. Database Indexing Strategy

```sql
-- Composite indexes for common queries
INDEX (project_id, status, position)     -- Kanban board
INDEX (project_id, due_date)             -- Deadline queries
INDEX (user_id, status)                  -- Timer lookups
INDEX (subject_type, subject_id, created_at) -- Activity logs

-- Full-text search (optional)
ALTER TABLE tasks ADD FULLTEXT INDEX ft_title_desc (title, description);
ALTER TABLE projects ADD FULLTEXT INDEX ft_name_desc (name, description);
```

## 4. Horizontal Scaling

```
                    ┌──────────────────────────────┐
                    │     Load Balancer (HAProxy)   │
                    └──────────┬───────────┬────────┘
                               │           │
                    ┌──────────▼──┐  ┌─────▼────────┐
                    │  App Server  │  │  App Server   │
                    │  (Laravel 1) │  │  (Laravel 2)  │
                    └──────────┬──┘  └─────┬─────────┘
                               │           │
                    ┌──────────▼───────────▼────────┐
                    │        Redis Cluster           │
                    │  (Sessions, Cache, Queues)     │
                    └──────────┬────────────────────┘
                               │
                    ┌──────────▼────────────────────┐
                    │    MySQL RDS (Primary+Replica) │
                    │    Read Replica for Reports    │
                    └───────────────────────────────┘
```

## 5. Security Checklist

### API Security
- [x] Laravel Sanctum token authentication
- [x] Token expiry + rotation
- [x] ForceJson middleware on all API routes
- [x] Input validation via FormRequest classes
- [x] CORS configured via Laravel's cors config
- [x] Rate limiting: 60 requests/min per IP (`throttle:api`)
- [x] API versioning (/api/v1/)

### File Upload Security
- [x] MIME type whitelist validation
- [x] Max file size: 25MB
- [x] Files stored privately on S3 (not publicly accessible)
- [x] Signed temporary URLs (30 minutes)
- [x] UUID-named files (prevent enumeration)
- [x] No execution of uploaded files

### Database Security
- [x] Eloquent ORM (parameterized queries, no raw SQL injection)
- [x] Soft deletes (data retention)
- [x] Sensitive fields excluded from serialization
- [x] Password hashing via bcrypt (Laravel's `hashed` cast)

### Policy-based RBAC
```
Role         | Projects | Tasks  | Members | Reports
─────────────┼──────────┼────────┼─────────┼────────
Owner        | Full     | Full   | Full    | Full
Admin        | Full     | Full   | Full    | Full
Manager      | R/W      | Full   | R/W     | R
Member       | R        | R/W    | —       | —
Guest        | R        | R      | —       | —
```

### Infrastructure Security
- [x] HTTPS only (HTTP → HTTPS redirect)
- [x] TLS 1.2/1.3, strong ciphers
- [x] HSTS header (1 year)
- [x] X-Frame-Options, X-XSS-Protection headers
- [x] OPcache enabled (no source file scanning)
- [x] PHP expose_php=Off
- [x] MySQL root password required
- [x] Redis password required

## 6. WebSocket Future Plan (Realtime)

```
Current:     Poll notifications every 30s (Notifications module)

Future Plan:
  1. Install Laravel Reverb (built-in WebSocket server)
     or Soketi (open-source Pusher-compatible)
  2. Add channel bindings in EventServiceProvider
  3. Frontend: Replace setInterval with Echo.channel().listen()

Example:
  // Frontend
  Echo.private(`user.${userId}`)
      .notification((notification) => {
          refreshUnread();
      });
```
