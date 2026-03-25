/**
 * Vilva Taskspace — Reports Module (v2 — Complete UI Overhaul)
 * Auto-loading reports with modern card-based UI, charts, and inline editing.
 */

import { api } from '@api/apiClient.js';
import { formatDuration, statusPill, priorityBadge } from '@utils/helpers.js';
import { showToast } from '@components/toast.js';

const STATUS_COLORS = { backlog:'#94a3b8', todo:'#3b82f6', in_progress:'#f59e0b', working_on:'#8b5cf6', review:'#a855f7', blocked:'#ef4444', completed:'#10b981' };
const PRIO_COLORS   = { urgent:'#dc2626', high:'#d97706', medium:'#2563eb', low:'#64748b' };

export async function renderReports(container) {
  const today   = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  container.innerHTML = `
    <div class="rpt-page">
      <div class="rpt-header">
        <div>
          <h1 class="rpt-title">Reports & Analytics</h1>
          <p class="rpt-subtitle">Track productivity, time, and team velocity</p>
        </div>
        <div class="rpt-header-actions">
          <div class="rpt-date-range">
            <input type="date" id="rpt-from" class="rpt-date-input" value="${monthAgo}" />
            <span class="rpt-date-sep">to</span>
            <input type="date" id="rpt-to" class="rpt-date-input" value="${today}" />
          </div>
          <button class="rpt-refresh-btn" id="rpt-refresh" title="Refresh all reports">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Refresh
          </button>
        </div>
      </div>

      <div class="rpt-tabs">
        <button class="rpt-tab active" data-tab="productivity">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          Productivity
        </button>
        <button class="rpt-tab" data-tab="time">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 6v6l4 2"/></svg>
          Time Tracking
        </button>
        <button class="rpt-tab" data-tab="velocity">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          Velocity
        </button>
      </div>

      <div id="rpt-content">
        <div class="rpt-loading"><div class="spinner"></div><span>Loading reports...</span></div>
      </div>
    </div>`;

  let activeTab = 'productivity';

  // Tab switching
  container.querySelectorAll('.rpt-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.rpt-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      loadReport(activeTab);
    });
  });

  // Refresh button
  document.getElementById('rpt-refresh').addEventListener('click', () => loadReport(activeTab));

  // Date change auto-reload
  document.getElementById('rpt-from').addEventListener('change', () => loadReport(activeTab));
  document.getElementById('rpt-to').addEventListener('change', () => loadReport(activeTab));

  // Auto-load first report
  await loadReport('productivity');
}

async function loadReport(tab) {
  const content = document.getElementById('rpt-content');
  const from = document.getElementById('rpt-from')?.value;
  const to   = document.getElementById('rpt-to')?.value;

  content.innerHTML = `<div class="rpt-loading"><div class="spinner"></div><span>Loading ${tab} report...</span></div>`;

  try {
    switch (tab) {
      case 'productivity': await loadProductivity(content, from, to); break;
      case 'time':         await loadTimeTracking(content, from, to); break;
      case 'velocity':     await loadVelocity(content, from, to); break;
    }
  } catch (err) {
    console.error('Report error:', err);
    content.innerHTML = `
      <div class="rpt-error">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 8v4m0 4h.01"/></svg>
        <h3>Failed to load report</h3>
        <p>${err?.message || 'Check that the backend server is running and try again.'}</p>
        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('rpt-refresh').click()">Try Again</button>
      </div>`;
  }
}

// ── Productivity Report ─────────────────────────────────────────────────────

