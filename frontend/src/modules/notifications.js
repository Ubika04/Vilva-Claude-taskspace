/**
 * Notifications Module — Poll unread + render panel
 * During Deep Work (Pomodoro), browser push alerts are paused.
 * The dot still updates but no Notification API popups fire.
 */

import { getUnread, markRead, markAllRead } from '@api/notifications.js';
import { store } from '@store/store.js';

let pollInterval  = null;
let lastSeenCount = 0;

export async function initNotifications() {
  await refreshUnread();

  // Poll every 30 seconds (replace with WebSocket in production)
  pollInterval = setInterval(refreshUnread, 30_000);
}

export async function refreshUnread() {
  try {
    const res   = await getUnread();
    const count = res.count || 0;

    // Update notification dot indicator in topbar
    const dot = document.getElementById('notif-dot');
    if (dot) {
      if (count > 0) dot.classList.remove('hidden');
      else dot.classList.add('hidden');
    }

    // Show browser push notification for NEW notifications
    // Only if notifications are NOT paused (i.e. not in Pomodoro Deep Work)
    const paused = store.get('notificationsPaused');
    if (!paused && count > lastSeenCount && 'Notification' in window && Notification.permission === 'granted') {
      const newN = (res.data || []).slice(0, count - lastSeenCount);
      newN.forEach(n => {
        const data = typeof n.data === 'string' ? JSON.parse(n.data) : n.data;
        new Notification('Vilva Taskspace', {
          body: data.message || 'You have a new notification',
          icon: '/favicon.ico',
        });
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
    list.innerHTML = '<p style="padding:20px;text-align:center;color:#94a3b8;font-size:13px">No unread notifications</p>';
    return;
  }

  list.innerHTML = notifications.map(n => {
    const data = typeof n.data === 'string' ? JSON.parse(n.data) : n.data;
    return `
      <div class="notif-item ${n.read_at ? '' : 'unread'}" data-id="${n.id}">
        <div class="notif-icon">${getNotifIcon(data.type)}</div>
        <div class="notif-content">
          <p class="notif-message">${data.message || ''}</p>
          <span class="notif-time">${timeAgo(n.created_at)}</span>
        </div>
      </div>`;
  }).join('');

  list.querySelectorAll('.notif-item').forEach(item => {
    item.addEventListener('click', async () => {
      if (!item.classList.contains('unread')) return;
      await markRead(item.dataset.id);
      item.classList.remove('unread');
      await refreshUnread();
    });
  });
}

function getNotifIcon(type) {
  const icons = {
    task_assigned:      '📋',
    task_status_changed:'🔄',
    user_mentioned:     '@',
    deadline_approaching:'⚠️',
    comment_added:      '💬',
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
