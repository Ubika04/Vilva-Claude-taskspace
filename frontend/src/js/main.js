/**
 * Vilva Taskspace — Main Entry Point
 * Bootstraps the SPA router and initializes all modules.
 */

import { store } from '@store/store.js';
import { router } from './router.js';
import { initAuth } from '@modules/auth.js';
import { initNotifications } from '@modules/notifications.js';
import { initTimer } from '@modules/timer.js';
import { initPomodoro, togglePomodoroPanel } from '@modules/pomodoro.js';
import { initStatus } from '@modules/status.js';
import { initWorkSession } from '@modules/worksession.js';
import { showToast } from '@components/toast.js';
import { getLayout, setLayout, renderShell } from '@modules/layouts.js';

// ─── Boot ──────────────────────────────────────────────────────────────────

async function boot() {
  const token = localStorage.getItem('vilva_token');

  if (token) {
    try {
      const { fetchCurrentUser } = await import('@api/auth.js');
      const user = await fetchCurrentUser();
      store.set('user', user);
      store.set('token', token);
      showMainView();
      router.navigate(location.hash.slice(1) || '/dashboard');
      initNotifications();
      initTimer();
      initPomodoro();
      initStatus();
      initWorkSession();
    } catch (err) {
      localStorage.removeItem('vilva_token');
      showAuthView();
    }
  } else {
    showAuthView();
  }
}

function showAuthView() {
  document.getElementById('auth-view').classList.remove('hidden');
  document.getElementById('main-view').classList.add('hidden');
  initAuth();
}

