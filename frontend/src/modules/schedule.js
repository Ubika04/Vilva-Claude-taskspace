/**
 * Vilva Taskspace — Schedule Module
 * Task scheduling with conflict detection, dependency validation,
 * and available slot finder.
 */

import { api } from '@api/apiClient.js';
import { showToast } from '@components/toast.js';

// ── Schedule Conflict Checker (used in task create/edit modals) ─────────────

export async function checkScheduleConflict(taskId, start, end, scheduleType = 'work') {
  try {
    const res = await api.post('/schedule/validate', {
      task_id: taskId,
      scheduled_start: start,
      scheduled_end: end,
      schedule_type: scheduleType,
    });
    return res;
  } catch (err) {
    return { has_conflicts: false, time_conflicts: [], dependency_conflicts: [] };
  }
}

/**
 * Render conflict warnings inline within a form.
 * Call this after the user picks start/end datetimes.
 */
export function renderConflictWarnings(containerId, conflicts) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (!conflicts.has_conflicts) {
    el.innerHTML = `<div class="schedule-ok">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
      No scheduling conflicts
    </div>`;
    return;
  }

  let html = '';

  if (conflicts.time_conflicts?.length) {
    html += `<div class="schedule-conflict-group">
      <div class="schedule-conflict-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
        Time Conflicts
      </div>
      ${conflicts.time_conflicts.map(c => `
        <div class="schedule-conflict-item">
          <span class="schedule-conflict-task">${c.task_title}</span>
          <span class="schedule-conflict-type">${c.type}</span>
          <span class="schedule-conflict-time">${formatDateTime(c.start)} — ${formatDateTime(c.end)}</span>
        </div>
      `).join('')}
    </div>`;
  }

  if (conflicts.dependency_conflicts?.length) {
    html += `<div class="schedule-conflict-group">
      <div class="schedule-conflict-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
        Dependency Conflicts
      </div>
      ${conflicts.dependency_conflicts.map(c => `
        <div class="schedule-conflict-item">
          <span class="schedule-conflict-msg">${c.message}</span>
        </div>
      `).join('')}
    </div>`;
  }

  el.innerHTML = `<div class="schedule-conflicts">${html}</div>`;
}

// ── Schedule Task Modal ─────────────────────────────────────────────────────

export async function openScheduleModal(taskId, taskTitle, taskType) {
  const { openModal, closeModal } = await import('@components/modal.js');

  const scheduleType = ['review', 'meeting'].includes(taskType) ? taskType : 'work';

  openModal({
    title: `Schedule: ${taskTitle}`,
    body: `
      <div class="schedule-modal">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Start</label>
            <input type="datetime-local" id="sched-start" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">End</label>
            <input type="datetime-local" id="sched-end" class="form-input" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Type</label>
          <select id="sched-type" class="form-select">
            <option value="work" ${scheduleType === 'work' ? 'selected' : ''}>Work</option>
            <option value="review" ${scheduleType === 'review' ? 'selected' : ''}>Review</option>
            <option value="meeting" ${scheduleType === 'meeting' ? 'selected' : ''}>Meeting</option>
          </select>
        </div>
        <div id="sched-conflicts"></div>
        <div id="sched-slots" class="schedule-slots-section"></div>
        <div class="schedule-modal-actions">
          <button class="btn btn-ghost" id="sched-cancel">Cancel</button>
          <button class="btn btn-secondary" id="sched-find-slots">Find Available Slots</button>
          <button class="btn btn-primary" id="sched-save" disabled>Schedule</button>
        </div>
      </div>`,
  });

  // Set default start to next hour
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  const startStr = toLocalISOString(now);
  const end = new Date(now.getTime() + 60 * 60000);
  const endStr = toLocalISOString(end);

  document.getElementById('sched-start').value = startStr;
  document.getElementById('sched-end').value = endStr;

  // Validate on change
  const validate = async () => {
    const start = document.getElementById('sched-start').value;
    const endVal = document.getElementById('sched-end').value;
    const type = document.getElementById('sched-type').value;

    if (!start || !endVal) return;

    const conflicts = await checkScheduleConflict(taskId, start, endVal, type);
    renderConflictWarnings('sched-conflicts', conflicts);

    document.getElementById('sched-save').disabled = conflicts.has_conflicts;
  };

  document.getElementById('sched-start').addEventListener('change', validate);
  document.getElementById('sched-end').addEventListener('change', validate);
  document.getElementById('sched-type').addEventListener('change', validate);

  // Initial validation
  validate();

  // Find available slots
  document.getElementById('sched-find-slots').addEventListener('click', async () => {
    const start = document.getElementById('sched-start').value;
    if (!start) return;

    const date = start.split('T')[0];
    const endVal = document.getElementById('sched-end').value;
    const duration = endVal && start
      ? Math.round((new Date(endVal) - new Date(start)) / 60000)
      : 60;

    try {
      const res = await api.get('/schedule/available-slots', {
        date,
        duration_minutes: Math.max(15, duration),
      });

      const slotsEl = document.getElementById('sched-slots');
      if (!res.slots?.length) {
        slotsEl.innerHTML = '<p class="text-muted">No available slots found for this day</p>';
        return;
      }

      slotsEl.innerHTML = `
        <h4>Available Slots</h4>
        <div class="schedule-slot-list">
          ${res.slots.map(s => `
            <button class="schedule-slot-btn" data-start="${s.start}" data-end="${s.end}">
              ${formatDateTime(s.start)} — ${formatDateTime(s.end)}
            </button>
          `).join('')}
        </div>`;

      slotsEl.querySelectorAll('.schedule-slot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.getElementById('sched-start').value = toLocalISOString(new Date(btn.dataset.start));
          document.getElementById('sched-end').value = toLocalISOString(new Date(btn.dataset.end));
          validate();
        });
      });
    } catch {
      showToast('Failed to find slots', 'error');
    }
  });

  // Save
  document.getElementById('sched-save').addEventListener('click', async () => {
    const start = document.getElementById('sched-start').value;
    const endVal = document.getElementById('sched-end').value;
    const type = document.getElementById('sched-type').value;

    try {
      await api.post(`/tasks/${taskId}/schedule`, {
        scheduled_start: start,
        scheduled_end: endVal,
        schedule_type: type,
      });
      showToast('Task scheduled successfully', 'success');
      closeModal();
    } catch (err) {
      if (err.message) showToast(err.message, 'error');
    }
  });

  document.getElementById('sched-cancel').addEventListener('click', closeModal);
}

