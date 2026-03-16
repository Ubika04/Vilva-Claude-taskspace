import { api } from '@api/apiClient.js';
import { formatDuration } from '@utils/helpers.js';

export async function renderReports(container) {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Reports</h1>
        <p>Analytics and productivity insights</p>
      </div>
    </div>

    <div class="reports-tabs">
      <div class="rtab active" data-tab="productivity">User Productivity</div>
      <div class="rtab" data-tab="time">Time Tracking</div>
    </div>

    <div id="tab-productivity">
      <div class="report-filters">
        <label style="font-size:13px;font-weight:600;color:#64748b">From</label>
        <input type="date" id="prod-from" class="form-input" value="${monthAgo}" style="width:150px"/>
        <label style="font-size:13px;font-weight:600;color:#64748b">To</label>
        <input type="date" id="prod-to" class="form-input" value="${today}" style="width:150px"/>
        <button class="btn btn-primary btn-sm" id="run-prod">Run Report</button>
        <a href="/api/v1/reports/export-csv?type=productivity" class="btn btn-secondary btn-sm" download>Export CSV</a>
      </div>
      <div id="prod-result"></div>
    </div>

    <div id="tab-time" class="hidden">
      <div class="report-filters">
        <label style="font-size:13px;font-weight:600;color:#64748b">From</label>
        <input type="date" id="time-from" class="form-input" value="${monthAgo}" style="width:150px"/>
        <label style="font-size:13px;font-weight:600;color:#64748b">To</label>
        <input type="date" id="time-to" class="form-input" value="${today}" style="width:150px"/>
        <button class="btn btn-primary btn-sm" id="run-time">Run Report</button>
        <a href="/api/v1/reports/export-csv?type=time_tracking" class="btn btn-secondary btn-sm" download>Export CSV</a>
      </div>
      <div id="time-result"></div>
    </div>`;

  // Tabs
  container.querySelectorAll('.rtab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.rtab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      container.querySelectorAll('[id^="tab-"]').forEach(p => p.classList.add('hidden'));
      document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('hidden');
    });
  });

  // Productivity
  document.getElementById('run-prod').addEventListener('click', async () => {
    const result = document.getElementById('prod-result');
    result.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;
    try {
      const data = await api.get('/reports/user-productivity', {
        from: document.getElementById('prod-from').value,
        to: document.getElementById('prod-to').value,
      });
      result.innerHTML = renderProductivityReport(data);
    } catch { result.innerHTML = `<div class="full-empty"><p>Failed to load report</p></div>`; }
  });

  // Time tracking
  document.getElementById('run-time').addEventListener('click', async () => {
    const result = document.getElementById('time-result');
    result.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;
    try {
      const data = await api.get('/reports/time-tracking', {
        from: document.getElementById('time-from').value,
        to: document.getElementById('time-to').value,
      });
      result.innerHTML = renderTimeReport(data);
    } catch { result.innerHTML = `<div class="full-empty"><p>Failed to load report</p></div>`; }
  });
}

function renderProductivityReport(data) {
  const h = Math.floor((data.total_seconds || 0) / 3600);
  const m = Math.floor(((data.total_seconds || 0) % 3600) / 60);
  return `
    <div class="report-stats">
      <div class="report-stat-card"><span class="report-stat-val">${h}h ${m}m</span><span class="report-stat-lbl">Total Time Tracked</span></div>
      <div class="report-stat-card"><span class="report-stat-val">${data.tasks_completed || 0}</span><span class="report-stat-lbl">Tasks Completed</span></div>
      <div class="report-stat-card"><span class="report-stat-val">${Object.keys(data.daily || {}).length}</span><span class="report-stat-lbl">Active Days</span></div>
    </div>
    <div class="card" style="overflow:hidden">
      <div class="card-header"><h3>Daily Breakdown</h3></div>
      <table class="tasks">
        <thead><tr><th>Date</th><th>Time Tracked</th><th>Tasks Completed</th></tr></thead>
        <tbody>
          ${Object.entries(data.daily || {}).map(([date, d]) => `
            <tr>
              <td style="font-weight:600">${new Date(date).toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'})}</td>
              <td>${formatDuration(d.total_seconds)}</td>
              <td>${d.task_count || 0}</td>
            </tr>`).join('') || `<tr><td colspan="3" class="table-empty">No data for this period</td></tr>`}
        </tbody>
      </table>
    </div>`;
}

function renderTimeReport(data) {
  return `
    <div class="report-stats">
      <div class="report-stat-card"><span class="report-stat-val">${formatDuration(data.total_seconds || 0)}</span><span class="report-stat-lbl">Total Time</span></div>
      <div class="report-stat-card"><span class="report-stat-val">${data.total_tasks || 0}</span><span class="report-stat-lbl">Tasks Worked</span></div>
      <div class="report-stat-card"><span class="report-stat-val">${data.total_users || 0}</span><span class="report-stat-lbl">Team Members</span></div>
    </div>
    <div class="card" style="overflow:hidden">
      <div class="card-header"><h3>Time Log</h3></div>
      <table class="tasks">
        <thead><tr><th>Task</th><th>User</th><th>Duration</th><th>Date</th></tr></thead>
        <tbody>
          ${(data.logs || []).map(l => `
            <tr>
              <td style="font-weight:500">${l.task?.title || '—'}</td>
              <td>${l.user?.name || '—'}</td>
              <td style="font-weight:600;color:#6366f1">${formatDuration(l.duration)}</td>
              <td style="color:#64748b">${new Date(l.start_time).toLocaleDateString()}</td>
            </tr>`).join('') || `<tr><td colspan="4" class="table-empty">No time logs for this period</td></tr>`}
        </tbody>
      </table>
    </div>`;
}
