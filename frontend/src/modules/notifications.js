/**
 * Vilva Taskspace — Enhanced Notifications Module
 * Poll unread + render panel + notification preferences + grouped view + actions.
 * During Deep Work (Pomodoro), browser push alerts are paused.
 */

import { getUnread, markRead, markAllRead } from '@api/notifications.js';
import { store } from '@store/store.js';
import { api } from '@api/apiClient.js';

let pollInterval  = null;
let lastSeenCount = 0;

export async function initNotifications() {
  await refreshUnread();

  // Request browser notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // Poll every 15 seconds
  pollInterval = setInterval(refreshUnread, 15_000);
}

export async function refreshUnread() {
  try {
    const res   = await getUnread();
    const count = res.count || 0;

    // Update notification dot indicator in topbar
    const dot = document.getElementById('notif-dot');
    if (dot) {
      if (count > 0) {
        dot.classList.remove('hidden');
        dot.textContent = count > 99 ? '99+' : count;
      } else {
        dot.classList.add('hidden');
      }
    }

    // Show browser push notification for NEW notifications
    const paused = store.get('notificationsPaused');
    if (!paused && count > lastSeenCount && 'Notification' in window && Notification.permission === 'granted') {
      const newN = (res.data || []).slice(0, count - lastSeenCount);
      newN.forEach(n => {
        const data = typeof n.data === 'string' ? JSON.parse(n.data) : n.data;
        const notif = new Notification('Vilva Taskspace', {
          body: data.message || 'You have a new notification',
          icon: '/favicon.ico',
          tag: n.id,
        });
        notif.onclick = () => {
          window.focus();
          if (data.action_url) location.hash = data.action_url;
          notif.close();
        };
      });
    }
    lastSeenCount = count;

    renderNotifList(res.data || []);
  } catch (err) {
    // Silent fail for polling
  }
}

function renderNotifList(notifications) {
  const list = document.getElementById('notif-list');
  if (!list) return;

  if (notifications.length === 0) {
    list.innerHTML = '<p class="notif-empty">No unread notifications</p>';
    return;
  }

  // Group by type
  const grouped = {};
  notifications.forEach(n => {
    const data = typeof n.data === 'string' ? JSON.parse(n.data) : n.data;
    const type = data.type || 'other';
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push({ ...n, _data: data });
  });

  let html = `<div class="notif-tabs">
    <button class="notif-tab active" data-filter="all">All (${notifications.length})</button>
    ${Object.entries(grouped).map(([type, items]) =>
      `<button class="notif-tab" data-filter="${type}">${getNotifIcon(type)} ${items.length}</button>`
    ).join('')}
  </div>`;

  html += '<div class="notif-items">';
  html += notifications.map(n => {
    const data = typeof n.data === 'string' ? JSON.parse(n.data) : n.data;
    const typeClass = data.type || 'other';

    return `
      <div class="notif-item ${n.read_at ? '' : 'unread'}" data-id="${n.id}" data-type="${typeClass}">
        <div class="notif-icon-wrap notif-icon-${typeClass}">${getNotifIcon(data.type)}</div>
        <div class="notif-content">
          ${data.title ? `<p class="notif-title">${data.title}</p>` : ''}
          <p class="notif-message">${data.message || ''}</p>
          ${data.preview ? `<p class="notif-preview">${truncate(data.preview, 80)}</p>` : ''}
          <div class="notif-meta">
            <span class="notif-time">${timeAgo(n.created_at)}</span>
            ${data.project_name ? `<span class="notif-project">${data.project_name}</span>` : ''}
            ${data.sender_name ? `<span class="notif-sender">from ${data.sender_name}</span>` : ''}
          </div>
        </div>
        <div class="notif-actions">
          ${!n.read_at ? `<button class="notif-action-btn notif-mark-read" data-id="${n.id}" title="Mark read">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
          </button>` : ''}
          <button class="notif-action-btn notif-dismiss" data-id="${n.id}" title="Dismiss">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>`;
  }).join('');
  html += '</div>';

  list.innerHTML = html;

  // Tab filtering
  list.querySelectorAll('.notif-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      list.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      list.querySelectorAll('.notif-item').forEach(item => {
        item.style.display = (filter === 'all' || item.dataset.type === filter) ? '' : 'none';
      });
    });
  });

  // Mark read
  list.querySelectorAll('.notif-mark-read').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await markRead(btn.dataset.id);
      const item = btn.closest('.notif-item');
      item.classList.remove('unread');
      btn.remove();
      await refreshUnread();
    });
  });

  // Dismiss
  list.querySelectorAll('.notif-dismiss').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        await api.delete(`/notifications/${btn.dataset.id}`);
        btn.closest('.notif-item')?.remove();
        await refreshUnread();
      } catch {}
    });
  });

  // Click to navigate
  list.querySelectorAll('.notif-item').forEach(item => {
    item.addEventListener('click', async () => {
      const data = notifications.find(n => n.id === item.dataset.id);
      const d = data ? (typeof data.data === 'string' ? JSON.parse(data.data) : data.data) : {};

      if (!item.classList.contains('unread')) return;
      await markRead(item.dataset.id);
      item.classList.remove('unread');

      // Navigate to relevant page
      if (d.action_url) location.hash = d.action_url;
      else if (d.type === 'chat_message' || d.type === 'chat_mention') location.hash = '/chat';
      else if (d.task_id) location.hash = `/tasks/${d.task_id}`;
      else if (d.project_id) location.hash = `/projects/${d.project_id}`;

      document.getElementById('notif-panel')?.classList.add('hidden');
      await refreshUnread();
    });
  });
}

function getNotifIcon(type) {
  const icons = {
    task_assigned:        '📋',
    task_status_changed:  '🔄',
    task_completed:       '✅',
    task_overdue:         '⏰',
    task_comment:         '💬',
    task_mention:         '@',
    user_mentioned:       '@',
    chat_message:         '💬',
    chat_mention:         '📢',
    review_requested:     '👁️',
    review_approved:      '✅',
    review_rejected:      '❌',
    project_member_added: '👥',
    project_member_removed:'👤',
    dependency_resolved:  '🔗',
    schedule_conflict:    '⚠️',
    work_session_reminder:'⏱️',
    deadline_approaching: '⚠️',
    comment_added:        '💬',
    custom:               '📣',
  };
  return icons[type] || '🔔';
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function truncate(str, len) {
  return str && str.length > len ? str.slice(0, len) + '...' : str || '';
}
