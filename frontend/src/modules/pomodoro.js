/**
 * Pomodoro Module
 * ─────────────────────────────────────────────────────────────────
 * 50 min work / 10 min short break / 20 min long break (after 4 sessions)
 * When work session starts:
 *   • User status auto-set to "deep_work"
 *   • Desktop notifications paused (store flag)
 * When session ends:
 *   • Desktop Notification API popup fires
 *   • Status resets to previous
 *   • Notifications resume
 */

import { store }     from '@store/store.js';
import { showToast } from '@components/toast.js';
import { setStatus, STATUS_OPTIONS } from './status.js';

// ── Config ──────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  work:        50,   // minutes — Standard Pomodoro
  shortBreak:  10,   // 10 min break after each session
  longBreak:   20,   // 20 min break after 4 sessions
  longAfter:   4,    // sessions before long break
};

// ── State ───────────────────────────────────────────────────────────────────

let config   = loadConfig();
let phase    = 'work';     // 'work' | 'short' | 'long'
let remaining = config.work * 60;  // seconds
let running  = false;
let interval = null;
let session  = 0;          // completed work sessions
let statusBeforePomodoro = null;

// ── Init / Toggle ────────────────────────────────────────────────────────────

export function initPomodoro() {
  renderPanel();
  requestNotificationPermission();
}

export function togglePomodoroPanel() {
  const panel = document.getElementById('pomodoro-panel');
  if (!panel) return;
  const isHidden = panel.classList.contains('hidden');
  panel.classList.toggle('hidden', !isHidden);
  if (!isHidden) return; // closing
  // Bring back focus — panel opened
  updateDisplay();
}

// ── Panel Render ─────────────────────────────────────────────────────────────

function renderPanel() {
  // Remove old if exists
  document.getElementById('pomodoro-panel')?.remove();

  const panel = document.createElement('div');
  panel.id = 'pomodoro-panel';
  panel.className = 'pomodoro-panel hidden';
  panel.innerHTML = `
    <div class="pom-header">
      <div class="pom-title">
        <span class="pom-tomato">🍅</span>
        <span>Pomodoro</span>
      </div>
      <button class="pom-close" id="pom-close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Phase tabs -->
    <div class="pom-phases">
      <button class="pom-phase-btn active" data-phase="work">Focus</button>
      <button class="pom-phase-btn" data-phase="short">Short Break</button>
      <button class="pom-phase-btn" data-phase="long">Long Break</button>
    </div>

    <!-- Ring + time -->
    <div class="pom-ring-wrap">
      <svg class="pom-ring-svg" viewBox="0 0 160 160">
        <circle class="pom-ring-bg" cx="80" cy="80" r="68"/>
        <circle class="pom-ring-progress" id="pom-ring" cx="80" cy="80" r="68"
          transform="rotate(-90 80 80)"/>
      </svg>
      <div class="pom-time-center">
        <div class="pom-time-display" id="pom-time">50:00</div>
        <div class="pom-phase-label" id="pom-phase-label">Focus Time</div>
      </div>
    </div>

    <!-- Session dots -->
    <div class="pom-sessions" id="pom-sessions"></div>

    <!-- Controls -->
    <div class="pom-controls">
      <button class="pom-btn-secondary" id="pom-reset" title="Reset">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
      </button>
      <button class="pom-btn-primary" id="pom-start">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" id="pom-play-icon"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span id="pom-start-label">Start</span>
      </button>
      <button class="pom-btn-secondary" id="pom-skip" title="Skip">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
        </svg>
      </button>
    </div>

    <!-- Presets -->
    <div class="pom-presets">
      <button class="pom-preset-btn ${config.work===50?'active':''}" data-preset="pomodoro" title="50 min work / 10 min break">🍅 Standard (50/10)</button>
      <button class="pom-preset-btn ${config.work===25?'active':''}" data-preset="deep" title="25 min deep work / 5 min break">🧠 Deep Work (25/5)</button>
    </div>

    <!-- Settings -->
    <details class="pom-settings">
      <summary>Settings</summary>
      <div class="pom-settings-body">
        <div class="pom-setting-row">
          <label>Focus (min)</label>
          <input type="number" id="pom-cfg-work" class="pom-cfg-input" value="${config.work}" min="1" max="120"/>
        </div>
        <div class="pom-setting-row">
          <label>Short break (min)</label>
          <input type="number" id="pom-cfg-short" class="pom-cfg-input" value="${config.shortBreak}" min="1" max="60"/>
        </div>
        <div class="pom-setting-row">
          <label>Long break (min)</label>
          <input type="number" id="pom-cfg-long" class="pom-cfg-input" value="${config.longBreak}" min="1" max="60"/>
        </div>
        <button class="btn btn-primary btn-sm" id="pom-save-cfg" style="width:100%;margin-top:8px">Save</button>
      </div>
    </details>`;

  document.getElementById('app').appendChild(panel);
  bindPanelEvents(panel);
  updateDisplay();
}