async function loadProductivity(content, from, to) {
  const data = await api.get('/reports/user-productivity', { from, to });

  const totalSec = data.total_seconds || 0;
  const hours = Math.floor(totalSec / 3600);
  const mins  = Math.floor((totalSec % 3600) / 60);
  const daily = data.daily || {};
  const dailyEntries = Object.entries(daily);
  const maxSec = dailyEntries.reduce((max, [, d]) => Math.max(max, d.total_seconds || 0), 1);

  content.innerHTML = `
    <div class="rpt-stats-row">
      ${rptStat(hours + 'h ' + mins + 'm', 'Time Tracked', '#6366f1', '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 6v6l4 2"/></svg>')}
      ${rptStat(data.tasks_completed || 0, 'Tasks Completed', '#10b981', '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>')}
      ${rptStat(dailyEntries.length, 'Active Days', '#f59e0b', '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path stroke-linecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>')}
      ${rptStat(data.user?.name || 'You', 'User', '#8b5cf6', '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>')}
    </div>

    ${dailyEntries.length > 0 ? `
    <div class="rpt-card">
      <div class="rpt-card-head">
        <h3>Daily Activity</h3>
        <span class="rpt-card-badge">${dailyEntries.length} days</span>
      </div>
      <div class="rpt-bar-chart">
        ${dailyEntries.map(([date, d]) => {
          const pct = Math.max(8, Math.round((d.total_seconds / maxSec) * 100));
          const day = new Date(date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
          return `
            <div class="rpt-bar-col">
              <div class="rpt-bar-value">${formatDuration(d.total_seconds)}</div>
              <div class="rpt-bar-fill" style="height:${pct}%"></div>
              <div class="rpt-bar-tasks">${d.task_count || 0} tasks</div>
              <div class="rpt-bar-label">${day}</div>
            </div>`;
        }).join('')}
      </div>
    </div>` : `
    <div class="rpt-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
      <h3>No activity data</h3>
      <p>No time tracked in this date range. Start a timer on a task to see data here.</p>
    </div>`}

    ${renderTimeLogs(data.time_logs || [])}`;

  bindReportEditing(content);
}

// ── Time Tracking Report ────────────────────────────────────────────────────

async function loadTimeTracking(content, from, to) {
  const data = await api.get('/reports/time-tracking', { from, to });
  const logs = data.logs || [];

  content.innerHTML = `
    <div class="rpt-stats-row">
      ${rptStat(formatDuration(data.total_seconds || 0), 'Total Time', '#6366f1', '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 6v6l4 2"/></svg>')}
      ${rptStat(data.total_tasks || 0, 'Tasks Worked', '#10b981', '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/></svg>')}
      ${rptStat(data.total_users || 0, 'Team Members', '#8b5cf6', '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>')}
      ${rptStat(logs.length, 'Time Entries', '#f59e0b', '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>')}
    </div>

    ${logs.length > 0 ? `
    <div class="rpt-card">
      <div class="rpt-card-head">
        <h3>Time Entries</h3>
        <a href="/api/v1/reports/export-csv?type=time_tracking&from=${from}&to=${to}" class="rpt-export-btn" download>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export CSV
        </a>
      </div>
      <div class="rpt-table-wrap">
        <table class="rpt-table">
          <thead>
            <tr><th>Task</th><th>User</th><th>Duration</th><th>Date</th><th>Project</th></tr>
          </thead>
          <tbody>
            ${logs.map(l => `
              <tr>
                <td><span class="rpt-task-name">${l.task?.title || '—'}</span></td>
                <td><span class="rpt-user-name">${l.user?.name || '—'}</span></td>
                <td><span class="rpt-duration">${formatDuration(l.duration)}</span></td>
                <td><span class="rpt-date">${new Date(l.start_time).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span></td>
                <td><span class="rpt-project">${l.task?.project?.name || '—'}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>` : `
    <div class="rpt-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 6v6l4 2"/></svg>
      <h3>No time entries</h3>
      <p>No time logs found for this period. Start tracking time on tasks to see entries here.</p>
    </div>`}`;
}

// ── Velocity Report ─────────────────────────────────────────────────────────

async function loadVelocity(content, from, to) {
  // First load projects for selector
  let projects = [];
  try {
    const res = await api.get('/projects', { per_page: 100 });
    projects = res.data || [];
  } catch {}

  content.innerHTML = `
    <div class="rpt-vel-selector">
      <label>Select Project</label>
      <select id="vel-project" class="rpt-select">
        ${projects.length === 0
          ? '<option value="">No projects available</option>'
          : '<option value="">Choose a project...</option>' + projects.map(p =>
              `<option value="${p.id}">${p.name}</option>`).join('')}
      </select>
      <button class="rpt-refresh-btn" id="run-vel-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        Load Velocity
      </button>
    </div>
    <div id="vel-result">
      <div class="rpt-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        <h3>Select a project</h3>
        <p>Choose a project above to view velocity and scoring data.</p>
      </div>
    </div>`;

  document.getElementById('run-vel-btn')?.addEventListener('click', async () => {
    const projectId = document.getElementById('vel-project')?.value;
    if (!projectId) { showToast('Please select a project', 'error'); return; }

    const result = document.getElementById('vel-result');
    result.innerHTML = `<div class="rpt-loading"><div class="spinner"></div><span>Loading velocity...</span></div>`;

    try {
      const data = await api.get('/reports/velocity', { project_id: projectId, from, to });
      const weeks = Object.entries(data.weekly || {});
      const members = data.member_stats || [];

      result.innerHTML = `
        <div class="rpt-stats-row">
          ${rptStat(data.total_score || 0, 'Total Score', '#6366f1', '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>')}
          ${rptStat(data.total_tasks || 0, 'Tasks Completed', '#10b981', '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>')}
          ${rptStat(weeks.length, 'Weeks Tracked', '#f59e0b', '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path stroke-linecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>')}
          ${rptStat(members.length, 'Contributors', '#8b5cf6', '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>')}
        </div>

        ${weeks.length > 0 ? `
        <div class="rpt-card">
          <div class="rpt-card-head"><h3>Weekly Velocity</h3></div>
          <div class="rpt-table-wrap">
            <table class="rpt-table">
              <thead><tr><th>Week</th><th>Tasks</th><th>Score</th><th>Time</th><th>Avg Score</th></tr></thead>
              <tbody>
                ${weeks.map(([week, w]) => `
                  <tr>
                    <td><strong>${new Date(week).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</strong></td>
                    <td>${w.tasks_completed}</td>
                    <td><span class="rpt-score">${w.total_score} pts</span></td>
                    <td>${formatDuration((w.total_time_mins || 0) * 60)}</td>
                    <td>${w.avg_score}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>` : ''}

        ${members.length > 0 ? `
        <div class="rpt-card">
          <div class="rpt-card-head"><h3>Member Scoring</h3></div>
          <div class="rpt-members-grid">
            ${members.map(m => `
              <div class="rpt-member-card">
                <div class="rpt-member-name">${m.name}</div>
                <div class="rpt-member-stats">
                  <div><span class="rpt-member-val">${m.tasks_done}</span><span class="rpt-member-lbl">tasks</span></div>
                  <div><span class="rpt-member-val rpt-score">${m.total_score}</span><span class="rpt-member-lbl">points</span></div>
                  <div><span class="rpt-member-val">${formatDuration((m.total_time_mins || 0) * 60)}</span><span class="rpt-member-lbl">time</span></div>
                </div>
              </div>`).join('')}
          </div>
        </div>` : ''}

        ${weeks.length === 0 && members.length === 0 ? `
        <div class="rpt-empty">
          <h3>No velocity data</h3>
          <p>No completed tasks with scores found in this period for the selected project.</p>
        </div>` : ''}`;
    } catch (err) {
      result.innerHTML = `<div class="rpt-error"><h3>Failed to load velocity</h3><p>${err?.message || 'Unknown error'}</p></div>`;
    }
  });
}

// ── Shared Renderers ────────────────────────────────────────────────────────

function rptStat(value, label, color, icon) {
  return `
    <div class="rpt-stat">
      <div class="rpt-stat-icon" style="background:${color}15;color:${color}">${icon}</div>
      <div class="rpt-stat-info">
        <span class="rpt-stat-val">${value}</span>
        <span class="rpt-stat-lbl">${label}</span>
      </div>
    </div>`;
}

function renderTimeLogs(logs) {
  if (!logs || logs.length === 0) return '';
  const uniqueTasks = {};
  for (const l of logs) {
    if (l.task?.id && !uniqueTasks[l.task.id]) uniqueTasks[l.task.id] = l.task;
  }
  const tasks = Object.values(uniqueTasks);
  if (tasks.length === 0) return '';

  return `
    <div class="rpt-card">
      <div class="rpt-card-head"><h3>Tasks in Report</h3><span class="rpt-card-badge">${tasks.length} tasks</span></div>
      <div class="rpt-table-wrap">
        <table class="rpt-table">
          <thead><tr><th>Task</th><th>Status</th><th>Project</th><th></th></tr></thead>
          <tbody>
            ${tasks.map(t => `
              <tr>
                <td><span class="rpt-task-name">${t.title}</span></td>
                <td>${statusPill(t.status)}</td>
                <td><span class="rpt-project">${t.project?.name || '—'}</span></td>
                <td><button class="btn btn-ghost btn-sm rpt-edit-btn" data-task-id="${t.id}">Edit</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function bindReportEditing(content) {
  content.querySelectorAll('.rpt-edit-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const taskId = btn.dataset.taskId;
      if (!taskId) return;
      try {
        const task = await api.get(`/tasks/${taskId}`);
        openReportTaskEditor(task);
      } catch {
        showToast('Failed to load task', 'error');
      }
    });
  });
}

