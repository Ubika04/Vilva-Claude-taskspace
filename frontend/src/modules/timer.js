/**
 * Timer Module — Start/Pause/Resume/Stop with live clock
 */

import { getActiveTimer, startTimer, pauseTimer, resumeTimer, stopTimer } from '@api/timer.js';
import { store } from '@store/store.js';
import { showToast } from '@components/toast.js';

let timerInterval      = null;
let timerStartedAt     = null;
let timerPausedDuration = 0;
let currentTaskId      = null;

// ── Init ─────────────────────────────────────────────────────────────────────

export async function initTimer() {
  const active = await getActiveTimer().catch(() => null);

  if (active && active.id) {
    store.set('activeTimer', active);
    currentTaskId       = active.task_id;
    timerStartedAt      = new Date(active.start_time).getTime();
    timerPausedDuration = (active.paused_duration || 0) * 1000;
    startClock(active.task || { id: active.task_id, title: 'Task #' + active.task_id });
    _bindSidebarStop(active.task_id);
  } else {
    store.set('activeTimer', null);
    stopClock();
  }
}

// ── Clock ─────────────────────────────────────────────────────────────────────

export function startClock(task) {
  clearInterval(timerInterval);

  const widget   = document.getElementById('sidebar-timer');
  const taskName = document.getElementById('sidebar-timer-name');

  if (widget)   widget.classList.remove('hidden');
  if (taskName && task) taskName.textContent = task.title || 'Running…';

  timerInterval = setInterval(() => {
    const elapsed = Date.now() - timerStartedAt - timerPausedDuration;
    const formatted = formatElapsed(elapsed);

    const display = document.getElementById('sidebar-timer-clock');
    if (display) display.textContent = formatted;

    // Sync any visible dash/task clocks
    const dashClock = document.getElementById('dash-timer-clock');
    if (dashClock) dashClock.textContent = formatted;
  }, 1000);
}

export function stopClock() {
  clearInterval(timerInterval);
  timerInterval       = null;
  timerStartedAt      = null;
  timerPausedDuration = 0;
  currentTaskId       = null;

  const widget = document.getElementById('sidebar-timer');
  if (widget) widget.classList.add('hidden');
}

// ── Sidebar stop button ───────────────────────────────────────────────────────

function _bindSidebarStop(taskId) {
  const stopBtn = document.getElementById('sidebar-stop-btn');
  if (!stopBtn) return;

  // Clone to remove previous listeners
  const fresh = stopBtn.cloneNode(true);
  stopBtn.parentNode.replaceChild(fresh, stopBtn);

  fresh.addEventListener('click', async () => {
    fresh.disabled = true;
    fresh.textContent = '■ Stopping…';
    try {
      await stopTimer(taskId);
      stopClock();
      store.set('activeTimer', null);
      showToast('Timer stopped', 'success');
      // Refresh all timer buttons on current page
      _syncTimerButtons(taskId, false);
    } catch (err) {
      showToast(err?.message || 'Could not stop timer', 'error');
      fresh.disabled = false;
      fresh.textContent = '■ Stop Timer';
    }
  });
}

// ── Main action handler ───────────────────────────────────────────────────────

/**
 * handleTimerAction(taskId, action, taskTitle?)
 * Called from dashboard, task list, kanban card timer buttons.
 */
export async function handleTimerAction(taskId, action, taskTitle = null) {
  // Guard: reject invalid / missing task IDs before any API call
  if (!taskId || taskId === 'undefined' || taskId === 'null') {
    console.warn('[Timer] handleTimerAction called with invalid taskId:', taskId);
    return false;
  }
  try {
    switch (action) {
      case 'start': {
        // Guard: already have active timer on a different task
        const existing = store.get('activeTimer');
        if (existing && existing.id && existing.task_id !== taskId) {
          showToast('Stop the current timer first', 'error');
          return false;
        }

        const log = await startTimer(taskId);
        currentTaskId       = taskId;
        timerStartedAt      = new Date(log.start_time).getTime();
        timerPausedDuration = 0;
        store.set('activeTimer', log);
        startClock({ id: taskId, title: taskTitle || log.task?.title || 'Task #' + taskId });
        _bindSidebarStop(taskId);
        showToast('Timer started ▶', 'success');
        _syncTimerButtons(taskId, true);
        break;
      }
      case 'pause': {
        await pauseTimer(taskId);
        clearInterval(timerInterval);
        timerInterval = null;
        showToast('Timer paused ⏸', 'info');
        _syncTimerButtons(taskId, false);
        break;
      }
      case 'resume': {
        const log = await resumeTimer(taskId);
        timerPausedDuration = (log.paused_duration || 0) * 1000;
        startClock({ id: taskId, title: taskTitle || 'Task #' + taskId });
        showToast('Timer resumed ▶', 'success');
        _syncTimerButtons(taskId, true);
        break;
      }
      case 'stop': {
        await stopTimer(taskId);
        stopClock();
        store.set('activeTimer', null);
        showToast('Timer stopped ■', 'success');
        _syncTimerButtons(taskId, false);
        break;
      }
    }
    return true;
  } catch (err) {
    showToast(err?.message || 'Timer action failed', 'error');
    return false;
  }
}

// ── Sync all timer buttons for a task ────────────────────────────────────────

function _syncTimerButtons(taskId, running) {
  const pauseIcon = `<svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
  const playIcon  = `<svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;

  // Kanban timer buttons
  document.querySelectorAll(`.kb-timer-btn[data-timer-task-id="${taskId}"]`).forEach(btn => {
    btn.classList.toggle('running', running);
    btn.innerHTML  = running ? pauseIcon : playIcon;
    btn.title      = running ? 'Timer running' : 'Start timer';
    btn.closest('.kb-card')?.classList.toggle('timing', running);
  });

  // Dashboard timer buttons
  document.querySelectorAll(`.dash-timer-btn[data-timer-task-id="${taskId}"]`).forEach(btn => {
    btn.textContent = running ? '⏸' : '▶';
    btn.classList.toggle('running', running);
    btn.title       = running ? 'Pause timer' : 'Start timer';
  });

  // Task list timer buttons
  document.querySelectorAll(`.task-timer-btn[data-timer-task-id="${taskId}"]`).forEach(btn => {
    btn.textContent = running ? '⏸' : '▶';
    btn.classList.toggle('running', running);
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatElapsed(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
