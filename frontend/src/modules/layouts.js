/**
 * Layout Engine — Different UI shells per layout theme
 * ────────────────────────────────────────────────────────
 * Each layout renders a completely different page shell:
 *   - default:  Left sidebar + topbar (Asana/ClickUp style)
 *   - topnav:   Horizontal top navigation, no sidebar (Notion style)
 *   - minimal:  Clean minimal, collapsed icon sidebar (Linear style)
 */

const NAV_ITEMS = [
  { page:'dashboard',  label:'Dashboard',    icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>' },
  { page:'my-tasks',   label:'My Tasks',     icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>', hasPill:true },
  { page:'projects',   label:'Projects',     icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>' },
  { page:'milestones', label:'Milestones',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>' },
  { page:'goals',      label:'Goals',        icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>' },
  { page:'dependencies',label:'Dependencies', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"/><path stroke-linecap="round" stroke-linejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101"/></svg>' },
  { page:'calendar',   label:'Calendar',     icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path stroke-linecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>' },
  { page:'reports',    label:'Reports',      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>' },
  { page:'chat',       label:'Chat',         icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>' },
  { page:'work-sessions', label:'Work Log',  icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 6v6l4 2"/></svg>' },
  { page:'meetings',   label:'Meetings',     icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>' },
  { page:'schedule',   label:'Schedule',     icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path stroke-linecap="round" d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>' },
  { page:'profile',    label:'My Profile',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>' },
  { page:'admin',      label:'User Mgmt',    icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>' },
];

const LOGO = `<svg width="16" height="16" viewBox="0 0 30 30" fill="none"><path d="M8 15l5.5 5.5L22 9" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const TOPBAR_RIGHT = `
  <div class="topbar-search">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/></svg>
    <input id="global-search" type="search" placeholder="Search tasks, projects…"/>
  </div>
  <button class="topbar-btn pom-topbar-btn" id="pomodoro-btn" title="Pomodoro Timer"><span>🍅</span><span class="pom-topbar-clock hidden" id="pom-topbar-clock">50:00</span></button>
  <button class="btn btn-ghost btn-sm ai-task-btn" id="ai-task-btn" title="Create task with AI"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg> ✨ AI Task</button>
  <button class="btn btn-primary btn-sm" id="create-task-btn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg> New Task</button>
  <button class="topbar-btn" id="notif-btn" title="Notifications"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg><span class="notif-dot hidden" id="notif-dot"></span></button>`;

const THEME_PANEL = `
  <div id="theme-panel" class="theme-panel hidden">
    <div class="theme-panel-title">Accent Colour</div>
    <div class="theme-swatch-row">
      <div class="theme-swatch active" data-theme="" style="background:#6366f1" title="Violet"></div>
      <div class="theme-swatch" data-theme="rose" style="background:#e11d48" title="Rose"></div>
      <div class="theme-swatch" data-theme="emerald" style="background:#059669" title="Emerald"></div>
      <div class="theme-swatch" data-theme="sky" style="background:#0284c7" title="Sky"></div>
      <div class="theme-swatch" data-theme="amber" style="background:#d97706" title="Amber"></div>
      <div class="theme-swatch" data-theme="slate" style="background:#475569" title="Slate"></div>
      <div class="theme-swatch" data-theme="teal" style="background:#0d9488" title="Teal"></div>
      <div class="theme-swatch" data-theme="pink" style="background:#d946ef" title="Pink"></div>
      <div class="theme-swatch" data-theme="crimson" style="background:#dc2626" title="Crimson"></div>
    </div>
    <div class="theme-section-label">Mode</div>
    <div class="theme-mode-row">
      <button class="theme-mode-btn active" data-mode="light">☀ Light</button>
      <button class="theme-mode-btn" data-mode="dark">🌙 Dark</button>
    </div>
  </div>`;

export function getLayout() {
  return 'default';
}

export function setLayout(layout) {
  // Sidebar layout is the only supported layout
}

/**
 * Render the shell for the given layout into #main-view
 */
export function renderShell(layout) {
  const mainView = document.getElementById('main-view');
  mainView.innerHTML = shellDefault();
  mainView.dataset.layout = 'default';
}

// ═══════════════════════════════════════════════════════════
// LAYOUT 1: DEFAULT — Left sidebar + Topbar (Asana/ClickUp)
// ═══════════════════════════════════════════════════════════
function shellDefault() {
  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand"><div class="logo-box">${LOGO}</div> Vilva</div>
      <nav class="sidebar-nav">
        <div class="nav-section-label">Overview</div>
        ${navLink('dashboard')}${navLink('my-tasks')}
        <div class="sidebar-divider"></div>
        <div class="nav-section-label">Work</div>
        ${navLink('projects')}${navLink('milestones')}${navLink('goals')}${navLink('dependencies')}${navLink('calendar')}${navLink('reports')}
        <div class="sidebar-divider"></div>
        <div class="nav-section-label">Collaborate</div>
        ${navLink('chat')}${navLink('meetings')}${navLink('work-sessions')}${navLink('schedule')}
        <div class="sidebar-divider"></div>
        <div class="nav-section-label">Account</div>
        ${navLink('profile')}${navLink('admin')}
      </nav>
      <div id="sidebar-work-status" class="sidebar-work-status hidden"></div>
      <div id="sidebar-timer" class="sidebar-timer hidden">
        <div class="sidebar-timer-label">Timer Running</div>
        <div class="sidebar-timer-name" id="sidebar-timer-name">—</div>
        <div class="sidebar-timer-clock" id="sidebar-timer-clock">00:00:00</div>
        <button class="sidebar-timer-stop" id="sidebar-stop-btn">■ Stop Timer</button>
      </div>
      <div class="sidebar-footer">
        <div class="sidebar-user" id="sidebar-user" title="Profile" style="cursor:pointer">
          <img id="sidebar-avatar" src="" alt=""/>
          <div class="sidebar-user-info"><span class="sidebar-user-name" id="sidebar-name">Loading…</span><span class="sidebar-user-role" id="sidebar-role">Member</span></div>
        </div>
        <div style="position:relative">
          <button class="sidebar-theme-btn" id="theme-picker-btn" title="Theme">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 2a10 10 0 010 20c-2.5 0-4-1.5-4-3.5 0-1 .5-2 .5-3S8 13 8 12c0-2.2 1.8-4 4-4s4 1.8 4 4"/></svg>
          </button>
          ${THEME_PANEL}
        </div>
        <button class="sidebar-logout" id="logout-btn" title="Sign out"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></button>
      </div>
    </aside>
    <div class="main-content">
      <header class="topbar">
        <div class="topbar-left"><span class="topbar-title" id="page-title">Dashboard</span></div>
        <div class="topbar-right">${TOPBAR_RIGHT}</div>
      </header>
      <div class="page-wrap" id="page-wrap"></div>
    </div>`;
}


// ── Helpers ───────────────────────────────────────────────
function navLink(page) {
  const n = NAV_ITEMS.find(i => i.page === page);
  if (!n) return '';
  const classes = ['nav-link'];
  if (n.page === 'dashboard') classes.push('active');
  if (n.admin) classes.push('hidden');
  return `<a href="#/${n.page}" class="${classes.join(' ')}" data-page="${n.page}" ${n.admin ? 'id="nav-admin"' : ''}>
    ${n.icon} ${n.label}
    ${n.hasPill ? `<span class="nav-pill hidden" id="my-tasks-count">0</span>` : ''}
  </a>`;
}
