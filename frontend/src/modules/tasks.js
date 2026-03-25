import { getMyTasks, getProjectTasks, getTask, createTask, updateTask, deleteTask } from '@api/tasks.js';
import { openModal, closeModal } from '@components/modal.js';
import { showToast } from '@components/toast.js';
import { priorityBadge, statusPill, formatDate, isOverdue, relativeTime, avatarUrl } from '@utils/helpers.js';
import { api } from '@api/apiClient.js';
import { store } from '@store/store.js';

// ── My Tasks Page ──────────────────────────────────────────────────────────────
export async function renderMyTasks(container) {
  container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  // Load tasks + projects in parallel
  const [taskRes, projRes] = await Promise.all([
    getMyTasks(),
    api.get('/projects').catch(() => ({ data: [] })),
  ]);
  const tasks = taskRes.data || [];
  const projects = projRes.data || [];

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>My Tasks</h1>
        <p>${tasks.length} task${tasks.length !== 1 ? 's' : ''} assigned to you</p>
      </div>
    </div>
    <div class="my-tasks-filters">
      <input type="search" id="mt-search" class="form-input" placeholder="Search tasks…" style="width:220px"/>
      <select id="mt-status" class="form-input form-select" style="width:140px">
        <option value="">All Status</option>
        <option value="backlog">Backlog</option>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="working_on">Working On</option>
        <option value="review">Review / Testing</option>
        <option value="blocked">Blocked</option>
        <option value="completed">Done</option>
      </select>
      <select id="mt-priority" class="form-input form-select" style="width:140px">
        <option value="">All Priority</option>
        <option value="urgent">🔴 Urgent</option>
        <option value="high">🟠 High</option>
        <option value="medium">🔵 Medium</option>
        <option value="low">⚪ Low</option>
      </select>
    </div>

    <!-- Asana-style inline add row -->
    <div class="mt-add-row" id="mt-add-row">
      <div class="mt-add-trigger" id="mt-add-trigger">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
        <span>Add task…</span>
      </div>
      <div class="mt-add-form hidden" id="mt-add-form">
        <div class="mt-add-form-row">
          <input type="text" id="mt-add-title" class="mt-add-input" placeholder="Task name" autofocus/>
          <select id="mt-add-project" class="mt-add-select" title="Project">
            ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
          <select id="mt-add-priority" class="mt-add-select" title="Priority">
            <option value="medium">🔵 Medium</option>
            <option value="low">⚪ Low</option>
            <option value="high">🟠 High</option>
            <option value="urgent">🔴 Urgent</option>
          </select>
          <select id="mt-add-status" class="mt-add-select" title="Status">
            <option value="todo">To Do</option>
            <option value="backlog">Backlog</option>
            <option value="in_progress">In Progress</option>
          </select>
          <input type="date" id="mt-add-due" class="mt-add-select" title="Due date"/>
          <select id="mt-add-type" class="mt-add-select" title="Type">
            <option value="task">📋 Task</option>
            <option value="feature">✨ Feature</option>
            <option value="bug">🐛 Bug</option>
            <option value="improvement">🔧 Improvement</option>
          </select>
          <button class="btn btn-primary btn-sm" id="mt-add-submit" style="white-space:nowrap">Add</button>
          <button class="btn btn-ghost btn-sm" id="mt-add-cancel" style="padding:6px">✕</button>
        </div>
      </div>
    </div>

    <div class="my-tasks-list" id="mt-list">
      ${tasks.length === 0
        ? `<div class="full-empty"><div class="full-empty-icon">🎯</div><h3>No tasks assigned to you</h3><p>Click "+ Add task" above to create one</p></div>`
        : tasks.map(t => taskListItem(t)).join('')}
    </div>`;

  // ── Inline add logic ───────────────────────────────────────────────────
  const trigger = document.getElementById('mt-add-trigger');
  const form    = document.getElementById('mt-add-form');
  const titleIn = document.getElementById('mt-add-title');

  trigger.addEventListener('click', () => {
    trigger.classList.add('hidden');
    form.classList.remove('hidden');
    titleIn.focus();
  });

  document.getElementById('mt-add-cancel').addEventListener('click', () => {
    form.classList.add('hidden');
    trigger.classList.remove('hidden');
    titleIn.value = '';
  });

  // Submit on Enter in title field
  titleIn.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('mt-add-submit').click(); }
    if (e.key === 'Escape') { document.getElementById('mt-add-cancel').click(); }
  });

  document.getElementById('mt-add-submit').addEventListener('click', async () => {
    const title = titleIn.value.trim();
    if (!title) { titleIn.focus(); return; }

    const projectId = document.getElementById('mt-add-project').value;
    if (!projectId) { showToast('Select a project', 'error'); return; }

    const btn = document.getElementById('mt-add-submit');
    btn.disabled = true; btn.textContent = '…';

    try {
      const userId = store.get('user')?.id;
      await createTask(projectId, {
        title,
        priority:  document.getElementById('mt-add-priority').value,
        status:    document.getElementById('mt-add-status').value,
        task_type: document.getElementById('mt-add-type').value,
        due_date:  document.getElementById('mt-add-due').value || null,
        assignees: userId ? [userId] : [],
      });
      showToast('Task added', 'success');
      titleIn.value = '';
      titleIn.focus();
      // Reload
      renderMyTasks(container);
    } catch (err) {
      showToast(err?.message || 'Failed to add task', 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Add';
    }
  });

  // ── Filter logic ───────────────────────────────────────────────────────
  let filtered = [...tasks];
  const rerender = () => {
    const q = document.getElementById('mt-search').value.toLowerCase();
    const s = document.getElementById('mt-status').value;
    const p = document.getElementById('mt-priority').value;
    filtered = tasks.filter(t =>
      (!q || t.title.toLowerCase().includes(q)) &&
      (!s || t.status === s) &&
      (!p || t.priority === p)
    );
    document.getElementById('mt-list').innerHTML = filtered.length === 0
      ? `<div class="my-tasks-empty">No tasks match your filters</div>`
      : filtered.map(t => taskListItem(t)).join('');
    bindListItems();
  };
  ['mt-search','mt-status','mt-priority'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', rerender);
    document.getElementById(id)?.addEventListener('change', rerender);
  });
  bindListItems();

  function bindListItems() {
    container.querySelectorAll('.task-list-item').forEach(el => {
      el.addEventListener('click', () => {
        import('../js/router.js').then(m => m.router.navigate(`/tasks/${el.dataset.taskId}`));
      });
    });
  }
}

function taskListItem(t) {
  const od = isOverdue(t.due_date, t.status);
  const isWorking = t.status === 'working_on';
  return `
    <div class="task-list-item ${isWorking ? 'working' : ''}" data-task-id="${t.id}">
      <div class="task-list-item-left">
        ${priorityBadge(t.priority)}
        <span class="task-list-item-title">${t.title}</span>
        ${t.project ? `<span class="task-list-item-project" style="background:${t.project.color}15;color:${t.project.color}">${t.project.name}</span>` : ''}
      </div>
      <div class="task-list-item-right">
        ${isWorking ? `<span class="task-timer-auto-badge">⏱ Timer On</span>` : ''}
        ${statusPill(t.status)}
        ${t.due_date ? `<span class="task-due ${od ? 'overdue' : ''}">📅 ${formatDate(t.due_date)}</span>` : ''}
        <div style="display:flex">
          ${(t.assignees || []).slice(0,3).map(a => `<img src="${avatarUrl(a)}" class="av-xs" title="${a.name}" style="margin-left:-5px;border:1.5px solid #fff;object-fit:cover"/>`).join('')}
        </div>
      </div>
    </div>`;
}

// ── Task List (inside project) ─────────────────────────────────────────────────
export async function renderTaskList(container, projectId) {
  container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;
  const res = await getProjectTasks(projectId);
  const tasks = res.data || [];

  container.innerHTML = `
    <div class="task-table-wrap">
      <div class="task-table-toolbar">
        <div class="task-table-toolbar-left">
          <input type="search" id="tbl-search" class="form-input" placeholder="Search…" style="width:190px"/>
          <select id="tbl-status" class="form-input form-select" style="width:130px">
            <option value="">All Status</option>
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="working_on">Working On</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
          <select id="tbl-priority" class="form-input form-select" style="width:130px">
            <option value="">All Priority</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="medium">🔵 Medium</option>
            <option value="low">⚪ Low</option>
          </select>
        </div>
        <button class="btn btn-primary btn-sm" id="add-task-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
          Add Task
        </button>
      </div>
      <table class="tasks">
        <thead>
          <tr>
            <th style="width:32%" class="sortable-th" data-sort="title">Title ↕</th>
            <th class="sortable-th" data-sort="task_type">Type ↕</th>
            <th class="sortable-th" data-sort="priority">Priority ↕</th>
            <th class="sortable-th" data-sort="status">Status ↕</th>
            <th>Assignees</th>
            <th class="sortable-th" data-sort="score">Score ↕</th>
            <th class="sortable-th" data-sort="due_date">Due Date ↕</th>
            <th style="width:44px"></th>
          </tr>
        </thead>
        <tbody id="tasks-tbody">
          ${tasks.length === 0
            ? `<tr><td colspan="8" class="table-empty">No tasks yet — add your first task above</td></tr>`
            : tasks.map(t => taskTableRow(t)).join('')}
        </tbody>
      </table>
      <!-- Asana-style compact inline add -->
      <div class="inline-task-add" id="inline-add-row">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
        <input type="text" id="inline-task-title" placeholder="Add a task… (press Enter)" autocomplete="off"/>
        <select id="inline-task-type" title="Type">
          <option value="task">📋 Task</option>
          <option value="feature">✨ Feature</option>
          <option value="bug">🐛 Bug</option>
          <option value="improvement">🔧 Improvement</option>
          <option value="story">📖 Story</option>
          <option value="spike">🔬 Spike</option>
          <option value="chore">🧹 Chore</option>
        </select>
        <select id="inline-task-priority" title="Priority">
          <option value="medium">🔵</option>
          <option value="low">🟢</option>
          <option value="high">🟠</option>
          <option value="urgent">🔴</option>
        </select>
      </div>
    </div>`;

  // Inline add — compact Asana-style
  const inlineInput = document.getElementById('inline-task-title');
  inlineInput?.addEventListener('keydown', async e => {
    if (e.key !== 'Enter') return;
    const title = inlineInput.value.trim();
    if (!title) return;
    const taskType = document.getElementById('inline-task-type').value;
    const priority = document.getElementById('inline-task-priority').value;
    inlineInput.disabled = true;
    try {
      await createTask(projectId, { title, task_type: taskType, priority });
      inlineInput.value = '';
      showToast('Task added', 'success', 1500);
      renderTaskList(container, projectId);
    } catch {
      showToast('Failed to add task', 'error');
    }
    inlineInput.disabled = false;
    inlineInput.focus();
  });

  // Full form modal (via button)
  document.getElementById('add-task-btn')?.addEventListener('click', () => openNewTaskModal(container, projectId));

  const rerender = () => {
    const q = document.getElementById('tbl-search').value.toLowerCase();
    const s = document.getElementById('tbl-status').value;
    const p = document.getElementById('tbl-priority').value;
    const filtered = tasks.filter(t =>
      (!q || t.title.toLowerCase().includes(q)) &&
      (!s || t.status === s) &&
      (!p || t.priority === p)
    );
    document.getElementById('tasks-tbody').innerHTML = filtered.length === 0
      ? `<tr><td colspan="8" class="table-empty">No matching tasks</td></tr>`
      : filtered.map(t => taskTableRow(t)).join('');
    bindTableRows();
  };
  ['tbl-search','tbl-status','tbl-priority'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', rerender);
    document.getElementById(id)?.addEventListener('change', rerender);
  });
  bindTableRows();

  function bindTableRows() {
    container.querySelectorAll('tr[data-task-id]').forEach(row => {
      row.addEventListener('click', e => {
        if (e.target.closest('[data-delete-task]')) return;
        // Shift+click opens side panel, normal click opens full detail
        if (e.shiftKey) {
          import('@components/sidePanel.js').then(m => m.openSidePanel(row.dataset.taskId));
        } else {
          import('../js/router.js').then(m => m.router.navigate(`/tasks/${row.dataset.taskId}`));
        }
      });
    });
    container.querySelectorAll('[data-delete-task]').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        if (!confirm('Delete this task?')) return;
        await deleteTask(btn.dataset.deleteTask);
        showToast('Task deleted', 'success');
        renderTaskList(container, projectId);
      });
    });
  }
}

const TASK_TYPE_ICONS = { feature:'✨', bug:'🐛', improvement:'🔧', story:'📖', spike:'🔬', chore:'🧹', task:'📋' };

function taskTableRow(t) {
  const od = isOverdue(t.due_date, t.status);
  const typeIcon = TASK_TYPE_ICONS[t.task_type] || TASK_TYPE_ICONS.task;
  return `
    <tr data-task-id="${t.id}">
      <td>
        <div class="td-title">
          <span class="task-title-text">${t.title}</span>
          ${t.subtasks_count > 0 ? `<span style="font-size:11px;color:#94a3b8;margin-left:6px">⊞ ${t.subtasks_count}</span>` : ''}
          ${t.is_reviewed ? `<span class="reviewed-badge">✓</span>` : ''}
        </div>
      </td>
      <td><span class="task-type-icon" title="${t.task_type || 'task'}">${typeIcon}</span> <span style="font-size:12px;color:#64748b">${t.task_type||'task'}</span></td>
      <td>${priorityBadge(t.priority)}</td>
      <td>${statusPill(t.status)}</td>
      <td>
        <div class="td-assignees">
          ${(t.assignees || []).slice(0,3).map(a => `<img src="${avatarUrl(a)}" class="av-xs" title="${a.name}" style="border:1.5px solid #fff;object-fit:cover"/>`).join('')}
        </div>
      </td>
      <td style="font-size:12px;font-weight:700;color:#6366f1;text-align:center">${t.score ? t.score+'pts' : '—'}</td>
      <td style="font-size:12.5px;color:${od?'#dc2626':'#64748b'};font-weight:${od?700:400};white-space:nowrap">
        ${t.due_date ? `📅 ${formatDate(t.due_date)}` : '—'}
      </td>
      <td class="td-actions">
        <button class="btn-icon" data-delete-task="${t.id}" title="Delete" style="color:#dc2626">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
        </button>
      </td>
    </tr>`;
}

// ── Task Detail ────────────────────────────────────────────────────────────────
export async function renderTaskDetail(taskId) {
  return async (container) => {
    container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;
    let task;
    try {
      task = await getTask(taskId);
    } catch (err) {
      console.error('Failed to load task:', err);
      container.innerHTML = `<div class="full-empty"><div class="full-empty-icon">⚠️</div><h3>Failed to load task</h3><p>${err.message || ''}</p></div>`;
      return;
    }
    if (!task || !task.id) {
      container.innerHTML = `<div class="full-empty"><div class="full-empty-icon">⚠️</div><h3>Task not found</h3></div>`;
      return;
    }

    container.innerHTML = `
      <div class="task-detail">
        <div class="task-detail-main">

          <!-- Header -->
          <div class="task-header-card">
            <div class="task-breadcrumb">
              <a href="#" data-nav="projects">Projects</a>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
              <a href="#" data-nav="project-${task.project_id}">${task.project?.name || 'Project'}</a>
            </div>
            <div class="task-title-editable" id="task-title-edit" contenteditable="true">${task.title}</div>
            <div class="task-pills">
              <span class="task-type-pill">${(TASK_TYPE_ICONS[task.task_type]||'📋')} ${(task.task_type||'task').replace('_',' ')}</span>
              ${priorityBadge(task.priority)}
              ${statusPill(task.status)}
              ${task.is_blocked ? `<span style="background:#fef3c7;color:#d97706;font-size:11.5px;font-weight:700;padding:3px 9px;border-radius:100px">🔒 Blocked</span>` : ''}
              ${task.due_date ? `<span class="task-due ${isOverdue(task.due_date, task.status) ? 'overdue' : ''}" style="font-size:12.5px;padding:3px 8px;background:#f1f5f9;border-radius:100px">📅 ${formatDate(task.due_date)}</span>` : ''}
              ${task.estimated_minutes ? `<span style="font-size:12.5px;padding:3px 8px;background:#f1f5f9;border-radius:100px">⏱ Est. ${task.estimated_minutes >= 60 ? Math.floor(task.estimated_minutes/60)+'h '+(task.estimated_minutes%60||'')+'m' : task.estimated_minutes+'m'}` : ''}
            </div>
          </div>

          <!-- Description -->
          <div class="section-card">
            <div class="section-head">
              <span class="section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M4 6h16M4 10h16M4 14h10"/></svg>
                Description
              </span>
            </div>
            <div class="desc-area" id="task-desc-edit" contenteditable="true" data-placeholder="Add a description…">${task.description || ''}</div>
          </div>

          <!-- Subtasks -->
          <div class="section-card">
            <div class="section-head">
              <span class="section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                Subtasks
                <span class="badge badge-slate" style="font-weight:700">${task.subtasks?.length || 0}</span>
              </span>
            </div>
            <div id="subtasks-list">
              ${(task.subtasks || []).map(st => `
                <div class="subtask-item">
                  <input type="checkbox" class="subtask-cb" data-subtask-id="${st.id}" ${st.status === 'completed' ? 'checked' : ''}/>
                  <span class="subtask-label ${st.status === 'completed' ? 'done' : ''}">${st.title}</span>
                </div>`).join('')}
            </div>
            <div class="subtask-add">
              <input type="text" id="subtask-input" class="form-input" placeholder="Add a subtask…" style="flex:1"/>
              <button class="btn btn-secondary btn-sm" id="add-subtask-btn">Add</button>
            </div>
          </div>

          <!-- Time Tracking -->
          <div class="section-card">
            <div class="section-head">
              <span class="section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline stroke-linecap="round" points="12 6 12 12 16 14"/></svg>
                Time Tracking
              </span>
            </div>
            <div class="timer-section-row">
              <div>
                <div class="timer-big" id="task-timer-display">
                  ${formatMinSec(task.total_time_spent || 0)}
                </div>
                <div style="font-size:12px;color:#94a3b8;margin-top:2px">Total tracked</div>
              </div>
              <div class="timer-controls">
                ${renderTimerControls(task)}
              </div>
            </div>
          </div>

          <!-- Comments -->
          <div class="section-card">
            <div class="section-head">
              <span class="section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                Comments
                <span class="badge badge-slate">${task.comments?.length || 0}</span>
              </span>
            </div>
            <div id="comments-list">
              ${(task.comments || []).map(c => commentHtml(c)).join('')}
            </div>
            <div class="comment-composer">
              <img src="${avatarUrl(null)}" class="av-sm" alt="You"/>
              <textarea id="comment-input" placeholder="Write a comment… use @name to mention someone" rows="1"></textarea>
              <button class="btn btn-primary btn-sm" id="post-comment-btn">Send</button>
            </div>
          </div>

        </div>

        <!-- Sidebar -->
        <aside class="task-detail-sidebar">

          <!-- Status / Priority / Type quick-edit -->
          <div class="ts-section">
            <span class="ts-label">Status</span>
            <select class="form-input form-select" id="ts-status" style="margin-bottom:12px">
              <option value="backlog" ${task.status==='backlog'?'selected':''}>Backlog</option>
              <option value="todo" ${task.status==='todo'?'selected':''}>To Do</option>
              <option value="in_progress" ${task.status==='in_progress'?'selected':''}>In Progress</option>
              <option value="working_on" ${task.status==='working_on'?'selected':''}>🔥 Working On</option>
              <option value="review" ${task.status==='review'?'selected':''}>Review / Testing</option>
              <option value="blocked" ${task.status==='blocked'?'selected':''}>🚫 Blocked</option>
              <option value="completed" ${task.status==='completed'?'selected':''}>Done</option>
            </select>
            <span class="ts-label">Priority</span>
            <select class="form-input form-select" id="ts-priority" style="margin-bottom:12px">
              <option value="low" ${task.priority==='low'?'selected':''}>🟢 Low</option>
              <option value="medium" ${task.priority==='medium'?'selected':''}>🔵 Medium</option>
              <option value="high" ${task.priority==='high'?'selected':''}>🟠 High</option>
              <option value="urgent" ${task.priority==='urgent'?'selected':''}>🔴 Urgent</option>
            </select>
            <span class="ts-label">Task Type</span>
            <select class="form-input form-select" id="ts-task-type" style="margin-bottom:12px">
              <option value="task" ${task.task_type==='task'?'selected':''}>📋 Task</option>
              <option value="feature" ${task.task_type==='feature'?'selected':''}>✨ Feature</option>
              <option value="bug" ${task.task_type==='bug'?'selected':''}>🐛 Bug</option>
              <option value="improvement" ${task.task_type==='improvement'?'selected':''}>🔧 Improvement</option>
              <option value="story" ${task.task_type==='story'?'selected':''}>📖 Story</option>
              <option value="spike" ${task.task_type==='spike'?'selected':''}>🔬 Spike</option>
              <option value="chore" ${task.task_type==='chore'?'selected':''}>🧹 Chore</option>
            </select>
          </div>

          <!-- Reviewed + Score -->
          <div class="ts-section">
            <div class="ts-reviewed-row">
              <span class="ts-label" style="margin-bottom:0">Reviewed</span>
              <label class="toggle-switch">
                <input type="checkbox" id="ts-reviewed" ${task.is_reviewed ? 'checked' : ''}/>
                <span class="toggle-track"><span class="toggle-thumb"></span></span>
              </label>
            </div>
            <span class="ts-label" style="margin-top:12px">Score</span>
            <div style="display:flex;align-items:center;gap:8px">
              <input type="range" id="ts-score" min="0" max="100" value="${task.score || 0}" class="score-slider"/>
              <span id="ts-score-val" class="score-val">${task.score || 0}</span>
            </div>
          </div>

          <!-- Timebox -->
          <div class="ts-section">
            <span class="ts-label">Timebox</span>
            <div style="display:flex;flex-direction:column;gap:6px">
              <input type="datetime-local" id="ts-timebox-start" class="form-input" value="${task.timebox_start ? task.timebox_start.slice(0,16) : ''}" placeholder="Start"/>
              <input type="datetime-local" id="ts-timebox-end" class="form-input" value="${task.timebox_end ? task.timebox_end.slice(0,16) : ''}" placeholder="End"/>
            </div>
          </div>

          <!-- Assignees -->
          <div class="ts-section">
            <span class="ts-label">Assignees</span>
            <div class="ts-assignees">
              ${(task.assignees || []).map(a => `
                <div class="ts-assignee-chip">
                  <img src="${avatarUrl(a)}" class="av-xs" alt="${a.name}" style="object-fit:cover"/>
                  <span>${a.name}</span>
                </div>`).join('')}
              ${task.assignees?.length === 0 ? `<span style="font-size:13px;color:#94a3b8">Unassigned</span>` : ''}
            </div>
          </div>

          <!-- Reviewers -->
          <div class="ts-section">
            <span class="ts-label">Reviewers</span>
            <div id="ts-reviewers-list">
              ${(task.reviewers || []).map(r => {
                const rvStatus = r.pivot?.review_status || 'pending';
                const rvNote   = r.pivot?.review_note || '';
                return `
                <div class="ts-reviewer-chip">
                  <img src="${avatarUrl(r)}" alt="${r.name}"/>
                  <span>${r.name}</span>
                  <span class="rv-status ${rvStatus}" title="${rvNote}">${rvStatus === 'approved' ? '✅ Approved' : rvStatus === 'rejected' ? '❌ Rejected' : '⏳ Pending'}</span>
                  <button class="rv-remove" data-reviewer-id="${r.id}" title="Remove reviewer">×</button>
                </div>`;
              }).join('')}
              ${(task.reviewers || []).length === 0 ? `<span style="font-size:13px;color:#94a3b8">No reviewers</span>` : ''}
            </div>
            <button class="btn btn-ghost btn-sm" id="add-reviewer-btn" style="width:100%;justify-content:center;margin-top:6px">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
              Add Reviewer
            </button>
            ${(() => { const u = typeof store !== 'undefined' ? store?.get?.('user') : null; const myRv = u && (task.reviewers || []).find(r => r.id === u.id); return myRv?.pivot?.review_status === 'pending' ? `
            <div class="rv-actions">
              <button class="btn btn-primary btn-sm" id="rv-approve-btn">✅ Approve</button>
              <button class="btn btn-ghost btn-sm" style="color:var(--red)" id="rv-reject-btn">❌ Reject</button>
            </div>` : ''; })()}
          </div>

          <!-- Dates -->
          <div class="ts-section">
            <span class="ts-label">Due Date</span>
            <input type="date" id="ts-due-date" class="form-input" value="${task.due_date || ''}" style="margin-bottom:12px"/>
            <span class="ts-label">Start Date</span>
            <input type="date" id="ts-start-date" class="form-input" value="${task.start_date || ''}"/>
          </div>

          <!-- Tags -->
          <div class="ts-section">
            <span class="ts-label">Tags</span>
            <div class="ts-tags">
              ${(task.tags || []).map(t => `<span class="tag-chip" style="background:${t.color}20;color:${t.color}">${t.name}</span>`).join('')}
              ${task.tags?.length === 0 ? `<span style="font-size:13px;color:#94a3b8">No tags</span>` : ''}
            </div>
          </div>

          <!-- Attachments -->
          <div class="ts-section">
            <span class="ts-label">Attachments</span>
            <div id="attach-list">
              ${renderAttachments(task.attachments || [])}
            </div>
            <label style="cursor:pointer;display:block;margin-top:8px">
              <input type="file" id="file-upload" class="hidden" multiple/>
              <span class="btn btn-ghost btn-sm" style="width:100%;justify-content:center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                Attach File
              </span>
            </label>
          </div>

          <!-- Dependencies -->
          <div class="ts-section">
            <span class="ts-label">Dependencies</span>
            <div id="dep-blocked-by">
              ${(task.blocked_by || []).length > 0 ? `
                <div style="font-size:11px;font-weight:700;color:#d97706;margin-bottom:4px">BLOCKED BY</div>
                ${task.blocked_by.map(d => `
                  <div class="ts-dep-chip ${d.status !== 'completed' ? 'blocked' : 'resolved'}">
                    <span>${d.status === 'completed' ? '✅' : '🔒'} ${d.title}</span>
                    <button class="dep-remove-btn" data-dep-task-id="${task.id}" data-dep-on-id="${d.id}" title="Remove">×</button>
                  </div>`).join('')}` : ''}
            </div>
            <div id="dep-blocking">
              ${(task.blocking || []).length > 0 ? `
                <div style="font-size:11px;font-weight:700;color:#6366f1;margin-bottom:4px;margin-top:8px">BLOCKING</div>
                ${task.blocking.map(d => `
                  <div class="ts-dep-chip blocking">
                    <span>➡ ${d.title}</span>
                  </div>`).join('')}` : ''}
            </div>
            <div style="margin-top:8px">
              <button class="btn btn-ghost btn-sm" id="add-dep-btn" style="width:100%;justify-content:center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
                Add Dependency
              </button>
            </div>
          </div>

        </aside>
      </div>
      <!-- Activity Log -->
      <div class="section-card activity-log-card" id="activity-log-section">
        <div class="section-head">
          <span class="section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Activity
          </span>
        </div>
        <div id="activity-list" class="activity-list">
          <div style="color:#94a3b8;font-size:13px">Loading activity…</div>
        </div>
      </div>`;

    bindTaskDetailEvents(container, task);
    loadActivityLog(task.id);
  };
}

async function loadActivityLog(taskId) {
  const el = document.getElementById('activity-list');
  if (!el) return;
  try {
    const { api } = await import('@api/apiClient.js');
    const res  = await api.get(`/tasks/${taskId}/activity`);
    const logs = res.data || [];
    if (!logs.length) {
      el.innerHTML = `<div style="color:#94a3b8;font-size:13px">No activity yet</div>`;
      return;
    }
    el.innerHTML = logs.map(log => `
      <div class="activity-item">
        <img src="${log.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(log.user?.name||'?')}&size=24&background=6366f1&color=fff`}" class="av-xs activity-av" alt="${log.user?.name||''}"/>
        <div class="activity-body">
          <span class="activity-user">${log.user?.name || 'System'}</span>
          <span class="activity-event">${formatActivityEvent(log)}</span>
          <span class="activity-time">${relativeTime(log.created_at)}</span>
        </div>
      </div>`).join('');
  } catch {
    el.innerHTML = `<div style="color:#94a3b8;font-size:13px">No activity recorded</div>`;
  }
}

function formatActivityEvent(log) {
  const p = log.properties || {};
  switch (log.event) {
    case 'created':   return 'created this task';
    case 'updated': {
      const changes = Object.keys(p.changes || p || {}).filter(k => k !== 'updated_at');
      return changes.length ? `updated ${changes.join(', ')}` : 'updated this task';
    }
    case 'status_changed': return `moved to <strong>${(p.to || '').replace('_',' ')}</strong>`;
    case 'assigned':       return `assigned to ${p.assignee || 'someone'}`;
    case 'commented':      return 'left a comment';
    case 'timer_started':  return 'started the timer';
    case 'timer_stopped':  return `stopped the timer (${p.duration || ''})`;
    default:               return log.event?.replace(/_/g, ' ') || 'did something';
  }
}

function renderTimerControls(task) {
  if (task.status === 'working_on') {
    return `<span class="timer-auto-badge">⏱ Timer running automatically</span>`;
  }
  if (task.active_timer?.status === 'active') {
    return `<span class="timer-auto-badge">⏱ Timer active</span>`;
  }
  return `<span style="font-size:12px;color:var(--muted)">Set status to "Working On" to start timer</span>`;
}

function commentHtml(c) {
  return `
    <div class="comment-item">
      <img src="${avatarUrl(c.user)}" class="av-sm" alt="${c.user?.name || ''}"/>
      <div class="comment-bubble-wrap">
        <div class="comment-bubble">
          <span class="comment-author">${c.user?.name || 'User'}</span>
          <span class="comment-time">${relativeTime(c.created_at)}</span>
          <div class="comment-text">${c.body}</div>
        </div>
      </div>
    </div>`;
}

function renderAttachments(attachments) {
  if (!attachments.length) return `<div style="font-size:13px;color:#94a3b8">No attachments</div>`;
  const icons = { image:'🖼️', pdf:'📄', video:'🎬', default:'📎' };
  return attachments.map(a => {
    const ext = a.original_name?.split('.').pop()?.toLowerCase();
    const icon = ['jpg','jpeg','png','gif','webp'].includes(ext) ? icons.image : ext === 'pdf' ? icons.pdf : ['mp4','mov'].includes(ext) ? icons.video : icons.default;
    return `
      <div class="attach-item">
        <div class="attach-icon">${icon}</div>
        <div style="flex:1;min-width:0">
          <div class="attach-name">${a.original_name}</div>
          ${a.size ? `<div class="attach-size">${(a.size/1024).toFixed(1)} KB</div>` : ''}
        </div>
        <a href="#" class="btn btn-ghost btn-sm download-link" data-id="${a.id}" style="padding:4px 8px;font-size:11.5px">↓</a>
      </div>`;
  }).join('');
}

function formatMinSec(seconds) {
  if (!seconds) return '0:00:00';
  const h = String(Math.floor(seconds / 3600)).padStart(1, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function bindTaskDetailEvents(container, task) {
  // Status change
  document.getElementById('ts-status')?.addEventListener('change', async e => {
    await updateTask(task.id, { status: e.target.value });
    showToast('Status updated', 'success');
  });

  // Priority change
  document.getElementById('ts-priority')?.addEventListener('change', async e => {
    await updateTask(task.id, { priority: e.target.value });
    showToast('Priority updated', 'success');
  });

  // Task type change
  document.getElementById('ts-task-type')?.addEventListener('change', async e => {
    await updateTask(task.id, { task_type: e.target.value });
    showToast('Task type updated', 'success');
  });

  // Reviewed toggle
  document.getElementById('ts-reviewed')?.addEventListener('change', async e => {
    await updateTask(task.id, { is_reviewed: e.target.checked });
    showToast(e.target.checked ? 'Marked as reviewed' : 'Unmarked review', 'success');
  });

  // Score slider
  const scoreSlider = document.getElementById('ts-score');
  const scoreVal    = document.getElementById('ts-score-val');
  scoreSlider?.addEventListener('input', () => { scoreVal.textContent = scoreSlider.value; });
  scoreSlider?.addEventListener('change', async () => {
    await updateTask(task.id, { score: parseInt(scoreSlider.value) || null });
    showToast('Score updated', 'success');
  });

  // Timebox
  document.getElementById('ts-timebox-start')?.addEventListener('change', async e => {
    await updateTask(task.id, { timebox_start: e.target.value || null });
    showToast('Timebox start set', 'success');
  });
  document.getElementById('ts-timebox-end')?.addEventListener('change', async e => {
    await updateTask(task.id, { timebox_end: e.target.value || null });
    showToast('Timebox end set', 'success');
  });

  // Due date change
  document.getElementById('ts-due-date')?.addEventListener('change', async e => {
    await updateTask(task.id, { due_date: e.target.value || null });
    showToast('Due date updated', 'success');
  });

  // Title inline edit
  const titleEl = document.getElementById('task-title-edit');
  titleEl?.addEventListener('blur', async () => {
    const newTitle = titleEl.textContent.trim();
    if (newTitle && newTitle !== task.title) {
      await updateTask(task.id, { title: newTitle });
      showToast('Title updated', 'success');
    }
  });
  titleEl?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); titleEl.blur(); } });

  // Description inline edit
  const descEl = document.getElementById('task-desc-edit');
  descEl?.addEventListener('blur', async () => {
    const newDesc = descEl.textContent.trim();
    if (newDesc !== (task.description || '')) {
      await updateTask(task.id, { description: newDesc });
      showToast('Description saved', 'success');
    }
  });

  // Post comment
  document.getElementById('post-comment-btn')?.addEventListener('click', async () => {
    const { postComment } = await import('@api/tasks.js');
    const input = document.getElementById('comment-input');
    const body = input.value.trim();
    if (!body) return;
    await postComment(task.id, { body });
    input.value = '';
    showToast('Comment posted', 'success');
    (await renderTaskDetail(task.id))(container);
  });

  // Subtask checkbox
  container.querySelectorAll('.subtask-cb').forEach(cb => {
    cb.addEventListener('change', async () => {
      await updateTask(cb.dataset.subtaskId, { status: cb.checked ? 'completed' : 'todo' });
    });
  });

  // Add subtask (task_type required — inherit from parent)
  document.getElementById('add-subtask-btn')?.addEventListener('click', async () => {
    const inp = document.getElementById('subtask-input');
    const title = inp.value.trim();
    if (!title) return;
    await createTask(task.project_id, {
      title,
      parent_id: task.id,
      task_type: task.task_type || 'task',
      status: 'todo',
    });
    inp.value = '';
    showToast('Subtask added', 'success');
    (await renderTaskDetail(task.id))(container);
  });

  // Breadcrumb nav
  container.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const nav = el.dataset.nav;
      if (nav === 'projects') import('../js/router.js').then(m => m.router.navigate('/projects'));
      else if (nav.startsWith('project-')) import('../js/router.js').then(m => m.router.navigate(`/projects/${nav.replace('project-','')}`));
    });
  });

  // Add subtask — require task_type
  document.getElementById('add-subtask-btn')?.removeEventListener('click', () => {});
  // (Subtask handler already bound above — will add task_type fix in the handler)

  // ── Dependency management ─────────────────────────────────
  // Remove dependency
  container.querySelectorAll('.dep-remove-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      if (!confirm('Remove this dependency?')) return;
      try {
        await api.delete(`/tasks/${btn.dataset.depTaskId}/dependencies/${btn.dataset.depOnId}`);
        showToast('Dependency removed', 'success');
        (await renderTaskDetail(task.id))(container);
      } catch { showToast('Failed to remove dependency', 'error'); }
    });
  });

  // Add dependency modal
  document.getElementById('add-dep-btn')?.addEventListener('click', async () => {
    const { openModal: openDepModal, closeModal: closeDepModal } = await import('@components/modal.js');
    // Load project tasks for picker
    let projectTasks = [];
    try {
      const res = await api.get(`/projects/${task.project_id}/tasks`, { per_page: 100 });
      projectTasks = (res.data || []).filter(t => t.id !== task.id);
    } catch {}

    openDepModal({
      title: 'Add Dependency',
      subtitle: `What does "${task.title}" depend on?`,
      body: `
        <form id="dep-form">
          <div class="form-group">
            <label class="form-label">This task is blocked by:</label>
            <select name="depends_on_id" class="form-input form-select" required id="dep-task-select">
              <option value="">— Select a task —</option>
              ${projectTasks.map(t => `<option value="${t.id}">${t.title} (${t.status})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Dependency Type</label>
            <select name="type" class="form-input form-select">
              <option value="finish_to_start">Finish to Start (most common)</option>
              <option value="start_to_start">Start to Start</option>
              <option value="finish_to_finish">Finish to Finish</option>
              <option value="start_to_finish">Start to Finish</option>
            </select>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px;padding-top:12px;border-top:1px solid #e2e8f0">
            <button type="button" class="btn btn-ghost" id="dep-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary" id="dep-submit">Add Dependency</button>
          </div>
        </form>`,
    });

    document.getElementById('dep-cancel').addEventListener('click', closeDepModal);
    document.getElementById('dep-form').addEventListener('submit', async e => {
      e.preventDefault();
      const btn = document.getElementById('dep-submit');
      btn.disabled = true; btn.textContent = 'Adding…';
      const fd = Object.fromEntries(new FormData(e.target));
      if (!fd.depends_on_id) { showToast('Select a task', 'error'); btn.disabled = false; btn.textContent = 'Add Dependency'; return; }
      try {
        await api.post(`/tasks/${task.id}/dependencies`, {
          depends_on_id: parseInt(fd.depends_on_id),
          type: fd.type,
        });
        closeDepModal();
        showToast('Dependency added', 'success');
        (await renderTaskDetail(task.id))(container);
      } catch (err) {
        btn.disabled = false; btn.textContent = 'Add Dependency';
      }
    });
  });

  // File upload
  document.getElementById('file-upload')?.addEventListener('change', async e => {
    const { uploadAttachment } = await import('@api/tasks.js');
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    await uploadAttachment(task.id, fd);
    showToast('File uploaded', 'success');
    (await renderTaskDetail(task.id))(container);
  });

  // Download attachment
  container.querySelectorAll('.download-link').forEach(link => {
    link.addEventListener('click', async e => {
      e.preventDefault();
      const { downloadAttachment } = await import('@api/tasks.js');
      const { url } = await downloadAttachment(link.dataset.id);
      window.open(url, '_blank');
    });
  });

  // ── Reviewer management ─────────────────────────────────────
  // Remove reviewer
  container.querySelectorAll('.rv-remove').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const reviewerId = btn.dataset.reviewerId;
      if (!confirm('Remove this reviewer?')) return;
      try {
        await api.delete(`/tasks/${task.id}/reviewers/${reviewerId}`);
        showToast('Reviewer removed', 'success');
        (await renderTaskDetail(task.id))(container);
      } catch { showToast('Failed to remove reviewer', 'error'); }
    });
  });

  // Add reviewer
  document.getElementById('add-reviewer-btn')?.addEventListener('click', async () => {
    const { openModal: openRvModal, closeModal: closeRvModal } = await import('@components/modal.js');
    let users = [];
    try {
      const res = await api.get('/users/search?per_page=50');
      users = Array.isArray(res) ? res : (res.data || []);
    } catch {}
    // Exclude existing reviewers
    const existingIds = (task.reviewers || []).map(r => r.id);
    users = users.filter(u => !existingIds.includes(u.id));

    openRvModal({
      title: 'Add Reviewers',
      body: `
        <div class="form-group">
          <label class="form-label">Select reviewers:</label>
          <div style="max-height:250px;overflow-y:auto;display:flex;flex-direction:column;gap:4px" id="rv-user-list">
            ${users.map(u => `
              <label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:4px;cursor:pointer;font-size:13px" class="rv-user-opt">
                <input type="checkbox" value="${u.id}"/>
                <img src="${u.avatar_url}" style="width:24px;height:24px;border-radius:50%;object-fit:cover"/>
                ${u.name}
              </label>`).join('')}
            ${users.length === 0 ? '<span style="color:#94a3b8;font-size:13px">No available users</span>' : ''}
          </div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px;padding-top:12px;border-top:1px solid #e2e8f0">
          <button class="btn btn-ghost" id="rv-cancel">Cancel</button>
          <button class="btn btn-primary" id="rv-submit">Add Reviewers</button>
        </div>`,
    });

    document.getElementById('rv-cancel')?.addEventListener('click', closeRvModal);
    document.getElementById('rv-submit')?.addEventListener('click', async () => {
      const ids = [...document.querySelectorAll('#rv-user-list input:checked')].map(cb => parseInt(cb.value));
      if (!ids.length) { showToast('Select at least one reviewer', 'error'); return; }
      try {
        await api.post(`/tasks/${task.id}/reviewers`, { reviewer_ids: ids });
        closeRvModal();
        showToast('Reviewers added', 'success');
        (await renderTaskDetail(task.id))(container);
      } catch { showToast('Failed to add reviewers', 'error'); }
    });
  });

  // Approve / Reject review
  document.getElementById('rv-approve-btn')?.addEventListener('click', async () => {
    const note = prompt('Approval note (optional):') || '';
    try {
      await api.post(`/tasks/${task.id}/review`, { status: 'approved', note });
      showToast('Review approved', 'success');
      (await renderTaskDetail(task.id))(container);
    } catch { showToast('Failed to submit review', 'error'); }
  });

  document.getElementById('rv-reject-btn')?.addEventListener('click', async () => {
    const note = prompt('Reason for rejection:');
    if (note === null) return;
    try {
      await api.post(`/tasks/${task.id}/review`, { status: 'rejected', note });
      showToast('Review rejected', 'success');
      (await renderTaskDetail(task.id))(container);
    } catch { showToast('Failed to submit review', 'error'); }
  });
}

