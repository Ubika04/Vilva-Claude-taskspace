/**
 * Admin Module — All team members with their tasks
 * Visible to admin role only.
 */

import { api } from '@api/apiClient.js';
import { formatDate, statusPill, priorityBadge, avatarUrl, isOverdue } from '@utils/helpers.js';
import { showToast } from '@components/toast.js';

export async function renderAdmin(container) {
  container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  let res;
  try {
    res = await api.get('/admin/users');
  } catch {
    container.innerHTML = `
      <div class="full-empty">
        <div class="full-empty-icon">🔒</div>
        <h3>Admin access required</h3>
        <p>You don't have permission to view this page.</p>
      </div>`;
    return;
  }

  const users = res.data || [];

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Team Members</h1>
        <p>${users.length} member${users.length !== 1 ? 's' : ''} total</p>
      </div>
      <div class="page-header-right">
        <input type="search" id="admin-search" class="form-input" placeholder="Search members…" style="width:220px"/>
      </div>
    </div>
    <div class="admin-overview-strip">
      ${adminStatCard('👥', 'stat-icon-blue',   users.length,
          'Members')}
      ${adminStatCard('📋', 'stat-icon-purple', users.reduce((a, u) => a + u.task_stats.total, 0),
          'Total Tasks')}
      ${adminStatCard('⚡', 'stat-icon-amber',  users.reduce((a, u) => a + u.task_stats.in_progress, 0),
          'In Progress')}
      ${adminStatCard('⚠️', 'stat-icon-red',    users.reduce((a, u) => a + u.task_stats.overdue, 0),
          'Overdue')}
    </div>
    <div class="admin-members-list" id="admin-members-list">
      ${users.map(u => memberCard(u)).join('')}
    </div>`;

  // Search
  document.getElementById('admin-search')?.addEventListener('input', function () {
    const q = this.value.toLowerCase();
    container.querySelectorAll('.admin-member-card').forEach(card => {
      card.style.display = card.dataset.name.toLowerCase().includes(q) ? '' : 'none';
    });
  });

  // Expand/collapse task lists
  container.querySelectorAll('.admin-expand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card     = btn.closest('.admin-member-card');
      const taskList = card.querySelector('.admin-task-list');
      const isOpen   = !taskList.classList.contains('hidden');
      taskList.classList.toggle('hidden', isOpen);
      btn.innerHTML  = isOpen
        ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg> Show tasks`
        : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg> Hide tasks`;
    });
  });

  // Navigate to task detail on row click
  container.querySelectorAll('.admin-task-row').forEach(el => {
    el.addEventListener('click', () => {
      import('../js/router.js').then(m => m.router.navigate(`/tasks/${el.dataset.taskId}`));
    });
  });
}

function adminStatCard(icon, cls, val, label) {
  return `
    <div class="stat-card">
      <div class="stat-icon ${cls}">${icon}</div>
      <div class="stat-info">
        <span class="stat-val">${val}</span>
        <span class="stat-label">${label}</span>
      </div>
    </div>`;
}

function memberCard(u) {
  const s      = u.task_stats;
  const tasks  = u.tasks || [];
  const isAdm  = (u.roles || []).includes('admin');
  const avUrl  = u.avatar_url || avatarUrl(u);
  const lastAc = u.last_active_at
    ? new Date(u.last_active_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Never';

  return `
    <div class="admin-member-card" data-name="${u.name}">
      <div class="admin-member-header">
        <img src="${avUrl}" class="admin-member-avatar" alt="${u.name}"/>
        <div class="admin-member-info">
          <div class="admin-member-name">
            ${u.name}
            ${isAdm ? `<span class="admin-role-badge">Admin</span>` : ''}
            <span class="admin-status-dot ${u.status === 'active' ? 'active' : 'inactive'}"></span>
          </div>
          <div class="admin-member-email">${u.email}</div>
          <div class="admin-member-last">Last active: ${lastAc}</div>
        </div>
        <div class="admin-member-stats">
          <div class="admin-stat-pill">
            <span class="admin-stat-num">${s.total}</span>
            <span class="admin-stat-lbl">Total</span>
          </div>
          <div class="admin-stat-pill amber">
            <span class="admin-stat-num">${s.in_progress}</span>
            <span class="admin-stat-lbl">Active</span>
          </div>
          <div class="admin-stat-pill green">
            <span class="admin-stat-num">${s.completed}</span>
            <span class="admin-stat-lbl">Done</span>
          </div>
          ${s.overdue > 0 ? `
          <div class="admin-stat-pill red">
            <span class="admin-stat-num">${s.overdue}</span>
            <span class="admin-stat-lbl">Overdue</span>
          </div>` : ''}
        </div>
        ${tasks.length > 0 ? `
        <button class="admin-expand-btn btn btn-ghost btn-sm">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
          Show tasks
        </button>` : ''}
      </div>
      ${tasks.length > 0 ? `
      <div class="admin-task-list hidden">
        <div class="admin-task-list-head">
          <span>Task</span><span>Project</span><span>Status</span><span>Due</span>
        </div>
        ${tasks.map(t => adminTaskRow(t)).join('')}
      </div>
      ` : `<div class="admin-no-tasks">No tasks assigned to this member</div>`}
    </div>`;
}

function adminTaskRow(t) {
  const od = isOverdue(t.due_date, t.status);
  return `
    <div class="admin-task-row" data-task-id="${t.id}">
      <div class="admin-task-title-cell">
        ${priorityBadge(t.priority)}
        <span class="admin-task-title">${t.title}</span>
      </div>
      <div>
        ${t.project
          ? `<span class="task-proj-chip" style="background:${t.project.color}18;color:${t.project.color}">${t.project.name}</span>`
          : `<span class="muted">—</span>`}
      </div>
      <div>${statusPill(t.status)}</div>
      <div>
        ${t.due_date
          ? `<span class="task-due ${od ? 'overdue' : ''}">📅 ${formatDate(t.due_date)}</span>`
          : `<span class="muted">—</span>`}
      </div>
    </div>`;
}
