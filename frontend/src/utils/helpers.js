export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export function formatDuration(seconds) {
  if (!seconds) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function isOverdue(dateStr, status) {
  if (!dateStr || status === 'completed') return false;
  return new Date(dateStr) < new Date();
}

export function priorityBadge(priority) {
  const map = {
    low:    { label: 'Low',    color: '#64748b', bg: '#f1f5f9' },
    medium: { label: 'Medium', color: '#2563eb', bg: '#dbeafe' },
    high:   { label: 'High',   color: '#d97706', bg: '#fef3c7' },
    urgent: { label: 'Urgent', color: '#dc2626', bg: '#fee2e2' },
  };
  const p = map[priority] || map.medium;
  return `<span class="priority-badge" style="color:${p.color};border-color:${p.color}30;background:${p.bg}"><span class="priority-dot" style="background:${p.color}"></span>${p.label}</span>`;
}

export function statusPill(status) {
  const map = {
    backlog:     { label: 'Backlog',          color: '#64748b', bg: '#f1f5f9' },
    todo:        { label: 'To Do',            color: '#2563eb', bg: '#dbeafe' },
    in_progress: { label: 'In Progress',      color: '#d97706', bg: '#fef3c7' },
    working_on:  { label: 'Working On',       color: '#ef4444', bg: '#fee2e2' },
    review:      { label: 'Review / Testing', color: '#7c3aed', bg: '#ede9fe' },
    blocked:     { label: 'Blocked',          color: '#b45309', bg: '#fef3c7' },
    completed:   { label: 'Done',             color: '#16a34a', bg: '#dcfce7' },
  };
  const s = map[status] || map.backlog;
  return `<span class="status-pill" style="background:${s.bg};color:${s.color}">${s.label}</span>`;
}

export { statusPill as statusBadge };

export function debounce(fn, ms = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export function avatarUrl(user) {
  if (user?.avatar_url) return user.avatar_url;
  const name = encodeURIComponent(user?.name || '?');
  return `https://ui-avatars.com/api/?name=${name}&size=32&background=6366f1&color=fff&bold=true`;
}

export function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