// ── Event Binding ────────────────────────────────────────────────────────────

function bindPanelEvents(panel) {
  // Close
  panel.querySelector('#pom-close').addEventListener('click', () => {
    panel.classList.add('hidden');
  });

  // Phase tabs
  panel.querySelectorAll('.pom-phase-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (running) return; // can't switch while running
      switchPhase(btn.dataset.phase);
      panel.querySelectorAll('.pom-phase-btn').forEach(b => b.classList.toggle('active', b === btn));
    });
  });

  // Start / Pause
  panel.querySelector('#pom-start').addEventListener('click', () => {
    running ? pausePomodoro() : startPomodoro();
  });

  // Reset
  panel.querySelector('#pom-reset').addEventListener('click', () => {
    resetPomodoro();
  });

  // Skip
  panel.querySelector('#pom-skip').addEventListener('click', () => {
    advancePhase();
  });

  // Presets
  panel.querySelectorAll('.pom-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (running) return;
      const presets = {
        pomodoro: { work: 50, shortBreak: 10, longBreak: 20 },  // Standard: 50 min work, 10 min break
        deep:     { work: 25, shortBreak: 5,  longBreak: 15 },  // Deep Work: 25 min work, 5 min break
      };
      const p = presets[btn.dataset.preset];
      if (!p) return;
      config = { ...config, ...p };
      saveConfig(config);
      remaining = phaseSeconds(phase);
      updateDisplay();
      // Update input fields
      const wEl = panel.querySelector('#pom-cfg-work');
      const sEl = panel.querySelector('#pom-cfg-short');
      const lEl = panel.querySelector('#pom-cfg-long');
      if (wEl) wEl.value = p.work;
      if (sEl) sEl.value = p.shortBreak;
      if (lEl) lEl.value = p.longBreak;
      panel.querySelectorAll('.pom-preset-btn').forEach(b => b.classList.toggle('active', b === btn));
      showToast(`${btn.textContent.trim()} preset applied`, 'success');
    });
  });

  // Save settings
  panel.querySelector('#pom-save-cfg').addEventListener('click', () => {
    const w = parseInt(panel.querySelector('#pom-cfg-work').value)  || DEFAULT_CONFIG.work;
    const s = parseInt(panel.querySelector('#pom-cfg-short').value) || DEFAULT_CONFIG.shortBreak;
    const l = parseInt(panel.querySelector('#pom-cfg-long').value)  || DEFAULT_CONFIG.longBreak;
    config = { ...config, work: w, shortBreak: s, longBreak: l };
    saveConfig(config);
    if (!running) {
      remaining = phaseSeconds(phase);
      updateDisplay();
    }
    showToast('Pomodoro settings saved', 'success');
  });
}

// ── Timer Logic ───────────────────────────────────────────────────────────────

function startPomodoro() {
  running = true;

  // If starting a work session, set Deep Work status and pause notifications
  if (phase === 'work') {
    statusBeforePomodoro = store.get('userStatus') || 'available';
    setStatus('deep_work', true); // silent = true (no toast)
    store.set('notificationsPaused', true);
    updatePomodoroIndicator(true);
  }

  interval = setInterval(tick, 1000);
  updateStartBtn();
  updateDisplay();
}

function pausePomodoro() {
  running = false;
  clearInterval(interval);
  interval = null;
  updateStartBtn();

  if (phase === 'work') {
    store.set('notificationsPaused', false);
    updatePomodoroIndicator(false);
  }
}

function resetPomodoro() {
  pausePomodoro();
  remaining = phaseSeconds(phase);
  updateDisplay();
}

function tick() {
  remaining--;
  updateDisplay();
  updateTopbarClock();

  if (remaining <= 0) {
    sessionComplete();
  }
}