// ── New Task Modal ─────────────────────────────────────────────────────────────
export async function openNewTaskModal(container, projectId = null, prefill = null) {
  // If no project context, load projects for selector
  let projects = [];
  if (!projectId) {
    try {
      const { getProjects } = await import('@api/projects.js');
      const res = await getProjects({ per_page: 100 });
      projects = res.data || [];
    } catch {}
  }

  const projectField = !projectId ? `
    <div class="form-group">
      <label class="form-label">Project *</label>
      <select name="project_id" id="new-task-project" class="form-input form-select" required>
        <option value="">— Select a project —</option>
        ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
      </select>
    </div>` : '';

  const pf = prefill || {};
  const selPriority = (v) => ['low','medium','high','urgent'].map(p =>
    `<option value="${p}"${(pf.priority||'medium')===p?' selected':''}>${{low:'🟢 Low',medium:'🔵 Medium',high:'🟠 High',urgent:'🔴 Urgent'}[p]}</option>`
  ).join('');
  const selStatus = (v) => ['backlog','todo','in_progress','working_on','review'].map(s =>
    `<option value="${s}"${(pf.status||'todo')===s?' selected':''}>${{backlog:'Backlog',todo:'To Do',in_progress:'In Progress',working_on:'Working On',review:'Review'}[s]}</option>`
  ).join('');

  openModal({
    title: prefill ? '✨ AI Task — Confirm & Create' : 'Create Task',
    subtitle: projectId ? 'Add a new task to this project' : 'Add a task to any project',
    body: `
      <form id="new-task-form">

        ${projectField}

        <div class="form-group">
          <label class="form-label">Title *</label>
          <input name="title" class="form-input" placeholder="What needs to be done?" required autofocus value="${(pf.title||'').replace(/"/g,'&quot;')}"/>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea name="description" class="form-input form-textarea" placeholder="Add details, steps, or context…">${pf.description||''}</textarea>
        </div>

        <div class="form-sep">Details</div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Type *</label>
            <select name="task_type" class="form-input form-select" required>
              <option value="task" ${(pf.task_type||'task')==='task'?'selected':''}>📋 Task</option>
              <option value="feature" ${pf.task_type==='feature'?'selected':''}>✨ Feature</option>
              <option value="bug" ${pf.task_type==='bug'?'selected':''}>🐛 Bug</option>
              <option value="improvement" ${pf.task_type==='improvement'?'selected':''}>🔧 Improvement</option>
              <option value="story" ${pf.task_type==='story'?'selected':''}>📖 Story</option>
              <option value="spike" ${pf.task_type==='spike'?'selected':''}>🔬 Spike</option>
              <option value="chore" ${pf.task_type==='chore'?'selected':''}>🧹 Chore</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select name="priority" class="form-input form-select">${selPriority()}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select name="status" class="form-input form-select">${selStatus()}</select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input type="date" name="due_date" class="form-input" value="${pf.due_date||''}"/>
          </div>
          <div class="form-group">
            <label class="form-label">Estimated Time (min)</label>
            <input type="number" name="estimated_minutes" class="form-input" placeholder="e.g. 60" min="1" value="${pf.estimated_minutes||''}"/>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Score (Story Points)</label>
            <select name="score" class="form-input form-select">
              <option value="">—</option>
              <option value="1">1 pt</option>
              <option value="2">2 pts</option>
              <option value="3">3 pts</option>
              <option value="5">5 pts</option>
              <option value="8">8 pts</option>
              <option value="13">13 pts</option>
              <option value="21">21 pts</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Start Date</label>
            <input type="date" name="start_date" class="form-input" value="${pf.start_date||''}"/>
          </div>
        </div>

        <div class="form-sep">Timeboxing</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Timebox Start</label>
            <input type="datetime-local" name="timebox_start" class="form-input" id="tb-start"/>
          </div>
          <div class="form-group">
            <label class="form-label">Timebox End</label>
            <input type="datetime-local" name="timebox_end" class="form-input" id="tb-end"/>
          </div>
        </div>
        <div id="timebox-conflict" class="hidden" style="font-size:12px;color:#dc2626;font-weight:600;padding:6px 10px;background:#fef2f2;border-radius:6px;margin-top:4px"></div>

        <div class="form-sep">Assignment</div>

        <div class="form-group">
          <label class="form-label">Assign To</label>
          <div class="picker-wrap">
            <input type="text" id="assignee-search" class="form-input" placeholder="Search team members…" autocomplete="off"/>
            <div id="assignee-dropdown" class="picker-dropdown" style="display:none"></div>
          </div>
          <div id="assignee-chips" class="picker-chips-wrap"></div>
          <input type="hidden" name="assignee_ids" id="assignee-ids" value="[]"/>
        </div>

        <div class="form-group">
          <label class="form-label">Watchers <span class="form-hint" style="display:inline">— notified on updates</span></label>
          <div class="picker-wrap">
            <input type="text" id="watcher-search" class="form-input" placeholder="Search team members…" autocomplete="off"/>
            <div id="watcher-dropdown" class="picker-dropdown" style="display:none"></div>
          </div>
          <div id="watcher-chips" class="picker-chips-wrap"></div>
          <input type="hidden" name="watcher_ids" id="watcher-ids" value="[]"/>
        </div>

        <div class="form-sep">Labels</div>

        <div class="form-group">
          <label class="form-label">Tags</label>
          <div class="picker-wrap">
            <input type="text" id="tag-search" class="form-input" placeholder="Search or create tag…" autocomplete="off"/>
            <div id="tag-dropdown" class="picker-dropdown" style="display:none"></div>
          </div>
          <div id="tag-chips" class="picker-chips-wrap"></div>
          <input type="hidden" name="tag_ids" id="tag-ids" value="[]"/>
        </div>

        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px;padding-top:14px;border-top:1px solid #e2e8f0">
          <button type="button" class="btn btn-ghost" id="cancel-task">Cancel</button>
          <button type="submit" class="btn btn-primary" id="submit-task">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
            Create Task
          </button>
        </div>
      </form>`,
    wide: true,
  });

  const assigneeIds = [];
  const watcherIds  = [];
  const tagIds      = [];

  initPicker('assignee-search', 'assignee-dropdown', 'assignee-chips', 'assignee-ids', assigneeIds, 'user');
  initPicker('watcher-search',  'watcher-dropdown',  'watcher-chips',  'watcher-ids',  watcherIds,  'user');
  initPicker('tag-search',      'tag-dropdown',      'tag-chips',      'tag-ids',      tagIds,      'tag');

  // Timebox overlap validation
  const tbStart = document.getElementById('tb-start');
  const tbEnd   = document.getElementById('tb-end');
  const tbConflict = document.getElementById('timebox-conflict');
  if (tbStart && tbEnd && tbConflict) {
    const checkOverlap = async () => {
      if (!tbStart.value || !tbEnd.value) { tbConflict.classList.add('hidden'); return; }
      try {
        const res = await api.post('/timebox/validate', {
          timebox_start: tbStart.value, timebox_end: tbEnd.value,
        });
        if (res.has_conflicts) {
          tbConflict.innerHTML = '⚠ ' + res.conflicts.map(c => c.message).join('<br>⚠ ');
          tbConflict.classList.remove('hidden');
        } else {
          tbConflict.classList.add('hidden');
        }
      } catch { tbConflict.classList.add('hidden'); }
    };
    tbStart.addEventListener('change', checkOverlap);
    tbEnd.addEventListener('change', checkOverlap);
  }

  document.getElementById('cancel-task').addEventListener('click', closeModal);

  document.getElementById('new-task-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('submit-task');
    btn.disabled = true; btn.textContent = 'Creating…';
    const data = Object.fromEntries(new FormData(e.target));
    // Strip empty strings so nullable fields pass Laravel validation
    Object.keys(data).forEach(k => { if (data[k] === '') delete data[k]; });
    data.assignee_ids = assigneeIds;
    data.watcher_ids  = watcherIds;
    data.tag_ids      = tagIds;

    // Resolve project id
    const pid = projectId || data.project_id;
    if (!pid) {
      showToast('Please select a project', 'error');
      btn.disabled = false; btn.textContent = 'Create Task';
      return;
    }
    delete data.project_id;

    try {
      await createTask(pid, data);
      closeModal();
      showToast('Task created!', 'success');
      if (projectId && container) {
        renderTaskList(container, projectId);
      } else if (container && location.hash === '#/my-tasks') {
        renderMyTasks(container);
      }
      // Otherwise just close — don't replace current page
    } catch { btn.disabled = false; btn.textContent = 'Create Task'; }
  });
}

