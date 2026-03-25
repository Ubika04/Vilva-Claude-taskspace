import { api } from '@api/apiClient.js';
import { formatDuration, formatDate, priorityBadge, statusPill, isOverdue } from '@utils/helpers.js';
import { showToast } from '@components/toast.js';
import { store } from '@store/store.js';
import { getUiTheme, themeDashboard } from './ui-themes.js';

export async function renderDashboard(container) {
  container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;
  let data;
  try { data = await api.get('/dashboard'); }
  catch {
    container.innerHTML = `<div class="full-empty"><div class="full-empty-icon">⚠️</div><h3>Could not load dashboard</h3><p>Check that the server is running on port 8000</p></div>`;
    return;
  }

  // Check if current UI theme has its own dashboard
  const uiTheme = getUiTheme();
  const themedHtml = themeDashboard(data, uiTheme);
  if (themedHtml) {
    container.innerHTML = themedHtml;
    bindDashEvents(container);
    return;
  }

  const mt  = data.my_tasks        || [];
  const ov  = data.overdue         || [];
  const pp  = data.project_progress|| [];
  const ws  = data.weekly_stats    || [];
  const totalTime = ws.reduce((a,d) => a + (d.seconds || 0), 0);
  const totalDone = ws.reduce((a,d) => a + (d.tasks_done || 0), 0);

  container.innerHTML = `
    <!-- Stat strip -->
    <div class="dash-stats">
      ${statCard('📋', 'stat-icon-blue',   mt.length,              'Active Tasks')}
      ${statCard('⚠️', 'stat-icon-red',    ov.length,              'Overdue')}
      ${statCard('✅', 'stat-icon-green',  totalDone,              'Done This Week')}
      ${statCard('⏱',  'stat-icon-purple', formatDuration(totalTime), 'Tracked This Week')}
    </div>

    <div class="dash-grid">
      <!-- Left column -->
      <div class="dash-col">

        <div class="card">
          <div class="card-header">
            <h3>My Tasks</h3>
            <a href="#" class="btn btn-ghost btn-sm" id="dash-view-all-tasks">View all →</a>
          </div>
          <div class="dash-card-rows">
            ${mt.length === 0
              ? `<div class="widget-empty"><div class="widget-empty-icon">🎯</div>No active tasks assigned to you</div>`
              : mt.slice(0, 8).map(t => taskRow(t)).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 style="color:var(--red)">⚠ Overdue</h3>
            ${ov.length > 0 ? `<span class="badge-count">${ov.length}</span>` : ''}
          </div>
          <div class="dash-card-rows">
            ${ov.length === 0
              ? `<div class="widget-empty"><div class="widget-empty-icon">🎉</div>Nothing overdue — great work!</div>`
              : ov.slice(0, 6).map(t => overdueRow(t)).join('')}
          </div>
        </div>

      </div>

      <!-- Right column -->
      <div class="dash-col">

        ${data.active_timer ? `
        <div class="timer-widget-card">
          <div class="timer-widget-label">Timer Running</div>
          <div class="timer-widget-task">${data.active_timer.task?.title || 'Unknown Task'}</div>
          <div class="timer-widget-clock" id="dash-timer-clock">00:00:00</div>
          <button class="timer-widget-stop" id="dash-stop-timer" data-task-id="${data.active_timer.task_id}">■ Stop Timer</button>
        </div>` : ''}

        <div class="card">
          <div class="card-header"><h3>Project Progress</h3></div>
          <div class="card-body">
            ${pp.length === 0
              ? `<div class="widget-empty">No active projects</div>`
              : pp.map(p => `
                <div class="proj-prog-row">
                  <div class="proj-prog-top">
                    <span class="proj-prog-dot" style="background:${p.color}"></span>
                    <span class="proj-prog-name">${p.name}</span>
                    <span class="proj-prog-stat">${p.done}/${p.total}</span>
                  </div>
                  <div class="pbar-wrap"><div class="pbar" style="width:${p.progress}%"></div></div>
                  <div class="proj-prog-pct">${p.progress}%</div>
                </div>`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3>This Week</h3></div>
          <div class="card-body">
            ${ws.length === 0
              ? `<div class="widget-empty">No activity this week</div>`
              : `<div class="bar-chart">
                  ${ws.map(day => {
                    const pct = Math.max(4, Math.min(100, (day.seconds / 28800) * 100));
                    const lbl = new Date(day.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' });
                    return `<div class="bar-col">
                      <div class="bar-tasks">${day.tasks_done > 0 ? day.tasks_done : ''}</div>
                      <div class="bar-fill" style="height:${pct}%" title="${formatDuration(day.seconds)}"></div>
                      <div class="bar-day">${lbl}</div>
                    </div>`;
                  }).join('')}
                </div>
                <div class="chart-note">Bar height = hours tracked · Numbers = tasks done</div>`}
          </div>
        </div>

      </div>
    </div>
  `;

  bindDashEvents(container);
}

function bindDashEvents(container) {
  // Row click → navigate to task detail
  container.querySelectorAll('.dash-task-row[data-task-id], .task-list-item[data-task-id]').forEach(el => {
    el.addEventListener('click', () => {
      import('../js/router.js').then(m => m.router.navigate(`/tasks/${el.dataset.taskId}`));
    });
  });
  container.querySelectorAll('.dash-overdue-row[data-task-id]').forEach(el => {
    el.addEventListener('click', () => {
      import('../js/router.js').then(m => m.router.navigate(`/tasks/${el.dataset.taskId}`));
    });
  });
  container.querySelectorAll('.project-card[data-id]').forEach(el => {
    el.addEventListener('click', () => {
      import('../js/router.js').then(m => m.router.navigate(`/projects/${el.dataset.id}`));
    });
  });

  // Timer buttons — start/stop without navigating
  container.querySelectorAll('.dash-timer-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const taskId    = btn.dataset.timerTaskId;
      if (!taskId || taskId === 'undefined') return;
      const taskTitle = btn.closest('[data-task-title]')?.dataset.taskTitle
                     || btn.closest('.dash-task-row')?.querySelector('.dash-task-name')?.textContent
                     || null;
      const isRunning = btn.classList.contains('running');
      btn.disabled = true;
      try {
        const { handleTimerAction } = await import('./timer.js');
        const action = isRunning ? 'stop' : 'start';
        await handleTimerAction(taskId, action, taskTitle);
      } finally {
        btn.disabled = false;
      }
    });
  });

  document.getElementById('dash-view-all-tasks')?.addEventListener('click', e => {
    e.preventDefault();
    import('../js/router.js').then(m => m.router.navigate('/my-tasks'));
  });

  document.getElementById('dash-stop-timer')?.addEventListener('click', async function() {
    const taskId = this.dataset.taskId;
    this.disabled = true;
    try {
      const { handleTimerAction } = await import('./timer.js');
      await handleTimerAction(taskId, 'stop');
      renderDashboard(container);
    } catch {
      this.disabled = false;
    }
  });
}