function sessionComplete() {
  clearInterval(interval);
  interval  = null;
  running   = false;

  // Notify
  const msg = phase === 'work'
    ? `🎉 Focus session complete! Time for a break.`
    : `⚡ Break over! Ready to focus?`;

  showBrowserNotification(
    phase === 'work' ? '🍅 Pomodoro Complete!' : '☕ Break Complete!',
    msg
  );
  showToast(msg, 'success');

  if (phase === 'work') {
    session++;
    store.set('notificationsPaused', false);
    updatePomodoroIndicator(false);
    // Restore previous status
    if (statusBeforePomodoro && statusBeforePomodoro !== 'deep_work') {
      setStatus(statusBeforePomodoro, true);
    }
  }

  advancePhase();
  updateSessionDots();
  updateStartBtn();
}

function advancePhase() {
  pausePomodoro();
  if (phase === 'work') {
    phase = (session > 0 && session % config.longAfter === 0) ? 'long' : 'short';
  } else {
    phase = 'work';
  }
  remaining = phaseSeconds(phase);

  // Sync phase tab UI
  const panel = document.getElementById('pomodoro-panel');
  if (panel) {
    panel.querySelectorAll('.pom-phase-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.phase === phase)
    );
  }

  updateDisplay();
}

function switchPhase(p) {
  phase     = p;
  remaining = phaseSeconds(p);
  updateDisplay();
}

// ── Display ───────────────────────────────────────────────────────────────────

function updateDisplay() {
  const panel = document.getElementById('pomodoro-panel');
  if (!panel) return;

  const total = phaseSeconds(phase);
  const pct   = remaining / total;
  const circ  = 2 * Math.PI * 68;

  // Ring
  const ring = panel.querySelector('#pom-ring');
  if (ring) {
    ring.style.strokeDasharray  = circ;
    ring.style.strokeDashoffset = circ * (1 - pct);
    ring.style.stroke = phaseColor(phase);
  }

  // Time
  const timeEl = panel.querySelector('#pom-time');
  if (timeEl) timeEl.textContent = formatMins(remaining);

  // Phase label
  const labelEl = panel.querySelector('#pom-phase-label');
  if (labelEl) labelEl.textContent = phaseLabel(phase);

  // Sessions
  updateSessionDots();
}

function updateSessionDots() {
  const el = document.getElementById('pom-sessions');
  if (!el) return;
  const dots = Array.from({ length: config.longAfter }, (_, i) =>
    `<span class="pom-session-dot ${i < (session % config.longAfter) ? 'filled' : ''}"></span>`
  ).join('');
  el.innerHTML = dots;
}

function updateStartBtn() {
  const btn   = document.getElementById('pom-start');
  const label = document.getElementById('pom-start-label');
  const icon  = document.getElementById('pom-play-icon');
  if (!btn) return;

  if (running) {
    label.textContent = 'Pause';
    btn.classList.add('paused');
    icon.innerHTML = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
  } else {
    label.textContent = 'Start';
    btn.classList.remove('paused');
    icon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
  }
}

function updateTopbarClock() {
  const clockEl = document.getElementById('pom-topbar-clock');
  if (clockEl) {
    clockEl.textContent = formatMins(remaining);
    clockEl.classList.toggle('hidden', !running);
  }
}

function updatePomodoroIndicator(active) {
  const btn = document.getElementById('pomodoro-btn');
  if (btn) btn.classList.toggle('active', active);

  const clock = document.getElementById('pom-topbar-clock');
  if (clock) clock.classList.toggle('hidden', !active);
}

// ── Browser Notifications ─────────────────────────────────────────────────────

async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

function showBrowserNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function phaseSeconds(p) {
  const mins = { work: config.work, short: config.shortBreak, long: config.longBreak };
  return (mins[p] || config.work) * 60;
}

function phaseColor(p) {
  return { work: '#6366f1', short: '#16a34a', long: '#0ea5e9' }[p] || '#6366f1';
}

function phaseLabel(p) {
  return { work: 'Focus Time', short: 'Short Break', long: 'Long Break' }[p] || 'Focus';
}

function formatMins(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function loadConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem('vilva_pom_config') || '{}');
    return { ...DEFAULT_CONFIG, ...saved };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(cfg) {
  localStorage.setItem('vilva_pom_config', JSON.stringify(cfg));
}