function showMainView() {
  document.getElementById('auth-view').classList.add('hidden');
  const mainView = document.getElementById('main-view');
  mainView.classList.remove('hidden');

  // Render the layout shell based on selected layout
  const layout = getLayout();
  renderShell(layout);
  mainView.classList.add('layout-' + layout);

  const user = store.get('user');
  if (user) {
    document.getElementById('sidebar-name').textContent = user.name;
    const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=32&background=6366f1&color=fff&bold=true`;
    document.getElementById('sidebar-avatar').src = avatarUrl;
    const roleEl = document.getElementById('sidebar-role');
    const roleName = user.role || (user.roles?.[0]?.name) || 'Member';
    if (roleEl) roleEl.textContent = roleName;

    // Show admin nav link for admin users
    const isAdmin = roleName.toLowerCase() === 'admin'
      || (user.roles || []).some(r => (r.name || r) === 'admin');
    if (isAdmin) {
      document.getElementById('nav-admin')?.classList.remove('hidden');
    }
  }

  // Sidebar user → profile page
  document.getElementById('sidebar-user').addEventListener('click', () => {
    router.navigate('/profile');
  });

  // Navigation — works for all layout types
  document.querySelectorAll('.nav-link, .tn-link, .mn-link').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-link, .tn-link, .mn-link').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      router.navigate('/' + item.dataset.page);
    });
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', async () => {
    const { logout } = await import('@api/auth.js');
    await logout();
    localStorage.removeItem('vilva_token');
    store.clear();
    showAuthView();
  });

  // Theme picker
  initThemePicker();

  // Global search
  initGlobalSearch();

  // Pomodoro toggle
  document.getElementById('pomodoro-btn')?.addEventListener('click', () => {
    togglePomodoroPanel();
  });

  // AI Task button
  document.getElementById('ai-task-btn')?.addEventListener('click', () => {
    openAiTaskModal();
  });

  // Global create task button
  document.getElementById('create-task-btn').addEventListener('click', async () => {
    const pageWrap = document.getElementById('page-wrap');
    const { openNewTaskModal } = await import('@modules/tasks.js');
    openNewTaskModal(pageWrap, null);
  });

  // Notifications toggle
  document.getElementById('notif-btn').addEventListener('click', () => {
    document.getElementById('notif-panel').classList.toggle('hidden');
  });

  document.getElementById('mark-all-read-btn').addEventListener('click', async () => {
    const { markAllRead } = await import('@api/notifications.js');
    await markAllRead();
    document.getElementById('notif-dot').classList.add('hidden');
    document.getElementById('notif-list').innerHTML = '<p style="padding:16px;color:#94a3b8;text-align:center;font-size:13px">No unread notifications</p>';
  });
}

// ── AI Task Modal ──────────────────────────────────────────────────────────

async function openAiTaskModal() {
  const { openModal, closeModal } = await import('@components/modal.js');

  openModal({
    title: '✨ Create Task with AI',
    body: `
      <div class="ai-modal-body">
        <p class="ai-modal-hint">Describe your task in natural language and AI will fill in the details for you.</p>
        <div class="ai-examples">
          <span class="ai-example-chip" data-ex="Fix the login bug on the dashboard, high priority, by this Friday">Fix login bug, high priority by Friday</span>
          <span class="ai-example-chip" data-ex="Write API documentation for the new endpoints, medium priority, takes about 3 hours">Write API docs, ~3 hours</span>
          <span class="ai-example-chip" data-ex="Review pull requests from the team, urgent, due today">Review PRs, urgent today</span>
        </div>
        <div class="form-group" style="margin-top:12px">
          <label class="form-label">Task Description</label>
          <textarea id="ai-prompt-input" class="form-input form-textarea" rows="3"
            placeholder="e.g. Fix the login bug on the dashboard by Friday, high priority…"
            style="resize:vertical"></textarea>
        </div>
        <div id="ai-result" class="ai-result hidden">
          <div class="ai-result-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            AI parsed your task
          </div>
          <div class="ai-result-fields" id="ai-result-fields"></div>
        </div>
        <div id="ai-error" class="ai-error hidden"></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px;padding-top:14px;border-top:1px solid #e2e8f0">
          <button type="button" class="btn btn-ghost" id="ai-cancel">Cancel</button>
          <button type="button" class="btn btn-secondary" id="ai-parse-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            Parse with AI
          </button>
          <button type="button" class="btn btn-primary hidden" id="ai-create-btn">
            Create Task →
          </button>
        </div>
      </div>`,
  });

  let parsedTask = null;

  // Example chips
  document.querySelectorAll('.ai-example-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.getElementById('ai-prompt-input').value = chip.dataset.ex;
    });
  });

  document.getElementById('ai-cancel').addEventListener('click', closeModal);

  // Parse button
  document.getElementById('ai-parse-btn').addEventListener('click', async () => {
    const prompt = document.getElementById('ai-prompt-input').value.trim();
    if (!prompt) return;

    const btn      = document.getElementById('ai-parse-btn');
    const errorEl  = document.getElementById('ai-error');
    const resultEl = document.getElementById('ai-result');

    btn.disabled = true;
    btn.textContent = 'Parsing…';
    errorEl.classList.add('hidden');
    resultEl.classList.add('hidden');

    try {
      const { api } = await import('@api/apiClient.js');
      parsedTask = await api.post('/ai/parse-task', { prompt });

      // Show parsed fields preview
      const fieldsEl = document.getElementById('ai-result-fields');
      const priorityColors = { low:'#64748b', medium:'#2563eb', high:'#d97706', urgent:'#dc2626' };
      fieldsEl.innerHTML = `
        <div class="ai-field"><span class="ai-field-label">Title</span><span class="ai-field-val">${parsedTask.title}</span></div>
        ${parsedTask.description ? `<div class="ai-field"><span class="ai-field-label">Description</span><span class="ai-field-val">${parsedTask.description}</span></div>` : ''}
        <div class="ai-field">
          <span class="ai-field-label">Priority</span>
          <span class="ai-field-val" style="color:${priorityColors[parsedTask.priority]||'#64748b'};font-weight:700;text-transform:capitalize">${parsedTask.priority}</span>
        </div>
        <div class="ai-field"><span class="ai-field-label">Status</span><span class="ai-field-val" style="text-transform:capitalize">${parsedTask.status?.replace('_',' ')}</span></div>
        ${parsedTask.due_date ? `<div class="ai-field"><span class="ai-field-label">Due Date</span><span class="ai-field-val">📅 ${parsedTask.due_date}</span></div>` : ''}
        ${parsedTask.estimated_minutes ? `<div class="ai-field"><span class="ai-field-label">Estimate</span><span class="ai-field-val">⏱ ${Math.round(parsedTask.estimated_minutes/60*10)/10}h</span></div>` : ''}`;

      resultEl.classList.remove('hidden');
      document.getElementById('ai-create-btn').classList.remove('hidden');
    } catch (err) {
      errorEl.textContent  = err?.message || 'Failed to parse task. Check your ANTHROPIC_API_KEY.';
      errorEl.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Parse with AI';
    }
  });

  // Create task with parsed data
  document.getElementById('ai-create-btn').addEventListener('click', async () => {
    if (!parsedTask) return;
    closeModal();
    await new Promise(r => setTimeout(r, 100)); // let modal close
    const pageWrap = document.getElementById('page-wrap');
    const { openNewTaskModal } = await import('@modules/tasks.js');
    openNewTaskModal(pageWrap, null, parsedTask);
  });
}

// ── Theme Picker ───────────────────────────────────────────────────────────

const THEMES = ['', 'rose', 'emerald', 'sky', 'amber', 'slate', 'teal', 'pink', 'crimson'];

function applyTheme(theme, mode) {
  THEMES.forEach(t => { if (t) document.body.classList.remove('theme-' + t); });
  document.body.classList.remove('dark');
  if (theme) document.body.classList.add('theme-' + theme);
  if (mode === 'dark') document.body.classList.add('dark');
}

function initThemePicker() {
  const btn   = document.getElementById('theme-picker-btn');
  const panel = document.getElementById('theme-panel');
  if (!btn || !panel) return;

  const savedTheme = localStorage.getItem('vilva_theme') || '';
  const savedMode  = localStorage.getItem('vilva_mode')  || 'light';
  applyTheme(savedTheme, savedMode);

  const updateUI = (theme, mode) => {
    panel.querySelectorAll('.theme-swatch').forEach(s =>
      s.classList.toggle('active', s.dataset.theme === theme));
    panel.querySelectorAll('.theme-mode-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.mode === mode));
  };
  updateUI(savedTheme, savedMode);

  // Toggle panel
  btn.addEventListener('click', e => {
    e.stopPropagation();
    panel.classList.toggle('hidden');
  });
  document.addEventListener('click', e => {
    if (!panel.contains(e.target) && e.target !== btn) panel.classList.add('hidden');
  });

  // Color swatch clicks
  panel.querySelectorAll('.theme-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      const theme = swatch.dataset.theme;
      const mode  = localStorage.getItem('vilva_mode') || 'light';
      localStorage.setItem('vilva_theme', theme);
      applyTheme(theme, mode);
      updateUI(theme, mode);
    });
  });

  // Mode buttons
  panel.querySelectorAll('.theme-mode-btn').forEach(modeBtn => {
    modeBtn.addEventListener('click', () => {
      const mode  = modeBtn.dataset.mode;
      const theme = localStorage.getItem('vilva_theme') || '';
      localStorage.setItem('vilva_mode', mode);
      applyTheme(theme, mode);
      updateUI(theme, mode);
    });
  });

  // Layout switch buttons — full reload to rebuild shell
  panel.querySelectorAll('.layout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const layout = btn.dataset.layout;
      if (layout !== getLayout()) {
        setLayout(layout); // saves + reloads page
      }
    });
  });

  // Mark active layout button
  const currentLayout = getLayout();
  panel.querySelectorAll('.layout-btn').forEach(b =>
    b.classList.toggle('active', (b.dataset.layout || 'default') === currentLayout));
}

// ── Global Search ──────────────────────────────────────────────────────────

function initGlobalSearch() {
  const input     = document.getElementById('global-search');
  const container = document.querySelector('.topbar-search');
  if (!input || !container) return;

  let timer = null;
  let dropdown = null;

  const closeDropdown = () => {
    dropdown?.remove();
    dropdown = null;
  };

  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 2) { closeDropdown(); return; }

    timer = setTimeout(async () => {
      try {
        const { api } = await import('@api/apiClient.js');
        const res = await api.get('/search', { q });
        showSearchResults(res, container, input);
      } catch {}
    }, 280);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeDropdown(); input.blur(); }
  });

  document.addEventListener('mousedown', e => {
    if (!container.contains(e.target)) closeDropdown();
  });

  function showSearchResults(res, container, input) {
    closeDropdown();
    const tasks    = res.tasks || [];
    const projects = res.projects || [];
    if (!tasks.length && !projects.length) return;

    const statusColors = { backlog:'#94a3b8', todo:'#3b82f6', in_progress:'#f59e0b', review:'#8b5cf6', completed:'#10b981' };
    const prioColors   = { urgent:'#dc2626', high:'#d97706', medium:'#2563eb', low:'#64748b' };

    dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    dropdown.innerHTML = `
      ${projects.length ? `
        <div class="search-dd-group">Projects</div>
        ${projects.map(p => `
          <div class="search-dd-item" data-nav="/projects/${p.id}">
            <span class="search-dd-dot" style="background:${p.color || '#6366f1'}"></span>
            <span class="search-dd-name">${p.name}</span>
          </div>`).join('')}` : ''}
      ${tasks.length ? `
        <div class="search-dd-group">Tasks</div>
        ${tasks.map(t => `
          <div class="search-dd-item" data-nav="/tasks/${t.id}">
            <span class="search-dd-dot" style="background:${prioColors[t.priority] || '#94a3b8'}"></span>
            <span class="search-dd-name">${t.title}</span>
            ${t.project ? `<span class="search-dd-proj" style="color:${t.project.color}">${t.project.name}</span>` : ''}
            <span class="search-dd-status" style="color:${statusColors[t.status] || '#94a3b8'}">${t.status?.replace('_',' ')}</span>
          </div>`).join('')}` : ''}`;

    container.style.position = 'relative';
    container.appendChild(dropdown);

    dropdown.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('mousedown', e => {
        e.preventDefault();
        router.navigate(el.dataset.nav);
        input.value = '';
        closeDropdown();
      });
    });
  }
}

boot();
