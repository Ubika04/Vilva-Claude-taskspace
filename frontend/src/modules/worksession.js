/**
 * Vilva Taskspace — Work Session Module
 * Employee clock-in/clock-out, break tracking, and work history.
 */

import { api } from '@api/apiClient.js';
import { store } from '@store/store.js';
import { showToast } from '@components/toast.js';

let tickInterval = null;

// ── Render Work Sessions Page ───────────────────────────────────────────────

export async function renderWorkSessions(container) {
  container.innerHTML = `
    <div class="ws-page">
      <div class="ws-top-row">
        <div class="ws-clock-card" id="ws-clock-card">
          <div class="spinner-wrap"><div class="spinner"></div></div>
        </div>
        <div class="ws-summary-card" id="ws-summary-card">
          <div class="spinner-wrap"><div class="spinner"></div></div>
        </div>
      </div>
      <div class="ws-team-section" id="ws-team-section"></div>
      <div class="ws-history-section">
        <div class="ws-history-head">
          <h3>Work History</h3>
          <div class="ws-history-filters">
            <input type="date" id="ws-from" class="form-input form-input-sm" />
            <input type="date" id="ws-to" class="form-input form-input-sm" />
            <button class="btn btn-sm btn-secondary" id="ws-filter-btn">Filter</button>
          </div>
        </div>
        <div id="ws-history-list">
          <div class="spinner-wrap"><div class="spinner"></div></div>
        </div>
      </div>
    </div>`;

  // Set default date range (last 7 days)
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  document.getElementById('ws-from').value = weekAgo.toISOString().split('T')[0];
  document.getElementById('ws-to').value = today.toISOString().split('T')[0];

  document.getElementById('ws-filter-btn').addEventListener('click', loadHistory);

  await Promise.all([loadActiveSession(), loadSummary(), loadHistory(), loadTeamSessions()]);
}

// ── Active Session / Clock Card ─────────────────────────────────────────────

async function loadActiveSession() {
  const card = document.getElementById('ws-clock-card');
  try {
    const res = await api.get('/work-sessions/active');
    const session = res.session;

    if (session) {
      store.set('workSession', session);
      renderActiveSession(card, session);
    } else {
      store.set('workSession', null);
      renderClockIn(card);
    }
  } catch (err) {
    card.innerHTML = '<p class="text-muted">Failed to load session</p>';
  }
}

function renderClockIn(card) {
  card.innerHTML = `
    <div class="ws-clock-idle">
      <div class="ws-clock-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path stroke-linecap="round" d="M12 6v6l4 2"/>
        </svg>
      </div>
      <h3>Not Clocked In</h3>
      <p class="text-muted">Start your work session to begin tracking time</p>
      <button class="btn btn-primary btn-lg" id="ws-clock-in-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3l14 9-14 9V3z"/></svg>
        Clock In
      </button>
    </div>`;

  document.getElementById('ws-clock-in-btn').addEventListener('click', async () => {
    try {
      const res = await api.post('/work-sessions/clock-in');
      showToast('Clocked in!', 'success');
      store.set('workSession', res.session);
      renderActiveSession(card, res.session);
      updateSidebarWorkStatus(res.session);
    } catch (err) {
      showToast(err.message || 'Failed to clock in', 'error');
    }
  });
}