async function openReportTaskEditor(task) {
  const { openModal, closeModal } = await import('@components/modal.js');
  const statuses = ['backlog','todo','in_progress','working_on','review','blocked','completed'];
  const priorities = ['low','medium','high','urgent'];

  openModal({
    title: `Edit: ${task.title}`,
    body: `
      <form id="rpt-edit-form" class="rpt-edit-form">
        <div class="form-group">
          <label class="form-label">Title</label>
          <input name="title" class="form-input" value="${(task.title||'').replace(/"/g,'&quot;')}"/>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Status</label>
            <select name="status" class="form-input form-select">
              ${statuses.map(s => `<option value="${s}" ${task.status===s?'selected':''}>${s.replace('_',' ')}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select name="priority" class="form-input form-select">
              ${priorities.map(p => `<option value="${p}" ${task.priority===p?'selected':''}>${p}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Score</label>
            <select name="score" class="form-input form-select">
              <option value="">—</option>
              ${[1,2,3,5,8,13,21].map(s => `<option value="${s}" ${task.score==s?'selected':''}>${s} pts</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input type="date" name="due_date" class="form-input" value="${task.due_date||''}"/>
          </div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px;padding-top:12px;border-top:1px solid var(--border)">
          <button type="button" class="btn btn-ghost" id="rpt-edit-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary" id="rpt-edit-save">Save Changes</button>
        </div>
      </form>`,
  });

  document.getElementById('rpt-edit-cancel').addEventListener('click', closeModal);
  document.getElementById('rpt-edit-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('rpt-edit-save');
    btn.disabled = true; btn.textContent = 'Saving...';
    const data = Object.fromEntries(new FormData(e.target));
    Object.keys(data).forEach(k => { if (data[k] === '') delete data[k]; });
    if (data.score) data.score = parseInt(data.score);
    try {
      await api.patch(`/tasks/${task.id}`, data);
      closeModal();
      showToast('Task updated', 'success');
    } catch {
      btn.disabled = false; btn.textContent = 'Save Changes';
    }
  });
}
