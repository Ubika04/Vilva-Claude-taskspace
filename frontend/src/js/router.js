/**
 * Vilva Taskspace — Client-side Router
 * Hash-based SPA router with lazy-loaded page modules.
 */

const routes = {
  '/dashboard':  () => import('@modules/dashboard.js').then(m => m.renderDashboard),
  '/projects':   () => import('@modules/projects.js').then(m => m.renderProjects),
  '/my-tasks':   () => import('@modules/tasks.js').then(m => m.renderMyTasks),
  '/kanban':     () => import('@modules/kanban.js').then(m => m.renderKanban),
  '/reports':    () => import('@modules/reports.js').then(m => m.renderReports),
  '/milestones': () => import('@modules/milestones.js').then(m => m.renderMilestones),
  '/goals':      () => import('@modules/goals.js').then(m => m.renderGoals),
  '/profile':    () => import('@modules/profile.js').then(m => m.renderProfile),
  '/admin':      () => import('@modules/admin.js').then(m => m.renderAdmin),
};

class Router {
  constructor() {
    this.currentRoute = null;
    window.addEventListener('hashchange', () => {
      this.navigate(location.hash.slice(1) || '/dashboard');
    });
  }

  async navigate(path) {
    // Extract base path (e.g. /projects/5/kanban → /kanban)
    const container = document.getElementById('page-wrap');
    const pageTitle  = document.getElementById('page-title');

    let handler = routes[path];

    // Dynamic routes: /projects/:id/kanban
    if (! handler) {
      const match = path.match(/^\/projects\/(\d+)\/kanban$/);
      if (match) {
        handler = () => import('@modules/kanban.js').then(m => () => m.renderKanban(match[1]));
      }
      const projectMatch = path.match(/^\/projects\/(\d+)$/);
      if (projectMatch) {
        handler = () => import('@modules/projects.js').then(async m => {
          const fn = await m.renderProjectDetail(projectMatch[1]);
          return fn;
        });
      }
      const taskMatch = path.match(/^\/tasks\/(\d+)$/);
      if (taskMatch) {
        handler = () => import('@modules/tasks.js').then(m => () => m.renderTaskDetail(taskMatch[1]));
      }
    }

    if (! handler) {
      container.innerHTML = '<div class="full-empty"><div class="full-empty-icon">🔍</div><h3>404 — Page not found</h3></div>';
      return;
    }

    container.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>';

    try {
      const renderFn = await handler();
      this.currentRoute = path;
      location.hash = path;

      // Update active nav
      document.querySelectorAll('.nav-link').forEach(item => {
        const page = item.dataset.page;
        item.classList.toggle('active', path.startsWith('/' + page));
      });

      // Update page title
      const titles = {
        '/dashboard':  'Dashboard',
        '/projects':   'Projects',
        '/my-tasks':   'My Tasks',
        '/reports':    'Reports',
        '/milestones': 'Milestones',
        '/goals':      'Goals',
        '/profile':    'Profile Settings',
        '/admin':      'Team Members',
      };
      if (pageTitle) pageTitle.textContent = titles[path] || 'Vilva Taskspace';

      await renderFn(container);
    } catch (err) {
      console.error('Router error:', err);
      container.innerHTML = '<div class="full-empty"><div class="full-empty-icon">⚠️</div><h3>Failed to load page</h3><p>Check the console for details.</p></div>';
    }
  }
}

export const router = new Router();
