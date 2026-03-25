import { api } from '@api/apiClient.js';
import { isOverdue } from '@utils/helpers.js';

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const PRIORITY_COLORS = {
  urgent: '#dc2626', high: '#d97706', medium: '#2563eb', low: '#64748b',
};

export async function renderCalendar(container) {
  await renderMonth(container, new Date());
}

async function renderMonth(container, date) {
  container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  const year  = date.getFullYear();
  const month = date.getMonth();

  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay   = new Date(year, month + 1, 0).getDate();
  const endDate   = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  // Load tasks, meetings, and dependencies in parallel
  const [taskRes, meetingRes, depRes] = await Promise.all([
    api.get('/my-tasks', { per_page: 500 }).catch(() => ({ data: [] })),
    api.get(`/meetings?from=${startDate}&to=${endDate}`).catch(() => ({ data: [] })),
    api.get('/dependencies/all').catch(() => ({ blocked: [], blocking: [] })),
  ]);

  const allTasks = (taskRes.data || []).filter(t => t.due_date && t.due_date >= startDate && t.due_date <= endDate);
  const meetings = (meetingRes.data || []);

  // Build a set of blocked task IDs for the calendar
  const blockedTaskIds = new Set(
    (depRes.blocked || []).filter(t => t.is_blocked).map(t => t.id)
  );

  // Group tasks by date
  const tasksByDate = {};
  allTasks.forEach(t => {
    if (!tasksByDate[t.due_date]) tasksByDate[t.due_date] = [];
    tasksByDate[t.due_date].push(t);
  });

  // Group meetings by date
  const meetingsByDate = {};
  meetings.forEach(m => {
    const d = m.scheduled_start?.split('T')[0] || m.scheduled_start?.split(' ')[0];
    if (d) {
      if (!meetingsByDate[d]) meetingsByDate[d] = [];
      meetingsByDate[d].push(m);
    }
  });

  const firstDow = new Date(year, month, 1).getDay();
  const today    = new Date().toISOString().split('T')[0];

  let cells = '';
  for (let i = 0; i < firstDow; i++) cells += `<div class="cal-cell empty"></div>`;
  for (let d = 1; d <= lastDay; d++) {
    const ds  = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dts = tasksByDate[ds] || [];
    const dms = meetingsByDate[ds] || [];
    const isT = ds === today;
    const totalItems = dts.length + dms.length;

    cells += `
      <div class="cal-cell${isT ? ' today' : ''}${totalItems ? ' has-tasks' : ''}">
        <div class="cal-day-num${isT ? ' today' : ''}">${d}</div>
        <div class="cal-tasks">
          ${dms.slice(0, 2).map(m => {
            const time = new Date(m.scheduled_start).toLocaleTimeString('en', { hour:'2-digit', minute:'2-digit' });
            return `<div class="cal-meeting-chip" data-meeting-id="${m.id}" title="${m.title} at ${time}">
              <span>📅</span>
              <span class="cal-chip-title">${time} ${m.title}</span>
            </div>`;
          }).join('')}
          ${dts.slice(0, 3 - Math.min(dms.length, 2)).map(t => {
            const blocked = blockedTaskIds.has(t.id);
            return `
            <div class="cal-task-chip${isOverdue(t.due_date, t.status) ? ' overdue' : ''}${blocked ? ' blocked' : ''}" data-task-id="${t.id}" title="${t.title}${blocked ? ' (BLOCKED)' : ''}">
              ${blocked ? '<span>🔒</span>' : `<span class="cal-dot" style="background:${PRIORITY_COLORS[t.priority] || '#94a3b8'}"></span>`}
              <span class="cal-chip-title">${t.title}</span>
            </div>`;
          }).join('')}
          ${totalItems > 3 ? `<div class="cal-more">+${totalItems - 3} more</div>` : ''}
        </div>
      </div>`;
  }

  const totalTasks   = allTasks.length;
  const doneTasks    = allTasks.filter(t => t.status === 'completed').length;
  const overdueTasks = allTasks.filter(t => isOverdue(t.due_date, t.status)).length;
  const totalMeetings = meetings.length;

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Calendar</h1>
        <p>
          ${totalTasks} task${totalTasks !== 1 ? 's' : ''} due
          ${totalMeetings > 0 ? ` · ${totalMeetings} meeting${totalMeetings !== 1 ? 's' : ''}` : ''}
          ${overdueTasks > 0 ? `<span style="color:#dc2626;font-weight:600"> · ${overdueTasks} overdue</span>` : ''}
          ${doneTasks > 0 ? `<span style="color:#16a34a"> · ${doneTasks} done</span>` : ''}
        </p>
      </div>
    </div>
    <div class="cal-wrap">
      <div class="cal-nav">
        <button class="btn btn-ghost btn-sm" id="cal-prev">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M15 18l-6-6 6-6"/></svg>
        </button>
        <h2 class="cal-month-title">${MONTH_NAMES[month]} ${year}</h2>
        <button class="btn btn-ghost btn-sm" id="cal-next">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M9 18l6-6-6-6"/></svg>
        </button>
        <button class="btn btn-secondary btn-sm" id="cal-today" style="margin-left:8px">Today</button>
      </div>
      <div class="cal-grid">
        ${DAY_NAMES.map(d => `<div class="cal-day-header">${d}</div>`).join('')}
        ${cells}
      </div>
    </div>`;

  document.getElementById('cal-prev').addEventListener('click',
    () => renderMonth(container, new Date(year, month - 1, 1)));
  document.getElementById('cal-next').addEventListener('click',
    () => renderMonth(container, new Date(year, month + 1, 1)));
  document.getElementById('cal-today').addEventListener('click',
    () => renderMonth(container, new Date()));

  container.querySelectorAll('.cal-task-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      import('../js/router.js').then(m => m.router.navigate(`/tasks/${chip.dataset.taskId}`));
    });
  });

  container.querySelectorAll('.cal-meeting-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      import('../js/router.js').then(m => m.router.navigate('/meetings'));
    });
  });
}
