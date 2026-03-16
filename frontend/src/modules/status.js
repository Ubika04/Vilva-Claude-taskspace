/**
 * User Status Module
 * ─────────────────────────────────────────────────────────────────
 * Statuses: available | collaboration | meeting | deep_work | busy | off
 * Stored in localStorage + reactive store.
 * Renders a status dot + picker in the sidebar footer.
 */

import { store }     from '@store/store.js';
import { showToast } from '@components/toast.js';

export const STATUS_OPTIONS = [
  { key: 'available',      label: 'Available',               icon: '🟢', color: '#16a34a', desc: 'Open for anything' },
  { key: 'collaboration',  label: 'Available for Collaboration', icon: '🤝', color: '#2563eb', desc: 'Collaborating' },
  { key: 'meeting',        label: 'In Meeting',              icon: '📅', color: '#f59e0b', desc: 'In a meeting' },
  { key: 'deep_work',      label: 'Deep Work',               icon: '🧠', color: '#6366f1', desc: 'Focus mode on' },
  { key: 'busy',           label: 'Busy',                    icon: '🔴', color: '#dc2626', desc: 'Not available' },
  { key: 'off',            label: 'Off',                     icon: '⚫', color: '#94a3b8', desc: 'Offline' },
];

// ── Init ──────────────────────────────────────────────────────────────────────

export function initStatus() {
  const saved = localStorage.getItem('vilva_user_status') || 'available';
  store.set('userStatus', saved);
  renderStatusWidget();
}

// ── Set Status ────────────────────────────────────────────────────────────────

export function setStatus(key, silent = false) {
  const opt = STATUS_OPTIONS.find(s => s.key === key);
  if (!opt) return;

  localStorage.setItem('vilva_user_status', key);
  store.set('userStatus', key);
  updateStatusUI(opt);

  if (!silent) {
    showToast(`Status: ${opt.label}`, 'info', 2000);
  }
}

// ── Render Widget ─────────────────────────────────────────────────────────────

function renderStatusWidget() {
  const footer = document.querySelector('.sidebar-footer');
  if (!footer) return;

  // Remove existing
  document.getElementById('status-widget')?.remove();

  const current = STATUS_OPTIONS.find(s => s.key === (store.get('userStatus') || 'available'))
    || STATUS_OPTIONS[0];

  const widget = document.createElement('div');
  widget.id = 'status-widget';
  widget.className = 'status-widget';
  widget.innerHTML = `
    <button class="status-trigger" id="status-trigger" title="Set your status">
      <span class="status-dot" id="status-dot" style="background:${current.color}"></span>
      <span class="status-label" id="status-label">${current.label}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left:auto;opacity:.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>
    <div class="status-dropdown hidden" id="status-dropdown">
      ${STATUS_OPTIONS.map(s => `
        <button class="status-option ${s.key === current.key ? 'active' : ''}" data-status="${s.key}">
          <span class="status-opt-dot" style="background:${s.color}"></span>
          <div class="status-opt-info">
            <span class="status-opt-label">${s.icon} ${s.label}</span>
            <span class="status-opt-desc">${s.desc}</span>
          </div>
          ${s.key === current.key ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${s.color}" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>` : ''}
        </button>`).join('')}
    </div>`;

  // Insert before footer's first child
  footer.insertBefore(widget, footer.firstChild);

  // Toggle dropdown
  widget.querySelector('#status-trigger').addEventListener('click', e => {
    e.stopPropagation();
    widget.querySelector('#status-dropdown').classList.toggle('hidden');
  });

  // Pick status
  widget.querySelectorAll('.status-option').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      setStatus(btn.dataset.status);
      widget.querySelector('#status-dropdown').classList.add('hidden');
    });
  });

  // Close on outside click
  document.addEventListener('click', () => {
    widget.querySelector('#status-dropdown')?.classList.add('hidden');
  });
}

// ── Update UI ─────────────────────────────────────────────────────────────────

function updateStatusUI(opt) {
  const dot   = document.getElementById('status-dot');
  const label = document.getElementById('status-label');
  const dd    = document.getElementById('status-dropdown');

  if (dot)   dot.style.background = opt.color;
  if (label) label.textContent    = opt.label;

  // Mark active in dropdown
  if (dd) {
    dd.querySelectorAll('.status-option').forEach(btn => {
      const isActive = btn.dataset.status === opt.key;
      btn.classList.toggle('active', isActive);
      // Update checkmark
      const existing = btn.querySelector('svg');
      if (isActive && !existing) {
        btn.insertAdjacentHTML('beforeend',
          `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${opt.color}" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`);
      } else if (!isActive && existing) {
        existing.remove();
      }
    });
  }

  // Update sidebar role text with current status icon if in deep_work
  const roleEl = document.getElementById('sidebar-role');
  if (roleEl) {
    const user     = store.get('user');
    const roleName = user?.role || user?.roles?.[0]?.name || 'Member';
    roleEl.textContent = opt.key === 'deep_work'
      ? `🧠 Focus Mode`
      : opt.key === 'meeting'
        ? `📅 In Meeting`
        : roleName;
  }
}
