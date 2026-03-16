import { getMyTasks, getProjectTasks, getTask, createTask, updateTask, deleteTask } from '@api/tasks.js';
import { handleTimerAction } from './timer.js';
import { openModal, closeModal } from '@components/modal.js';
import { showToast } from '@components/toast.js';
import { priorityBadge, statusPill, formatDate, isOverdue, relativeTime, avatarUrl } from '@utils/helpers.js';

// ── My Tasks Page ──────────────────────────────────────────────────────────────
export async function renderMyTasks(container) {
  container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;
  const res = await getMyTasks();
  const tasks = res.data || [];

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
        <option value="review">Review</option>
        <option value="completed">Completed</option>
      </select>
      <select id="mt-priority" class="form-input form-select" style="width:140px">
        <option value="">All Priority</option>
        <option value="urgent">🔴 Urgent</option>
        <option value="high">🟠 High</option>
        <option value="medium">🔵 Medium</option>
        <option value="low">⚪ Low</option>
      </select>
    </div>
    <div class="my-tasks-list" id="mt-list">
      ${tasks.length === 0
        ? `<div class="full-empty"><div class="full-empty-icon">🎯</div><h3>No tasks assigned to you</h3><p>Tasks assigned to you will appear here</p></div>`
        : tasks.map(t => taskListItem(t)).join('')}
    </div>`;

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
      el.addEventListener('click', e => {
        if (e.target.closest('.task-timer-btn')) return;
        import('../js/router.js').then(m => m.router.navigate(`/tasks/${el.dataset.taskId}`));
      });
    });
    container.querySelectorAll('.task-timer-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const { store } = await import('@store/store.js');
        if (store.get('activeTimer')) {
          const { showToast } = await import('@components/toast.js');
          showToast('Stop the current timer first', 'error');
          return;
        }
        btn.disabled = true;
        try {
          await handleTimerAction(btn.dataset.timerTaskId, 'start');
          btn.textContent = '⏹';
          btn.title = 'Timer running';
          btn.classList.add('running');
        } catch {
          btn.disabled = false;
        }
      });
    });
  }
}

function taskListItem(t) {
  const od      = isOverdue(t.due_date, t.status);
  const canTime = t.status !== 'completed';
  return `
    <div class="task-list-item" data-task-id="${t.id}">
      <div class="task-list-item-left">
        ${priorityBadge(t.priority)}
        <span class="task-list-item-title">${t.title}</span>
        ${t.project ? `<span class="task-list-item-project" style="background:${t.project.color}15;color:${t.project.color}">${t.project.name}</span>` : ''}
      </div>
      <div class="task-list-item-right">
        ${statusPill(t.status)}
        ${t.due_date ? `<span class="task-due ${od ? 'overdue' : ''}">📅 ${formatDate(t.due_date)}</span>` : ''}
        <div style="display:flex">
          ${(t.assignees || []).slice(0,3).map(a => `<img src="${avatarUrl(a)}" class="av-xs" title="${a.name}" style="margin-left:-5px;border:1.5px solid #fff;object-fit:cover"/>`).join('')}
        </div>
        ${canTime ? `<button class="task-timer-btn" data-timer-task-id="${t.id}" title="Start timer">▶</button>` : ''}
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
            <th style="width:38%">Title</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assignees</th>
            <th>Due Date</th>
            <th style="width:44px"></th>
          </tr>
        </thead>
        <tbody id="tasks-tbody">
          ${tasks.length === 0
            ? `<tr><td colspan="6" class="table-empty">No tasks yet — add your first task above</td></tr>`
            : tasks.map(t => taskTableRow(t)).join('')}
        </tbody>
      </table>
    </div>`;

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
      ? `<tr><td colspan="6" class="table-empty">No matching tasks</td></tr>`
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
        import('../js/router.js').then(m => m.router.navigate(`/tasks/${row.dataset.taskId}`));
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

function taskTableRow(t) {
  const od = isOverdue(t.due_date, t.status);
  return `
    <tr data-task-id="${t.id}">
      <td>
        <div class="td-title">
          <span class="task-title-text">${t.title}</span>
          ${t.subtasks_count > 0 ? `<span style="font-size:11px;color:#94a3b8;margin-left:6px">⊞ ${t.subtasks_count}</span>` : ''}
        </div>
      </td>
      <td>${priorityBadge(t.priority)}</td>
      <td>${statusPill(t.status)}</td>
      <td>
        <div class="td-assignees">
          ${(t.assignees || []).slice(0,3).map(a => `<img src="${avatarUrl(a)}" class="av-xs" title="${a.name}" style="border:1.5px solid #fff;object-fit:cover"/>`).join('')}
        </div>
      </td>
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
    const task = await getTask(taskId);

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

          <!-- Status / Priority quick-edit -->
          <div class="ts-section">
            <span class="ts-label">Status</span>
            <select class="form-input form-select form-select" id="ts-status" style="margin-bottom:12px">
              <option value="backlog" ${task.status==='backlog'?'selected':''}>Backlog</option>
              <option value="todo" ${task.status==='todo'?'selected':''}>To Do</option>
              <option value="in_progress" ${task.status==='in_progress'?'selected':''}>In Progress</option>
              <option value="review" ${task.status==='review'?'selected':''}>Review</option>
              <option value="completed" ${task.status==='completed'?'selected':''}>Completed</option>
            </select>
            <span class="ts-label">Priority</span>
            <select class="form-input form-select" id="ts-priority">
              <option value="low" ${task.priority==='low'?'selected':''}>🟢 Low</option>
              <option value="medium" ${task.priority==='medium'?'selected':''}>🔵 Medium</option>
              <option value="high" ${task.priority==='high'?'selected':''}>🟠 High</option>
              <option value="urgent" ${task.priority==='urgent'?'selected':''}>🔴 Urgent</option>
            </select>
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
          ${(task.blocked_by || []).length > 0 ? `
          <div class="ts-section">
            <span class="ts-label">Blocked By</span>
            ${task.blocked_by.map(d => `
              <div class="ts-dep-chip ${d.status !== 'completed' ? 'blocked' : ''}">
                ${d.status === 'completed' ? '✓' : '⚠'} ${d.title}
              </div>`).join('')}
          </div>` : ''}

        </aside>
      </div>`;

    bindTaskDetailEvents(container, task);
  };
}

function renderTimerControls(task) {
  const a = task.active_timer;
  if (!a) {
    return `<button class="btn btn-success btn-sm timer-action-btn" data-action="start" data-task-id="${task.id}">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      Start Timer
    </button>`;
  }
  if (a.status === 'active') {
    return `
      <span class="timer-live-badge">● LIVE</span>
      <button class="btn btn-secondary btn-sm timer-action-btn" data-action="pause" data-task-id="${task.id}">⏸ Pause</button>
      <button class="btn btn-danger btn-sm timer-action-btn" data-action="stop" data-task-id="${task.id}">■ Stop</button>`;
  }
  if (a.status === 'paused') {
    return `
      <button class="btn btn-success btn-sm timer-action-btn" data-action="resume" data-task-id="${task.id}">▶ Resume</button>
      <button class="btn btn-danger btn-sm timer-action-btn" data-action="stop" data-task-id="${task.id}">■ Stop</button>`;
  }
  return '';
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

  // Timer actions
  container.querySelectorAll('.timer-action-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ok = await handleTimerAction(btn.dataset.taskId, btn.dataset.action);
      if (ok) renderTaskDetail(task.id)(container);
    });
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
    renderTaskDetail(task.id)(container);
  });

  // Subtask checkbox
  container.querySelectorAll('.subtask-cb').forEach(cb => {
    cb.addEventListener('change', async () => {
      await updateTask(cb.dataset.subtaskId, { status: cb.checked ? 'completed' : 'todo' });
    });
  });

  // Add subtask
  document.getElementById('add-subtask-btn')?.addEventListener('click', async () => {
    const inp = document.getElementById('subtask-input');
    const title = inp.value.trim();
    if (!title) return;
    await createTask(task.project_id, { title, parent_id: task.id, status: 'todo' });
    inp.value = '';
    showToast('Subtask added', 'success');
    renderTaskDetail(task.id)(container);
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

  // File upload
  document.getElementById('file-upload')?.addEventListener('change', async e => {
    const { uploadAttachment } = await import('@api/tasks.js');
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    await uploadAttachment(task.id, fd);
    showToast('File uploaded', 'success');
    renderTaskDetail(task.id)(container);
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
  const selStatus = (v) => ['backlog','todo','in_progress','review'].map(s =>
    `<option value="${s}"${(pf.status||'todo')===s?' selected':''}>${{backlog:'Backlog',todo:'To Do',in_progress:'In Progress',review:'Review'}[s]}</option>`
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
