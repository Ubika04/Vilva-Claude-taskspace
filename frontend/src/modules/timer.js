/**
 * Timer Module — Start/Pause/Resume/Stop with live clock
 */

import { getActiveTimer, startTimer, pauseTimer, resumeTimer, stopTimer } from '@api/timer.js';
import { store } from '@store/store.js';
import { showToast } from '@components/toast.js';

let timerInterval = null;
let timerStartedAt = null;
let timerPausedDuration = 0;

export async function initTimer() {
  const active = await getActiveTimer();

  if (active) {
    store.set('activeTimer', active);
    timerStartedAt    = new Date(active.start_time).getTime();
    timerPausedDuration = active.paused_duration * 1000;
    startClock(active.task);
    updateTimerWidget(active.task);
  }
}

export function startClock(task) {
  clearInterval(timerInterval);

  const widget   = document.getElementById('sidebar-timer');
  const display  = document.getElementById('sidebar-timer-clock');
  const taskName = document.getElementById('sidebar-timer-name');

  if (widget) widget.classList.remove('hidden');
  if (taskName && task) taskName.textContent = task.title;

  timerInterval = setInterval(() => {
    const elapsed = Date.now() - timerStartedAt - timerPausedDuration;
    if (display) display.textContent = formatElapsed(elapsed);

    // Also update dashboard timer if visible
    const dashClock = document.getElementById('dash-timer-clock');
    if (dashClock) dashClock.textContent = formatElapsed(elapsed);
  }, 1000);
}

export function stopClock() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerStartedAt = null;

  const widget = document.getElementById('sidebar-timer');
  if (widget) widget.classList.add('hidden');
}

function updateTimerWidget(task) {
  const stopBtn = document.getElementById('sidebar-stop-btn');
  if (stopBtn && task) {
    stopBtn.dataset.taskId = task.id;
    stopBtn.addEventListener('click', async () => {
      await stopTimer(task.id);
      stopClock();
      store.set('activeTimer', null);
      showToast('Timer stopped', 'success');
    });
  }
}

/**
 * Called from task detail view.
 */
export async function handleTimerAction(taskId, action) {
  try {
    switch (action) {
      case 'start': {
        const log = await startTimer(taskId);
        timerStartedAt    = new Date(log.start_time).getTime();
        timerPausedDuration = 0;
        store.set('activeTimer', log);
        startClock({ id: taskId, title: 'Current Task' });
        showToast('Timer started', 'success');
        break;
      }
      case 'pause': {
        await pauseTimer(taskId);
        clearInterval(timerInterval);
        showToast('Timer paused', 'info');
        break;
      }
      case 'resume': {
        const log = await resumeTimer(taskId);
        timerPausedDuration = log.paused_duration * 1000;
        startClock({ id: taskId, title: 'Current Task' });
        showToast('Timer resumed', 'success');
        break;
      }
      case 'stop': {
        await stopTimer(taskId);
        stopClock();
        store.set('activeTimer', null);
        showToast('Timer stopped', 'success');
        break;
      }
    }
    return true;
  } catch (err) {
    showToast(err.message, 'error');
    return false;
  }
}

function formatElapsed(ms) {
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