let pickerTimers = {};

function initPicker(searchId, dropdownId, chipsId, hiddenId, selectedIds, type) {
  const searchInput = document.getElementById(searchId);
  const dropdown = document.getElementById(dropdownId);
  const chipsWrap = document.getElementById(chipsId);
  const hidden = document.getElementById(hiddenId);
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    clearTimeout(pickerTimers[searchId]);
    const q = searchInput.value.trim();
    if (!q) { dropdown.style.display = 'none'; return; }
    pickerTimers[searchId] = setTimeout(async () => {
      try {
        const { api } = await import('@api/apiClient.js');
        const endpoint = type === 'user' ? `/users/search?q=${encodeURIComponent(q)}&per_page=8` : `/tags?q=${encodeURIComponent(q)}&per_page=10`;
        const res = await api.get(endpoint.split('?')[0], { q, per_page: type === 'user' ? 8 : 10 });
        const items = res.data || res || [];
        renderPickerDropdown(items, dropdown, chipsWrap, hidden, selectedIds, searchInput, type);
      } catch {}
    }, 280);
  });

  document.addEventListener('mousedown', e => {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) dropdown.style.display = 'none';
  });
}

function renderPickerDropdown(items, dropdown, chipsWrap, hidden, selectedIds, searchInput, type) {
  if (!items.length) {
    dropdown.innerHTML = type === 'tag' && searchInput.value.trim()
      ? `<div class="picker-item" id="create-tag-item" style="color:#6366f1;font-weight:600">+ Create "${searchInput.value.trim()}"</div>`
      : `<div style="padding:12px;text-align:center;color:#94a3b8;font-size:13px">No results</div>`;
    dropdown.style.display = 'block';
    if (type === 'tag') {
      document.getElementById('create-tag-item')?.addEventListener('click', async () => {
        try {
          const { api } = await import('@api/apiClient.js');
          const tag = await api.post('/tags', { name: searchInput.value.trim(), color: '#6366f1' });
          if (!selectedIds.includes(tag.id)) {
            selectedIds.push(tag.id);
            hidden.value = JSON.stringify(selectedIds);
            addChip(chipsWrap, tag.id, tag.name, tag.color, selectedIds, hidden, type);
          }
          dropdown.style.display = 'none';
          searchInput.value = '';
        } catch {}
      });
    }
    return;
  }

  dropdown.innerHTML = items.map(item => {
    const id = item.id;
    const name = item.name;
    const sel = selectedIds.includes(id);
    if (type === 'user') {
      const av = item.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=24&background=6366f1&color=fff`;
      return `<div class="picker-item ${sel ? 'selected' : ''}" data-id="${id}" data-name="${name}" data-avatar="${av}">
        <img src="${av}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;flex-shrink:0"/>
        <span style="flex:1">${name}</span>
        <span style="font-size:11.5px;color:#94a3b8">${item.email || ''}</span>
        ${sel ? '<span style="color:#6366f1;font-size:14px;font-weight:700">✓</span>' : ''}
      </div>`;
    } else {
      return `<div class="picker-item ${sel ? 'selected' : ''}" data-id="${id}" data-name="${name}" data-color="${item.color || '#6366f1'}">
        <span style="width:10px;height:10px;border-radius:50%;background:${item.color || '#6366f1'};flex-shrink:0;display:inline-block"></span>
        <span>${name}</span>
        ${sel ? '<span style="color:#6366f1;margin-left:auto">✓</span>' : ''}
      </div>`;
    }
  }).join('');
  dropdown.style.display = 'block';

  if (type === 'tag' && searchInput.value.trim()) {
    dropdown.innerHTML += `<div class="picker-item" id="create-tag-item-alt" style="color:#6366f1;font-weight:600;border-top:1px solid #e2e8f0;margin-top:2px;padding-top:8px">+ Create "${searchInput.value.trim()}"</div>`;
    document.getElementById('create-tag-item-alt')?.addEventListener('click', async () => {
      try {
        const { api } = await import('@api/apiClient.js');
        const tag = await api.post('/tags', { name: searchInput.value.trim(), color: '#6366f1' });
        if (!selectedIds.includes(tag.id)) {
          selectedIds.push(tag.id);
          hidden.value = JSON.stringify(selectedIds);
          addChip(chipsWrap, tag.id, tag.name, tag.color, selectedIds, hidden, type);
        }
        dropdown.style.display = 'none'; searchInput.value = '';
      } catch {}
    });
  }

  dropdown.querySelectorAll('[data-id]').forEach(el => {
    el.addEventListener('click', () => {
      const id = parseInt(el.dataset.id);
      if (!selectedIds.includes(id)) {
        selectedIds.push(id);
        hidden.value = JSON.stringify(selectedIds);
        addChip(chipsWrap, id, el.dataset.name, el.dataset.color, selectedIds, hidden, type);
      }
      dropdown.style.display = 'none';
      searchInput.value = '';
    });
  });
}

function addChip(chipsWrap, id, name, color, selectedIds, hidden, type) {
  const chip = document.createElement('div');
  chip.className = 'picker-chip';
  chip.dataset.id = id;
  if (type === 'user') {
    const av = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=18&background=6366f1&color=fff`;
    chip.innerHTML = `<img src="${av}" style="width:18px;height:18px;border-radius:50%;object-fit:cover"/><span>${name}</span><span class="rm">×</span>`;
  } else {
    chip.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:${color||'#6366f1'};display:inline-block"></span><span>${name}</span><span class="rm">×</span>`;
  }
  chip.querySelector('.rm').addEventListener('click', () => {
    const idx = selectedIds.indexOf(id);
    if (idx > -1) selectedIds.splice(idx, 1);
    hidden.value = JSON.stringify(selectedIds);
    chip.remove();
  });
  chipsWrap.appendChild(chip);
}