function statCard(icon, iconClass, val, label) {
  return `
    <div class="stat-card">
      <div class="stat-icon ${iconClass}">${icon}</div>
      <div class="stat-info">
        <span class="stat-val">${val}</span>
        <span class="stat-label">${label}</span>
      </div>
    </div>`;
}

function taskRow(t) {
  const od = isOverdue(t.due_date, t.status);
  const canTime = t.status !== 'completed';
  return `
    <div class="dash-task-row" data-task-id="${t.id}">
      <div class="dash-task-left">
        ${statusPill(t.status)}
        <span class="dash-task-title">${t.title}</span>
      </div>
      <div class="dash-task-right">
        ${t.project ? `<span class="dash-task-project" style="background:${t.project.color}18;color:${t.project.color}">${t.project.name}</span>` : ''}
        ${t.due_date ? `<span class="dash-task-due ${od ? 'is-overdue' : ''}">📅 ${formatDate(t.due_date)}</span>` : ''}
        ${priorityBadge(t.priority)}
        ${canTime && t.id ? `<button class="dash-timer-btn" data-timer-task-id="${t.id}" title="Start timer">▶</button>` : ''}
      </div>
    </div>`;
}

function overdueRow(t) {
  return `
    <div class="dash-overdue-row" data-task-id="${t.id}">
      <div class="dash-overdue-left">
        <span class="dash-overdue-dot"></span>
        <span class="dash-overdue-title">${t.title}</span>
      </div>
      <div class="dash-overdue-right">
        ${t.project ? `<span class="dash-overdue-proj">${t.project.name}</span>` : ''}
        <span class="dash-overdue-date">📅 ${formatDate(t.due_date)}</span>
      </div>
    </div>`;
}