function renderActiveSession(card, session) {
  const isOnBreak = session.status === 'on_break';

  card.innerHTML = `
    <div class="ws-clock-active ${isOnBreak ? 'on-break' : ''}">
      <div class="ws-status-badge ${isOnBreak ? 'break' : 'active'}">
        ${isOnBreak ? 'On Break' : 'Working'}
      </div>
      <div class="ws-timer-display" id="ws-timer-display">
        ${formatDuration(session.elapsed_minutes || 0)}
      </div>
      <div class="ws-clock-info">
        <span>Clocked in: ${new Date(session.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        ${session.break_minutes > 0 ? `<span>Breaks: ${session.break_minutes}m</span>` : ''}
      </div>
      <div class="ws-clock-actions">
        ${isOnBreak
          ? `<button class="btn btn-secondary" id="ws-end-break-btn">End Break</button>`
          : `<button class="btn btn-secondary" id="ws-break-btn">Take Break</button>`
        }
        <button class="btn btn-danger" id="ws-clock-out-btn">Clock Out</button>
      </div>
      ${session.breaks?.length ? `
        <div class="ws-breaks-list">
          <h4>Breaks Today</h4>
          ${session.breaks.map(b => `
            <div class="ws-break-item">
              <span>${b.reason || 'Break'}</span>
              <span>${new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — ${b.end_time ? new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}</span>
              <span>${b.duration}m</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>`;

  // Start live timer
  startTick(session);

  // Break button
  if (isOnBreak) {
    document.getElementById('ws-end-break-btn')?.addEventListener('click', async () => {
      try {
        await api.post('/work-sessions/break/end');
        showToast('Break ended', 'success');
        loadActiveSession();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  } else {
    document.getElementById('ws-break-btn')?.addEventListener('click', async () => {
      const reason = prompt('Break reason (optional):', 'Lunch');
      try {
        await api.post('/work-sessions/break/start', { reason: reason || null });
        showToast('Break started', 'success');
        loadActiveSession();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Clock out
  document.getElementById('ws-clock-out-btn')?.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to clock out?')) return;
    try {
      const res = await api.post('/work-sessions/clock-out');
      showToast(`Clocked out! Total: ${formatDuration(res.session.total_minutes)}`, 'success');
      store.set('workSession', null);
      stopTick();
      renderClockIn(card);
      updateSidebarWorkStatus(null);
      loadSummary();
      loadHistory();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// ── Live Timer ──────────────────────────────────────────────────────────────

function startTick(session) {
  stopTick();
  const clockIn = new Date(session.clock_in).getTime();
  const breakMins = session.break_minutes || 0;

  tickInterval = setInterval(() => {
    const el = document.getElementById('ws-timer-display');
    if (!el) return stopTick();

    const now = Date.now();
    const elapsed = Math.floor((now - clockIn) / 60000) - breakMins;
    el.textContent = formatDuration(Math.max(0, elapsed));
  }, 1000);
}

function stopTick() {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

// ── Summary Card ────────────────────────────────────────────────────────────

async function loadSummary() {
  const card = document.getElementById('ws-summary-card');
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  try {
    const summary = await api.get('/work-sessions/summary', {
      from: weekAgo.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0],
    });

    card.innerHTML = `
      <h3>This Week</h3>
      <div class="ws-stats-grid">
        <div class="ws-stat">
          <span class="ws-stat-value">${summary.total_hours}h</span>
          <span class="ws-stat-label">Total Hours</span>
        </div>
        <div class="ws-stat">
          <span class="ws-stat-value">${summary.session_count}</span>
          <span class="ws-stat-label">Sessions</span>
        </div>
        <div class="ws-stat">
          <span class="ws-stat-value">${Math.round(summary.avg_session_min / 60 * 10) / 10}h</span>
          <span class="ws-stat-label">Avg Session</span>
        </div>
        <div class="ws-stat">
          <span class="ws-stat-value">${Math.round(summary.total_breaks / 60 * 10) / 10}h</span>
          <span class="ws-stat-label">Break Time</span>
        </div>
      </div>
      ${summary.daily?.length ? `
        <div class="ws-daily-chart">
          ${summary.daily.map(d => {
            const pct = summary.total_minutes > 0 ? Math.round(d.total_minutes / (8 * 60) * 100) : 0;
            return `
              <div class="ws-daily-bar-wrap">
                <div class="ws-daily-bar" style="height:${Math.min(pct, 100)}%"></div>
                <span class="ws-daily-label">${new Date(d.date).toLocaleDateString([], { weekday: 'short' })}</span>
                <span class="ws-daily-hours">${Math.round(d.total_minutes / 60 * 10) / 10}h</span>
              </div>`;
          }).join('')}
        </div>
      ` : ''}`;
  } catch {
    card.innerHTML = '<p class="text-muted">Could not load summary</p>';
  }
}

// ── Work History ────────────────────────────────────────────────────────────

async function loadHistory() {
  const listEl = document.getElementById('ws-history-list');
  const from = document.getElementById('ws-from')?.value;
  const to = document.getElementById('ws-to')?.value;

  try {
    const res = await api.get('/work-sessions/history', { from, to, per_page: 20 });
    const sessions = res.data || [];

    if (!sessions.length) {
      listEl.innerHTML = '<p class="text-muted" style="padding:16px">No work sessions in this period</p>';
      return;
    }

    listEl.innerHTML = `
      <table class="ws-history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Clock In</th>
            <th>Clock Out</th>
            <th>Breaks</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${sessions.map(s => `
            <tr>
              <td>${new Date(s.clock_in).toLocaleDateString()}</td>
              <td>${new Date(s.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
              <td>${s.clock_out ? new Date(s.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
              <td>${s.break_minutes || 0}m</td>
              <td><strong>${s.total_minutes ? formatDuration(s.total_minutes) : '—'}</strong></td>
              <td><span class="ws-status-pill ${s.status}">${s.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
  } catch {
    listEl.innerHTML = '<p class="text-muted">Failed to load history</p>';
  }
}

// ── Team Sessions ───────────────────────────────────────────────────────────

async function loadTeamSessions() {
  const section = document.getElementById('ws-team-section');
  try {
    const res = await api.get('/work-sessions/team');
    const sessions = res.sessions || [];

    if (!sessions.length) {
      section.innerHTML = '';
      return;
    }

    section.innerHTML = `
      <div class="ws-team-card">
        <h3>Team Activity <span class="ws-team-count">${sessions.length} online</span></h3>
        <div class="ws-team-list">
          ${sessions.map(s => `
            <div class="ws-team-member">
              <img src="${s.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.user?.name || '?')}&size=32&background=6366f1&color=fff`}" class="ws-team-avatar" />
              <div class="ws-team-info">
                <span class="ws-team-name">${s.user?.name || 'Unknown'}</span>
                <span class="ws-team-detail">${s.status === 'on_break' ? 'On Break' : formatDuration(s.elapsed_minutes)} worked</span>
              </div>
              <span class="ws-team-status-dot ${s.status}"></span>
            </div>
          `).join('')}
        </div>
      </div>`;
  } catch {
    section.innerHTML = '';
  }
}

// ── Sidebar Integration ─────────────────────────────────────────────────────

export function updateSidebarWorkStatus(session) {
  const el = document.getElementById('sidebar-work-status');
  if (!el) return;

  if (session) {
    el.classList.remove('hidden');
    el.innerHTML = `
      <span class="ws-sidebar-dot ${session.status}"></span>
      <span>${session.status === 'on_break' ? 'On Break' : 'Working'}</span>`;
  } else {
    el.classList.add('hidden');
  }
}

export async function initWorkSession() {
  try {
    const res = await api.get('/work-sessions/active');
    if (res.session) {
      store.set('workSession', res.session);
      updateSidebarWorkStatus(res.session);
    }
  } catch {}
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