// ── My Schedule View ────────────────────────────────────────────────────────

export async function renderMySchedule(container) {
  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  container.innerHTML = `
    <div class="schedule-page">
      <div class="schedule-header">
        <h2>My Schedule</h2>
        <div class="schedule-date-range">
          <input type="date" id="sched-range-from" class="form-input form-input-sm" value="${today.toISOString().split('T')[0]}" />
          <span>to</span>
          <input type="date" id="sched-range-to" class="form-input form-input-sm" value="${weekEnd.toISOString().split('T')[0]}" />
          <button class="btn btn-sm btn-secondary" id="sched-load">Load</button>
        </div>
      </div>
      <div id="schedule-timeline" class="schedule-timeline">
        <div class="spinner-wrap"><div class="spinner"></div></div>
      </div>
    </div>`;

  document.getElementById('sched-load').addEventListener('click', loadSchedule);
  await loadSchedule();
}

async function loadSchedule() {
  const from = document.getElementById('sched-range-from')?.value;
  const to = document.getElementById('sched-range-to')?.value;
  const timeline = document.getElementById('schedule-timeline');

  if (!from || !to) return;

  try {
    const schedule = await api.get('/schedule/my', { from, to });

    if (!schedule?.length) {
      timeline.innerHTML = '<div class="schedule-empty"><p>No scheduled tasks in this period</p></div>';
      return;
    }

    // Group by date
    const byDate = {};
    schedule.forEach(s => {
      const date = new Date(s.scheduled_start).toLocaleDateString();
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(s);
    });

    const typeColors = { work: '#6366f1', review: '#8b5cf6', meeting: '#f59e0b' };
    const prioColors = { urgent: '#dc2626', high: '#d97706', medium: '#2563eb', low: '#64748b' };

    timeline.innerHTML = Object.entries(byDate).map(([date, items]) => `
      <div class="schedule-day">
        <div class="schedule-day-header">${date}</div>
        <div class="schedule-day-items">
          ${items.map(s => `
            <div class="schedule-item" style="border-left:3px solid ${typeColors[s.schedule_type] || '#6366f1'}">
              <div class="schedule-item-time">
                ${formatTime(s.scheduled_start)} — ${formatTime(s.scheduled_end)}
                <span class="schedule-duration">${s.duration_minutes}m</span>
              </div>
              <div class="schedule-item-info">
                <span class="schedule-item-title">${s.task?.title || 'Unknown'}</span>
                <span class="schedule-item-type" style="background:${typeColors[s.schedule_type] || '#6366f1'}">${s.schedule_type}</span>
                ${s.task?.priority ? `<span class="schedule-item-prio" style="color:${prioColors[s.task.priority]}">${s.task.priority}</span>` : ''}
                ${s.task?.status ? `<span class="schedule-item-status">${s.task.status.replace('_', ' ')}</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  } catch {
    timeline.innerHTML = '<p class="text-muted">Failed to load schedule</p>';
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDateTime(iso) {
  return new Date(iso).toLocaleString([], {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function toLocalISOString(date) {
  const offset = date.getTimezoneOffset();
  const d = new Date(date.getTime() - offset * 60000);
  return d.toISOString().slice(0, 16);
}
