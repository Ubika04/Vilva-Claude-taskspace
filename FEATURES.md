# Vilva Taskspace — Complete Feature Documentation

> Enterprise Task Management SaaS Platform
> Tech Stack: Laravel 11 + Vanilla JS + Vite + MySQL + Redis + Docker

---

## Table of Contents

1. [Authentication & User Management](#1-authentication--user-management)
2. [Dashboard](#2-dashboard)
3. [Project Management](#3-project-management)
4. [Task Management](#4-task-management)
5. [Kanban Board & Drag-and-Drop](#5-kanban-board--drag-and-drop)
6. [List View & Sorting](#6-list-view--sorting)
7. [Task Types & Subtasks](#7-task-types--subtasks)
8. [Task Status Workflow](#8-task-status-workflow)
9. [Review Workflow](#9-review-workflow)
10. [Pomodoro Timer & Time Tracking](#10-pomodoro-timer--time-tracking)
11. [Timeboxing](#11-timeboxing)
12. [Auto-Timer on "Working On"](#12-auto-timer-on-working-on)
13. [Task Dependencies](#13-task-dependencies)
14. [Scoring Methodology](#14-scoring-methodology)
15. [Reporting & Analytics](#15-reporting--analytics)
16. [Comments & Collaboration](#16-comments--collaboration)
17. [File Attachments](#17-file-attachments)
18. [Notifications](#18-notifications)
19. [Goals & Milestones](#19-goals--milestones)
20. [AI Integration (Claude)](#20-ai-integration-claude)
21. [MCP Server Integration](#21-mcp-server-integration)
22. [Admin Panel](#22-admin-panel)
23. [Search](#23-search)
24. [Activity Logging](#24-activity-logging)
25. [RBAC & Permissions](#25-rbac--permissions)
26. [Calendar View](#26-calendar-view)
27. [API Reference](#27-api-reference)
28. [Database Schema](#28-database-schema)
29. [Timebox Presets & Overlap Prevention](#29-timebox-presets--overlap-prevention)
30. [Task Status Workflow (Updated)](#30-task-status-workflow-updated)
31. [Velocity Report & Scoring](#31-velocity-report--scoring)

---

## 1. Authentication & User Management

### Overview
Token-based authentication using Laravel Sanctum. All API requests require a Bearer token in the `Authorization` header.

### Features
- **Register** — Create account with name, email, password, and timezone
- **Login** — Returns Bearer token + user object; token stored in `localStorage`
- **Logout** — Revokes current token server-side
- **Profile Management** — Update name, email, timezone, locale, password
- **Avatar Upload** — Multipart file upload, stored on configured disk (S3/local)
- **Auto-Logout** — 401 responses auto-clear token and redirect to login (except on auth endpoints)

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/register` | Register new user |
| POST | `/api/v1/login` | Login, returns token |
| POST | `/api/v1/logout` | Revoke token |
| GET | `/api/v1/me` | Get current user + roles |
| PATCH | `/api/v1/me` | Update profile |
| POST | `/api/v1/me/avatar` | Upload avatar |

### Frontend
- Login page (`#/login`) with email + password form
- Register page (`#/register`) with timezone selector
- Profile page (`#/profile`) with settings, password change, avatar upload

---

## 2. Dashboard

### Overview
Centralized overview of the user's work state. Cached for 60 seconds per user with active timer always live.

### Features
- **Stat Cards** — Active tasks count, Overdue count, Done this week, Hours tracked this week
- **My Tasks** — Top 8 assigned tasks with quick access
- **Overdue Warning** — Highlighted section for past-due tasks
- **Active Timer Widget** — Live clock (HH:MM:SS) with stop button, synced across views
- **Project Progress** — Cards per project showing visual progress bars (% of completed tasks)
- **Weekly Stats Chart** — Bar chart displaying hours tracked + tasks completed per day for the current week

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard` | Aggregated stats (60s cache) |

### Frontend Route
`#/dashboard`

---

## 3. Project Management

### Overview
Projects are the top-level organizational unit. Each project has members, tasks, milestones, and its own Kanban board.

### Features

#### Project CRUD
- **Create Project** — Name, description, color, status, visibility, AI enablement flag
- **Update Project** — Edit all fields; changes logged in activity log
- **Delete Project** — Soft delete (recoverable)
- **Project Statuses** — `active`, `archived`, `completed`, `on_hold`
- **Visibility Levels** — `private` (members only), `team` (all org users), `public`

#### Project List View with Progress
- **Grid View** — Project cards with color bar, progress percentage, status badge, member avatars
- **List View** — Tabular view with columns: Name, Status, Progress Bar, Members, Due Date, Actions
- Progress is calculated as `(completed root tasks / total root tasks) * 100`
- Filter by status, search by name
- Click to enter project detail

#### Assign Project to Team or Individual
- **Add Member** — `POST /api/v1/projects/{id}/members` with `user_id` and `role`
- **Remove Member** — `DELETE /api/v1/projects/{id}/members/{user}` (cannot remove owner)
- **Roles per Project** — `owner`, `admin`, `manager`, `member`, `guest`
- Owner is auto-assigned on project creation
- Members can be individuals or added in bulk (team assignment)

#### Project Stats
- Task count by status (backlog, todo, in_progress, working_on, review, completed)
- Member contribution stats (tasks assigned, tasks completed per member)
- Total time tracked across all tasks

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/projects` | List projects (paginated, filterable) |
| POST | `/api/v1/projects` | Create project |
| GET | `/api/v1/projects/{id}` | Get project details |
| PUT/PATCH | `/api/v1/projects/{id}` | Update project |
| DELETE | `/api/v1/projects/{id}` | Soft delete |
| GET | `/api/v1/projects/{id}/stats` | Project progress stats |
| POST | `/api/v1/projects/{id}/members` | Add member with role |
| DELETE | `/api/v1/projects/{id}/members/{user}` | Remove member |
| GET | `/api/v1/projects/{id}/tasks` | List project tasks |
| POST | `/api/v1/projects/{id}/tasks` | Create task in project |
| GET | `/api/v1/projects/{id}/kanban` | Get Kanban board |

### Frontend Routes
- `#/projects` — Project list (grid + list toggle)
- `#/projects/:id` — Project detail with tabs: Kanban, Tasks, Timeline, Milestones, Settings

---

## 4. Task Management

### Overview
Tasks are the core work unit. Each task belongs to a project and can have subtasks, assignments, dependencies, time logs, comments, attachments, and reviews.

### Task Fields
| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Task name (required) |
| `description` | text | Rich description |
| `status` | enum | `backlog`, `todo`, `in_progress`, `working_on`, `review`, `completed` |
| `priority` | enum | `low`, `medium`, `high`, `urgent` |
| `task_type` | enum | `feature`, `bug`, `improvement`, `story`, `spike`, `chore`, `task` |
| `parent_id` | FK | Parent task ID (for subtasks) |
| `due_date` | date | Deadline |
| `start_date` | date | Planned start |
| `timebox_start` | datetime | Timeboxing start |
| `timebox_end` | datetime | Timeboxing end |
| `position` | integer | Order within Kanban column |
| `estimated_minutes` | integer | Time estimate |
| `total_time_spent` | integer | Accumulated tracked time (minutes) |
| `is_archived` | boolean | Archive flag |
| `is_reviewed` | boolean | Review completion flag |
| `score` | integer | Story points / priority score |
| `completed_at` | timestamp | When marked completed |
| `custom_fields` | JSON | Extensible metadata |

### Features

#### Create Task (Standard Header)
- When creating a task, **status defaults to `in_progress`** and the timer automatically starts
- Required fields: `title`, `task_type`
- The `task_type` is **required for all tasks including subtasks**
- Supports assignees, tags, watchers, reviewers on creation
- Position is auto-calculated (appended to end of column)

#### Task Detail View
- Full description with all metadata
- Assignees, watchers, reviewers list
- Comments section with threading
- Attachments list with upload
- Activity log (who changed what, when)
- Dependencies (blocked by, blocking)
- Time logs and manual time entry
- Subtasks list

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/my-tasks` | Tasks assigned to current user |
| GET | `/api/v1/overdue` | Overdue tasks for current user |
| GET | `/api/v1/tasks/{id}` | Get task with full details |
| PUT/PATCH | `/api/v1/tasks/{id}` | Update task |
| DELETE | `/api/v1/tasks/{id}` | Soft delete |
| POST | `/api/v1/tasks/{id}/move` | Move task (Kanban drag-drop) |
| GET | `/api/v1/tasks/{id}/activity` | Activity log |

### Frontend Routes
- `#/tasks` — My Tasks list
- `#/tasks/:id` — Task detail page

---

## 5. Kanban Board & Drag-and-Drop

### Overview
Visual board with 6 columns representing task statuses. Powered by SortableJS for drag-and-drop.

### Columns (Left to Right)
1. **Backlog** — Tasks not yet planned (replaces "Not Started")
2. **To Do** — Planned but not started
3. **In Progress** — Actively being worked on
4. **Working On** — Currently focused (auto-starts timer)
5. **Review** — Awaiting review
6. **Completed** — Done

### Drag-and-Drop Features
- **Task Cards** — Drag between columns to change status
- **Reorder within Column** — Drag to reposition; position saved to server
- **Optimistic UI** — Card moves instantly; rolls back on API error
- **Cross-column Move** — Fires `TaskStatusChanged` event and notifications
- **Auto-Timer** — Moving to "Working On" auto-starts timer; moving away auto-stops
- **Project Drag-and-Drop** — Reorder projects in list/grid view

### Kanban Card Content
- Task type icon (bug, feature, story, etc.)
- Title
- Tags (color-coded pills)
- Priority badge (low/medium/high/urgent with color)
- Subtask count indicator
- Score badge
- Due date (red if overdue)
- Assignee avatars
- Timer status indicator (running/paused)

### Top Bar
- Column count badges (tasks per status)
- Overdue task count
- Active timer count

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/projects/{id}/kanban` | Get board (tasks grouped by status) |
| POST | `/api/v1/projects/{id}/tasks/reorder` | Reorder tasks in column |
| POST | `/api/v1/tasks/{id}/move` | Move task to new column + position |

### Frontend Route
`#/projects/:id/kanban`

---

## 6. List View & Sorting

### Overview
Alternative to Kanban board. Tasks displayed in a sortable table with filters.

### Features
- **List View Toggle** — Switch between Kanban board and List view on any project
- **Sortable Columns** — Click column headers to sort by:
  - Title (A-Z, Z-A)
  - Status (workflow order)
  - Priority (urgent first / low first)
  - Due Date (nearest first / farthest first)
  - Assignee
  - Score (highest / lowest)
  - Created Date
  - Time Spent
- **Filters** — Status, Priority, Assignee, Task Type, Tags, Date Range
- **Search** — Full-text search within project tasks
- **Bulk Actions** — Select multiple tasks for status change, assignment, deletion
- **Inline Editing** — Quick-edit status and priority without opening task detail

### Frontend
- Available on both `#/projects/:id` (Tasks tab) and `#/tasks` (My Tasks)
- Toggle button: List | Kanban

---

## 7. Task Types & Subtasks

### Overview
Every task has a **required** `task_type` field. Subtasks inherit the project but require their own type.

### Task Types
| Type | Icon | Description |
|------|------|-------------|
| `feature` | Star | New functionality |
| `bug` | Bug | Defect / issue |
| `improvement` | Arrow Up | Enhancement to existing feature |
| `story` | Book | User story |
| `spike` | Lightning | Research / investigation |
| `chore` | Wrench | Maintenance / housekeeping |
| `task` | Check | General task |

### Subtasks
- Created by setting `parent_id` to the parent task's ID
- **`task_type` is required** for subtasks (not inherited from parent)
- Subtasks appear nested under the parent in list view
- Subtask count shown on parent's Kanban card
- Subtasks can have their own:
  - Assignees
  - Timer / time tracking
  - Status (independent of parent)
  - Priority
  - Dependencies
  - Comments and attachments

### API
- Create subtask: `POST /api/v1/projects/{id}/tasks` with `parent_id` and `task_type`
- Subtask tree: returned in task detail response via `children` relationship

---

## 8. Task Status Workflow

### Overview
6-stage workflow from Backlog to Completed. "Backlog" replaces the legacy "Not Started" status.

### Status Flow
```
Backlog → To Do → In Progress → Working On → Review/Testing → Done
                                                   ↕
                                                Blocked
```

### Status Definitions
| Status | Description | Auto-Actions |
|--------|-------------|--------------|
| `backlog` | Ideas, requests, future work. Not yet prioritized. | None |
| `todo` | Approved & ready to start. Part of current sprint/cycle. | None |
| `in_progress` | Actively being worked on. | **Default on task creation**; timer auto-starts |
| `working_on` | Currently focused / deep work mode. | **Auto-starts timer** |
| `review` | Work complete, needs code review / QA / validation. | Auto-stops timer |
| `blocked` | Cannot proceed — dependency, missing data, or external blocker. | None |
| `completed` | Fully finished and approved. | Sets `completed_at` timestamp |

### Behavior
- **Create Task** — Defaults to `in_progress` with timer auto-started
- **Move to Working On** — Timer auto-starts (see Section 12)
- **Move away from Working On** — Timer auto-stops
- **Move to Completed** — Sets `completed_at`, stops any running timer

---

## 9. Review Workflow

### Overview
Tasks can be assigned reviewers who approve or reject work before completion.

### Features
- **Add Reviewers** — Assign one or more users as reviewers on a task
- **Review Status** per reviewer: `pending`, `approved`, `rejected`
- **Review Notes** — Reviewers can add notes when approving/rejecting
- **Mark as Reviewed** — `is_reviewed` boolean flag on the task
- **Reviewed Timestamp** — `reviewed_at` recorded per reviewer action

### Database (task_reviewers table)
| Column | Type | Description |
|--------|------|-------------|
| `task_id` | FK | The task being reviewed |
| `user_id` | FK | The reviewer |
| `review_status` | enum | `pending`, `approved`, `rejected` |
| `review_note` | text | Reviewer's feedback |
| `reviewed_at` | timestamp | When the review was submitted |

### Workflow
1. Task creator or assignee moves task to `review` status
2. Assigned reviewers are notified
3. Each reviewer can:
   - **Approve** — Sets `review_status = approved`, records `reviewed_at`
   - **Reject** — Sets `review_status = rejected`, adds `review_note` explaining why
4. When all reviewers approve → task's `is_reviewed` is set to `true`
5. Task can then be moved to `completed`

### Reporting Integration
- Reports show reviewed vs. unreviewed tasks
- **Reporters can edit tasks** — Users with report access can update task fields directly from the reports view to correct categorization, time entries, or status

---

## 10. Pomodoro Timer & Time Tracking

### Overview
Built-in Pomodoro timer with two modes: Standard and Deep Work. One active timer per user enforced at the service layer.

### Pomodoro Modes

#### Standard Mode (Default)
| Phase | Duration |
|-------|----------|
| **Work Session** | 50 minutes |
| **Short Break** | 10 minutes |
| **Long Break** (after 4 sessions) | 20 minutes |
| Repeat cycle | Continuous |

#### Deep Work Mode
| Phase | Duration |
|-------|----------|
| **Work Session** | 25 minutes |
| **Short Break** | 5 minutes |
| **Long Break** (after 4 sessions) | 15 minutes |
| Repeat cycle | Continuous |

#### Custom Mode
Users can configure custom durations via the Pomodoro Settings panel.

### Timer Features
- **Start** — Begin timer on a specific task
- **Pause** — Pause timer; accumulates `paused_duration`
- **Resume** — Resume from paused state
- **Stop** — End session; calculates total duration; updates `task.total_time_spent`
- **Manual Entry** — Log time retroactively without running a timer
- **One Timer Rule** — Only one active timer per user at a time. Starting a new timer while one is running throws a `DomainException`
- **Live Clock** — Displays HH:MM:SS in sidebar and dashboard, updating every second
- **Cross-View Sync** — Timer state visible across dashboard, task detail, Kanban cards

### Time Log Fields (task_time_logs table)
| Column | Type | Description |
|--------|------|-------------|
| `task_id` | FK | Associated task |
| `user_id` | FK | Who tracked the time |
| `start_time` | datetime | When timer started |
| `end_time` | datetime | When timer stopped |
| `paused_at` | datetime | When paused (null if running) |
| `paused_duration` | integer | Total seconds spent paused |
| `duration` | integer | Net working seconds |
| `status` | enum | `running`, `paused`, `stopped` |
| `notes` | text | Session notes |
| `is_manual` | boolean | True if manually entered |

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/timer/active` | Get active timer |
| POST | `/api/v1/tasks/{id}/timer/start` | Start timer |
| POST | `/api/v1/tasks/{id}/timer/pause` | Pause timer |
| POST | `/api/v1/tasks/{id}/timer/resume` | Resume timer |
| POST | `/api/v1/tasks/{id}/timer/stop` | Stop timer |
| POST | `/api/v1/tasks/{id}/timer/manual` | Manual time entry |
| GET | `/api/v1/tasks/{id}/timer/logs` | Get time logs |

---

## 11. Timeboxing

### Overview
Assign a specific time window to a task — define **when** you plan to work on it. This is separate from the timer (which tracks actual time spent).

### Features
- **Set Timebox** — Assign `timebox_start` and `timebox_end` to a task
- **Calendar Integration** — Timeboxed tasks appear as blocks on the Calendar view
- **Visual Indicator** — Tasks with active timeboxes show a clock icon on Kanban cards
- **Overdue Timebox** — If current time exceeds `timebox_end` and task is not completed, it is flagged
- **Timebox vs Timer** — Timebox = planned schedule; Timer = actual tracking

### Task Fields
| Field | Type | Description |
|-------|------|-------------|
| `timebox_start` | datetime | When the user plans to start working |
| `timebox_end` | datetime | When the user plans to finish working |

### Usage Example
1. User creates a task: "Write API documentation"
2. Sets timebox: Today 2:00 PM – 4:00 PM
3. Task appears on Calendar view as a 2-hour block
4. At 2:00 PM, user moves task to "Working On" (timer auto-starts)
5. At 3:45 PM, user finishes and moves to "Review"
6. Actual time tracked: 1h 45m vs. planned 2h timebox

---

## 12. Auto-Timer on "Working On"

### Overview
When a task is moved to the **"Working On"** status, the timer automatically starts. When moved away, it automatically stops.

### Behavior

#### Auto-Start (Moving TO "Working On")
1. User drags task card to "Working On" column (or updates status via API)
2. `TaskService::moveToColumn()` detects the new status is `working_on`
3. Calls `TaskService::autoStartTimer()`:
   - Checks if user has an active timer on **another** task
   - If yes: auto-stops that timer first
   - Creates new `TaskTimeLog` with `status = running`
4. UI updates: timer widget appears, Kanban card shows timer indicator

#### Auto-Stop (Moving AWAY from "Working On")
1. User drags task out of "Working On" column
2. `TaskService::moveToColumn()` detects the old status was `working_on`
3. Calls `TaskService::autoStopTimer()`:
   - Finds the active time log for this task + user
   - Calculates duration (subtracting paused time)
   - Updates `task.total_time_spent`
   - Sets time log `status = stopped`
4. UI updates: timer widget clears

### Code Flow
```
User drags card → API: POST /tasks/{id}/move
  → TaskService::moveToColumn()
    → if new_status == 'working_on': autoStartTimer()
    → if old_status == 'working_on': autoStopTimer()
    → Fire TaskStatusChanged event
    → Return updated task
```

---

## 13. Task Dependencies

### Overview
Tasks can depend on other tasks. Four dependency types supported with DFS-based circular dependency detection.

### Dependency Types
| Type | Meaning |
|------|---------|
| `finish_to_start` | Task B cannot start until Task A finishes (most common) |
| `start_to_start` | Task B cannot start until Task A starts |
| `finish_to_finish` | Task B cannot finish until Task A finishes |
| `start_to_finish` | Task B cannot finish until Task A starts |

### Features
- **Add Dependency** — Link two tasks with a dependency type
- **Remove Dependency** — Unlink tasks
- **Cycle Detection** — DFS algorithm prevents circular dependencies (A→B→C→A)
- **Self-Dependency Prevention** — Cannot depend on itself
- **Blocked Status** — `is_blocked()` helper checks if all blockers are resolved
- **Visual Indicators** — Blocked tasks show a lock icon on Kanban cards
- **Dependency View** — Task detail shows "Blocked By" and "Blocking" sections

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tasks/{id}/dependencies` | Get dependencies + is_blocked flag |
| POST | `/api/v1/tasks/{id}/dependencies` | Add dependency (validates cycles) |
| DELETE | `/api/v1/tasks/{id}/dependencies/{depId}` | Remove dependency |

### Cycle Detection Algorithm
```
DependencyService::wouldCreateCycle(taskId, dependsOnId)
  → Build adjacency list from all task_dependencies
  → DFS from dependsOnId looking for taskId
  → If found: throw DomainException("Circular dependency detected")
  → If not found: safe to add
```

---

## 14. Scoring Methodology

### Overview
Tasks have a `score` field (integer) used for prioritization, sprint planning, and gamification.

### Scoring System
- **Story Points** — Fibonacci scale: 1, 2, 3, 5, 8, 13, 21
- Represents effort/complexity, not time
- Higher score = more complex/effort-intensive

### How Scoring is Used
| Context | Usage |
|---------|-------|
| **Sprint Planning** | Sum scores to determine sprint capacity |
| **Kanban Cards** | Score badge displayed on each card |
| **Sorting** | List view can sort by score (highest/lowest first) |
| **Reports** | Velocity = total score points completed per sprint/week |
| **Backlog Prioritization** | High-score items may need breakdown into subtasks |
| **Team Metrics** | Points completed per member in productivity reports |

### Setting Score
- Set on task creation or update via the `score` field
- Subtasks can have their own scores
- Parent task score is independent (not auto-summed from subtasks)

---

## 15. Reporting & Analytics

### Overview
Three report types with date range filters and CSV export. **Reporters can edit tasks** directly from the reports view.

### Report Types

#### 1. User Productivity Report
- **Metrics**: Total hours tracked, tasks completed, average time per task
- **Daily Breakdown**: Table showing hours + tasks per day in date range
- **Filters**: Date range (from, to)
- **Export**: CSV download

#### 2. Project Progress Report
- **Task Stats**: Count by status (backlog, todo, in_progress, working_on, review, completed)
- **Member Stats**: Per member — tasks assigned, tasks completed, hours tracked
- **Progress Percentage**: Visual bar
- **Total Time**: Aggregate hours tracked across all project tasks

#### 3. Time Tracking Report
- **Time Logs**: Detailed list of all time entries
- **Filters**: Project, User, Date Range
- **Aggregates**: Total seconds, task count, user count
- **Export**: CSV download

### Editable Reports
- Reports are not read-only — users with appropriate permissions can **edit task fields directly from the reports view**
- Click on a task in any report to modify: status, priority, assignees, time entries, or any other field
- Changes are saved immediately and reflected in the report

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reports/user-productivity` | Productivity report |
| GET | `/api/v1/reports/project-progress/{projectId}` | Project stats |
| GET | `/api/v1/reports/time-tracking` | Time tracking logs |
| GET | `/api/v1/reports/export-csv` | Export as CSV |

### Frontend Route
`#/reports`

---

## 16. Comments & Collaboration

### Overview
Threaded comments on tasks with @mention support and notifications.

### Features
- **Create Comment** — Add a comment to any task
- **Threaded Replies** — Reply to a comment (sets `parent_id`)
- **@Mentions** — Type `@username` to mention a user; triggers notification
- **Edit Comment** — Modify comment text; `is_edited` flag set to true
- **Delete Comment** — Soft delete
- **Mention Parsing** — Regex extracts `@username` patterns and stores in `mentions` JSON array

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tasks/{id}/comments` | Get comments with threads |
| POST | `/api/v1/tasks/{id}/comments` | Create comment |
| PUT | `/api/v1/comments/{id}` | Update comment |
| DELETE | `/api/v1/comments/{id}` | Delete comment |

---

## 17. File Attachments

### Overview
Upload files to tasks. Stored on S3-compatible storage (DigitalOcean Spaces) with signed temporary URLs.

### Features
- **Upload** — Max 25MB per file; multipart form data
- **Download** — Signed 30-minute temporary URL
- **Delete** — Removes from storage and database
- **Metadata** — Original filename, MIME type, file size tracked
- **Whitelisted Types** — Server validates allowed MIME types

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/tasks/{id}/attachments` | Upload file |
| GET | `/api/v1/attachments/{id}/download` | Get signed URL |
| DELETE | `/api/v1/attachments/{id}` | Delete attachment |

---

## 18. Notifications

### Overview
Database-backed notifications using Laravel's notification system. Triggered by events.

### Notification Triggers
| Event | Who Gets Notified |
|-------|--------------------|
| `TaskAssigned` | The assigned user |
| `TaskStatusChanged` | Task watchers and assignees |
| `UserMentioned` | The mentioned user |
| Review requested | The reviewer |

### Features
- **List Notifications** — Paginated (20 per page)
- **Unread Count** — Badge in navigation bar
- **Mark as Read** — Individual or all at once
- **Real-time Badge** — Updated on each page navigation

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | List all notifications |
| GET | `/api/v1/notifications/unread` | Unread + count |
| POST | `/api/v1/notifications/{id}/read` | Mark one as read |
| POST | `/api/v1/notifications/read-all` | Mark all as read |

---

## 19. Goals & Milestones

### Overview
Personal goals for users and project-level milestones for tracking deliverables.

### Goals
- **Create Goal** — Name, description, target_value, unit (e.g., "Complete 10 tasks")
- **Track Progress** — Update `current_value`; progress bar shown
- **Auto-Complete** — When `current_value >= target_value`, goal is marked completed
- **Filter** — By status: active, paused, completed

### Milestones
- **Project-Scoped** — Each milestone belongs to a project
- **Fields**: title, description, due_date, status (open/completed)
- **Toggle Status** — Mark as complete/reopen
- **Overview Page** — All milestones across projects with stats: Total, Open, Completed, Overdue

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/goals` | List user goals |
| POST | `/api/v1/goals` | Create goal |
| PATCH | `/api/v1/goals/{id}` | Update goal |
| DELETE | `/api/v1/goals/{id}` | Delete goal |
| GET | `/api/v1/projects/{id}/milestones` | List milestones |
| POST | `/api/v1/projects/{id}/milestones` | Create milestone |
| PATCH | `/api/v1/projects/{id}/milestones/{id}` | Update milestone |
| DELETE | `/api/v1/projects/{id}/milestones/{id}` | Delete milestone |

### Frontend Routes
- `#/goals` — Personal goals page
- `#/milestones` — All milestones overview

---

## 20. AI Integration (Claude)

### Overview
AI-powered features using Claude API (Haiku model) for natural language task parsing and bulk task generation.

### Features

#### Natural Language Task Parsing
- **Input**: Free-text like "Fix login bug by Friday, high priority, 2 hours estimated"
- **Output**: Structured JSON:
  ```json
  {
    "title": "Fix login bug",
    "priority": "high",
    "due_date": "2026-03-27",
    "estimated_minutes": 120,
    "task_type": "bug"
  }
  ```
- **Usage**: Quick task creation from natural language

#### Generate Tasks from Project Description
- **Input**: Project description text
- **Output**: Array of structured tasks auto-created in the project
- **Usage**: Bootstrap a project with AI-suggested task breakdown

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/parse-task` | Parse natural language → task |
| POST | `/api/v1/projects/{id}/ai/generate-tasks` | Generate tasks from description |

### Configuration
- Requires `ANTHROPIC_API_KEY` in `.env`
- Project must have `ai_enabled = true`
- Uses Claude Haiku for fast, low-cost responses

---

## 21. MCP Server Integration

### Overview
Model Context Protocol (MCP) server that connects Vilva Taskspace with Claude Desktop/Claude Code, enabling AI-powered project management through natural conversation.

### MCP Server Capabilities

#### Tools (Actions Claude Can Take)
| Tool | Description |
|------|-------------|
| `create_task` | Create a new task in any project |
| `update_task` | Update task fields (status, priority, assignees) |
| `list_tasks` | Query tasks with filters |
| `get_task` | Get full task details |
| `move_task` | Move task to different status column |
| `start_timer` | Start time tracking on a task |
| `stop_timer` | Stop active timer |
| `list_projects` | List all projects with stats |
| `get_project_kanban` | Get Kanban board state |
| `add_dependency` | Add task dependency |
| `search` | Global search across tasks and projects |
| `get_reports` | Pull productivity/time reports |

#### Resources (Context Claude Can Read)
| Resource | Description |
|----------|-------------|
| `project://{id}` | Full project details + member list |
| `project://{id}/tasks` | All tasks in a project |
| `project://{id}/kanban` | Current Kanban board state |
| `task://{id}` | Full task with comments, logs, dependencies |
| `user://me` | Current user profile and active timer |
| `dashboard://` | Dashboard stats and overview |

#### Prompts (Pre-built Workflows)
| Prompt | Description |
|--------|-------------|
| `plan-sprint` | Analyze backlog and suggest sprint plan based on scores and capacity |
| `daily-standup` | Generate standup summary: yesterday, today, blockers |
| `task-breakdown` | Break a large task into scored subtasks |
| `project-status` | Generate project status report with risks |

### Setup
1. MCP server runs as a separate Node.js process
2. Connects to Vilva Taskspace API using a service account Bearer token
3. Registered in Claude Desktop's `claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "vilva-taskspace": {
         "command": "node",
         "args": ["path/to/mcp-server/index.js"],
         "env": {
           "VILVA_API_URL": "http://localhost:8000/api/v1",
           "VILVA_API_TOKEN": "your-bearer-token"
         }
       }
     }
   }
   ```

### Usage Examples
```
User: "Create a high-priority bug task in Project Alpha for the login redirect issue"
Claude: [calls create_task tool] → Task #142 created in Project Alpha

User: "What's blocking the API refactor?"
Claude: [calls get_task + dependencies] → Task #98 is blocked by #95 (DB migration) and #97 (Auth update)

User: "Start my timer on the dashboard redesign"
Claude: [calls start_timer] → Timer started on Task #112

User: "Give me a standup summary"
Claude: [calls daily-standup prompt] → Yesterday: completed 3 tasks. Today: 2 in progress. Blockers: waiting on API review.
```

---

## 22. Admin Panel

### Overview
Administrative interface for user and system management. Restricted to users with `admin` role.

### Features
- **User List** — View all users with role, status, last activity
- **Invite User** — Send invitation to join the workspace
- **Role Assignment** — Assign/change global roles (admin, member, guest)
- **Deactivate User** — Disable account without deleting
- **Team Settings** — Workspace-level configuration

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/users` | List all users |

### Frontend Route
`#/admin`

---

## 23. Search

### Overview
Global search across tasks and projects, plus user search for pickers/assignments.

### Features
- **Global Search** — Search tasks and projects by keyword
- **User Search** — Find users for assignment/mention pickers
- **Tag List** — Browse and create tags for task categorization

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/search` | Global search (tasks + projects) |
| GET | `/api/v1/users/search` | Search users |
| GET | `/api/v1/tags` | List tags |
| POST | `/api/v1/tags` | Create tag |

---

## 24. Activity Logging

### Overview
Polymorphic activity log tracking all changes across the system.

### Tracked Events
- Task created, updated, deleted
- Task status changed
- Task assigned / unassigned
- Project created, updated, deleted
- Member added / removed
- Comment added / edited / deleted
- Attachment uploaded / deleted
- Timer started / stopped
- Dependency added / removed

### Log Fields
| Field | Description |
|-------|-------------|
| `subject_type` | Model type (Task, Project, etc.) |
| `subject_id` | Model ID |
| `causer_type` | Who did it (User) |
| `causer_id` | User ID |
| `event` | Action name (created, updated, status_changed, etc.) |
| `properties` | JSON with old/new values |
| `created_at` | Timestamp |

### API
- Task activity: `GET /api/v1/tasks/{id}/activity` (50 entries, latest first)

---

## 25. RBAC & Permissions

### Overview
Two-level role system: global roles and project-level roles.

### Global Roles
| Role | Description |
|------|-------------|
| `admin` | Full system access, user management |
| `member` | Standard user, can create/join projects |
| `guest` | Read-only access to assigned projects |

### Project Roles
| Role | Permissions |
|------|------------|
| `owner` | Full project control, cannot be removed |
| `admin` | Manage members, settings, all tasks |
| `manager` | Manage tasks, assign members |
| `member` | Create/edit own tasks, comment |
| `guest` | View only |

### Authorization
- **Policy-based** — `ProjectPolicy` checks: viewAny, view, create, update, delete, manageMember
- **Gate checks** — Middleware verifies permissions before controller actions
- **Sanctum middleware** — All API routes require `auth:sanctum`

---

## 26. Calendar View

### Overview
Month-view calendar showing tasks by their due dates.

### Features
- **Monthly Grid** — Standard calendar layout
- **Task Chips** — Tasks appear on their due date, color-coded by priority
- **Current Day Highlight** — Today's date is highlighted
- **Navigation** — Previous/Next month arrows
- **Summary Bar** — Total tasks, completed count, overdue count for the visible month
- **Timeboxed Tasks** — Tasks with timeboxes appear as time blocks

### Frontend Route
`#/calendar`

---

## 27. API Reference

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication
All endpoints (except register/login) require:
```
Authorization: Bearer {token}
```

### Rate Limiting
60 requests per minute per IP

### Response Format
```json
{
  "data": { ... },
  "message": "Success",
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 42
  }
}
```

### Error Format
```json
{
  "message": "Validation failed",
  "errors": {
    "title": ["The title field is required."]
  }
}
```

### Complete Endpoint List (52 endpoints)

#### Auth (6)
```
POST   /register
POST   /login
POST   /logout
GET    /me
PATCH  /me
POST   /me/avatar
```

#### Dashboard (1)
```
GET    /dashboard
```

#### Projects (11)
```
GET    /projects
POST   /projects
GET    /projects/{id}
PUT    /projects/{id}
DELETE /projects/{id}
GET    /projects/{id}/stats
POST   /projects/{id}/members
DELETE /projects/{id}/members/{user}
GET    /projects/{id}/tasks
POST   /projects/{id}/tasks
GET    /projects/{id}/kanban
POST   /projects/{id}/tasks/reorder
```

#### Milestones (3)
```
GET    /projects/{id}/milestones
POST   /projects/{id}/milestones
PATCH  /projects/{id}/milestones/{milestone}
DELETE /projects/{id}/milestones/{milestone}
```

#### Tasks (7)
```
GET    /my-tasks
GET    /overdue
GET    /tasks/{id}
PUT    /tasks/{id}
DELETE /tasks/{id}
POST   /tasks/{id}/move
GET    /tasks/{id}/activity
```

#### Timer (7)
```
GET    /timer/active
POST   /tasks/{id}/timer/start
POST   /tasks/{id}/timer/pause
POST   /tasks/{id}/timer/resume
POST   /tasks/{id}/timer/stop
POST   /tasks/{id}/timer/manual
GET    /tasks/{id}/timer/logs
```

#### Comments (4)
```
GET    /tasks/{id}/comments
POST   /tasks/{id}/comments
PUT    /comments/{id}
DELETE /comments/{id}
```

#### Attachments (3)
```
POST   /tasks/{id}/attachments
GET    /attachments/{id}/download
DELETE /attachments/{id}
```

#### Dependencies (3)
```
GET    /tasks/{id}/dependencies
POST   /tasks/{id}/dependencies
DELETE /tasks/{id}/dependencies/{depId}
```

#### Notifications (4)
```
GET    /notifications
GET    /notifications/unread
POST   /notifications/{id}/read
POST   /notifications/read-all
```

#### Reports (5)
```
GET    /reports/user-productivity
GET    /reports/project-progress/{projectId}
GET    /reports/time-tracking
GET    /reports/velocity
GET    /reports/export-csv
```

#### Goals (4)
```
GET    /goals
POST   /goals
PATCH  /goals/{id}
DELETE /goals/{id}
```

#### Admin & Search (4)
```
GET    /admin/users
GET    /users/search
GET    /search
GET    /tags
POST   /tags
```

#### Timebox (6)
```
GET    /timebox/presets
POST   /timebox/presets
PATCH  /timebox/presets/{id}
DELETE /timebox/presets/{id}
POST   /timebox/validate
GET    /timebox/schedule
```

#### AI (2)
```
POST   /ai/parse-task
POST   /projects/{id}/ai/generate-tasks
```

---

## 28. Database Schema

### Tables (22 total)

```sql
-- Core
users, roles, permissions, role_permissions, user_roles

-- Projects
projects, project_members

-- Tasks
tasks, task_assignments, task_watchers, task_reviewers
task_dependencies, task_time_logs

-- Collaboration
task_comments, task_attachments
tags, task_tags

-- Tracking
activity_logs, notifications
goals, milestones

-- Scheduling
timebox_presets

-- Auth
personal_access_tokens
```

### Key Indexes
- `tasks`: composite index on `(project_id, status, position)` for Kanban queries
- `task_time_logs`: index on `(user_id, status)` for active timer lookup
- `activity_logs`: index on `(subject_type, subject_id)` for history queries
- `notifications`: index on `(notifiable_id, read_at)` for unread count

### Relationships
```
User ──┬── hasMany ── Projects (as owner)
       ├── belongsToMany ── Projects (as member via project_members)
       ├── hasMany ── TaskTimeLogs
       ├── hasMany ── Goals
       └── hasMany ── Notifications

Project ──┬── hasMany ── Tasks
          ├── hasMany ── Milestones
          ├── belongsToMany ── Users (via project_members)
          └── hasMany ── Tags

Task ──┬── belongsTo ── Project
       ├── belongsTo ── Task (parent, for subtasks)
       ├── hasMany ── Tasks (children/subtasks)
       ├── belongsToMany ── Users (assignees via task_assignments)
       ├── belongsToMany ── Users (watchers via task_watchers)
       ├── belongsToMany ── Users (reviewers via task_reviewers)
       ├── hasMany ── TaskTimeLogs
       ├── hasMany ── TaskComments
       ├── hasMany ── TaskAttachments
       ├── belongsToMany ── Tasks (dependencies)
       └── belongsToMany ── Tags (via task_tags)
```

---

## Deployment

### Docker Compose Stack
| Service | Image | Port |
|---------|-------|------|
| nginx | nginx:1.25 | 80, 443 |
| app | PHP 8.3-FPM | Internal |
| mysql | MySQL 8.0 | 3306 |
| redis | Redis 7 | 6379 |
| horizon | PHP 8.3-FPM | Internal |
| scheduler | PHP 8.3-FPM | Internal |
| frontend | Node (Vite build) | Internal |

### Environment Variables
See `.env.example` for full list. Key variables:
- `DB_*` — MySQL connection
- `REDIS_*` — Redis connection
- `ANTHROPIC_API_KEY` — Claude API key for AI features
- `AWS_*` — S3/DigitalOcean Spaces for file storage
- `APP_URL` — Application base URL

---

## 29. Timebox Presets & Overlap Prevention

### Overview
SaaS-grade timeboxing that prevents task time overlaps and provides default blocked time slots for breaks.

### Default Presets (Auto-Created Per User)
| Preset | Time | Days | Type |
|--------|------|------|------|
| **Lunch Break** | 1:00 PM – 1:30 PM | Mon–Fri | break |
| **Screen Off Time** | 3:45 PM – 4:00 PM | Mon–Fri | break |

### Features
- **Custom Presets** — Create personal blocked time slots (lunch, meetings, screen-off)
- **Days of Week** — Presets apply only on selected days (Mon–Fri by default)
- **Overlap Detection** — When setting a timebox on a task, the system checks for:
  1. **Task Conflicts** — Other tasks assigned to you with overlapping timeboxes
  2. **Preset Conflicts** — Blocked time slots (lunch, screen-off) that overlap
- **Real-time Validation** — Conflict warnings shown in the task create/edit modal
- **Calendar Integration** — Timeboxed tasks + presets visible as blocks on the Calendar view
- **Daily Schedule API** — `GET /timebox/schedule?date=YYYY-MM-DD` returns both tasks and presets

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/timebox/presets` | Get user's timebox presets (auto-creates defaults) |
| POST | `/api/v1/timebox/presets` | Create a timebox preset |
| PATCH | `/api/v1/timebox/presets/{id}` | Update preset |
| DELETE | `/api/v1/timebox/presets/{id}` | Delete preset |
| POST | `/api/v1/timebox/validate` | Validate timebox for overlaps |
| GET | `/api/v1/timebox/schedule` | Get daily schedule (tasks + presets) |

### Overlap Prevention Logic
```
User sets timebox: Task A from 2:00 PM – 3:00 PM

System checks:
  1. Any other tasks for this user between 2:00–3:00 PM? → Conflict
  2. Any preset blocks (lunch, screen-off) between 2:00–3:00 PM? → Conflict

If conflicts found:
  → Show warning with conflicting item names
  → User can still save (soft warning, not hard block)
```

---

## 30. Task Status Workflow (Updated)

### Standard SaaS Task Workflow
```
Backlog → To Do → In Progress → Working On → Review/Testing → Done
                                                ↕
                                             Blocked
```

### Status Definitions
| Status | Description | Auto-Actions |
|--------|-------------|--------------|
| `backlog` | Ideas, requests, future work. Not yet prioritized. | None |
| `todo` | Approved and ready to start. Part of current sprint. | None |
| `in_progress` | Task is actively being worked on. | **Default on create**; timer auto-starts |
| `working_on` | Currently focused / deep work mode. | **Auto-starts timer** |
| `review` | Work complete, needs code review / QA testing / validation. | Auto-stops timer |
| `blocked` | Cannot move forward (dependency, missing data, external). | None |
| `completed` | Fully finished and approved. | Sets `completed_at`, stops timer |

### Key Behaviors
- **Create Task** → defaults to `in_progress`, timer auto-starts
- **Move to Working On** → timer auto-starts, previous timer auto-stops
- **Move to Review/Testing** → timer auto-stops
- **Move to Blocked** → task flagged, visible in reports
- **Move to Done** → `completed_at` set, timer stopped

---

## 31. Velocity Report & Scoring

### Overview
Sprint velocity tracking using Fibonacci story points (1, 2, 3, 5, 8, 13, 21).

### Velocity Report
- **Weekly velocity**: Total score points completed per week
- **Member scoring**: Points completed per team member
- **Sprint capacity planning**: Use velocity to plan sprint scope

### API Endpoint
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reports/velocity` | Velocity report (project_id, from, to) |

### Response
```json
{
  "total_score": 89,
  "total_tasks": 14,
  "weekly": {
    "2026-03-16": { "tasks_completed": 5, "total_score": 34, "avg_score": 6.8 }
  },
  "member_stats": [
    { "name": "Alice", "tasks_done": 8, "total_score": 55 }
  ]
}
```

---

*Last updated: 2026-03-22*
