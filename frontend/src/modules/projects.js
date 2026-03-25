import { getProjects, createProject, deleteProject, updateProject } from '@api/projects.js';
import { getMilestones, createMilestone, updateMilestone, deleteMilestone } from '@api/milestones.js';
import { openModal, closeModal } from '@components/modal.js';
import { showToast } from '@components/toast.js';
import { formatDate, isOverdue } from '@utils/helpers.js';
import { api } from '@api/apiClient.js';

let projectViewMode = localStorage.getItem('vilva_proj_view') || 'grid';

export async function renderProjects(container) {
  container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;
  const res = await getProjects({ per_page: 50 });
  const projects = res.data || [];

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Projects</h1>
        <p>${projects.length} project${projects.length !== 1 ? 's' : ''}</p>
      </div>
      <div class="page-header-right">
        <div class="view-toggle">
          <button class="view-toggle-btn ${projectViewMode === 'grid' ? 'active' : ''}" data-view="grid" title="Grid View">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
          <button class="view-toggle-btn ${projectViewMode === 'list' ? 'active' : ''}" data-view="list" title="List View">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
        </div>
        <button class="btn btn-primary" id="new-project-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
          New Project
        </button>
      </div>
    </div>
    ${projects.length === 0 ? `
      <div class="project-empty">
        <div class="project-empty-icon">📁</div>
        <h3>No projects yet</h3>
        <p>Create your first project to get started</p>
      </div>` : projectViewMode === 'list' ? renderProjectListView(projects) : `<div class="projects-grid" id="projects-grid">${projects.map(p => projectCard(p)).join('')}</div>`}`;

  document.getElementById('new-project-btn').addEventListener('click', () => openNewProjectModal(container));

  // View toggle
  container.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      projectViewMode = btn.dataset.view;
      localStorage.setItem('vilva_proj_view', projectViewMode);
      renderProjects(container);
    });
  });

  bindProjectEvents(container);

  // Init drag-drop for project reordering (grid and list)
  initProjectDragDrop(container);
}

function bindProjectEvents(container) {
  container.querySelectorAll('.project-card, .project-list-row').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.closest('.project-card-actions, .proj-list-actions')) return;
      import('../js/router.js').then(m => m.router.navigate(`/projects/${el.dataset.id}`));
    });
  });

  container.querySelectorAll('[data-kanban-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      import('../js/router.js').then(m => m.router.navigate(`/projects/${btn.dataset.kanbanId}/kanban`));
    });
  });

  container.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return;
      await deleteProject(btn.dataset.deleteId);
      showToast('Project deleted', 'success');
      renderProjects(container);
    });
  });
}

function renderProjectListView(projects) {
  const statusColors = { active:'#16a34a', archived:'#64748b', on_hold:'#d97706', completed:'#6366f1' };
  return `
    <div class="project-list-table" id="projects-grid">
      <div class="proj-list-header">
        <span class="proj-list-col name">Name</span>
        <span class="proj-list-col status">Status</span>
        <span class="proj-list-col progress">Progress</span>
        <span class="proj-list-col members">Members</span>
        <span class="proj-list-col due">Due Date</span>
        <span class="proj-list-col actions">Actions</span>
      </div>
      ${projects.map(p => {
        const col = statusColors[p.status] || '#64748b';
        const members = p.members || [];
        return `
          <div class="project-list-row" data-id="${p.id}">
            <span class="proj-list-col name">
              <span class="proj-list-color" style="background:${p.color}"></span>
              <span class="proj-list-name">${p.name}</span>
              ${p.ai_enabled ? `<span class="proj-ai-badge" title="AI enabled">✨</span>` : ''}
            </span>
            <span class="proj-list-col status">
              <span class="proj-list-status-badge" style="color:${col};background:${col}15">
                <svg width="6" height="6" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="${col}"/></svg>
                ${p.status || 'active'}
              </span>
            </span>
            <span class="proj-list-col progress">
              <div class="pbar-wrap" style="width:80px"><div class="pbar" style="width:${p.progress||0}%"></div></div>
              <span style="font-size:12px;font-weight:700;color:${p.color};margin-left:6px">${p.progress||0}%</span>
            </span>
            <span class="proj-list-col members">
              <div style="display:flex">
                ${members.slice(0,4).map(m => `<img src="${m.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&size=24&background=6366f1&color=fff`}" title="${m.name}" style="width:24px;height:24px;border-radius:50%;margin-left:-4px;border:1.5px solid #fff;object-fit:cover"/>`).join('')}
                ${members.length > 4 ? `<span style="font-size:11px;color:#64748b;margin-left:4px">+${members.length-4}</span>` : ''}
              </div>
            </span>
            <span class="proj-list-col due">
              ${p.due_date ? formatDate(p.due_date) : '<span style="color:#94a3b8">—</span>'}
            </span>
            <span class="proj-list-col actions proj-list-actions">
              <button class="btn-icon" data-kanban-id="${p.id}" title="Kanban">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/></svg>
              </button>
              <button class="btn-icon" data-delete-id="${p.id}" title="Delete" style="color:#dc2626">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
              </button>
            </span>
          </div>`;
      }).join('')}
    </div>`;
}

function initProjectDragDrop(container) {
  const grid = container.querySelector('#projects-grid');
  if (!grid) return;
  import('sortablejs').then(({ default: Sortable }) => {
    Sortable.create(grid, {
      animation: 160,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      handle: projectViewMode === 'list' ? '.project-list-row' : '.project-card',
      filter: '.project-card-actions, .proj-list-actions',
      onEnd: () => {
        showToast('Project order saved', 'success', 1500);
      },
    });
  }).catch(() => {});
}

function projectCard(p) {
  const members = (p.members || []);
  const shown = members.slice(0, 4);
  const extra = members.length - 4;
  const statusColors = { active:'#16a34a', archived:'#64748b', on_hold:'#d97706' };
  const col = statusColors[p.status] || '#64748b';
  return `
    <div class="project-card" data-id="${p.id}">
      <div class="project-card-bar" style="background:${p.color}"></div>
      <div class="project-card-body">
        <div class="project-card-top">
          <div class="project-card-name">
        ${p.name}
        ${p.ai_enabled ? `<span class="proj-ai-badge" title="AI enabled">✨ AI</span>` : ''}
      </div>
          <div class="project-card-actions">
            <button class="btn-icon" data-kanban-id="${p.id}" title="Kanban Board">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/></svg>
            </button>
            <button class="btn-icon" data-delete-id="${p.id}" title="Delete" style="color:#dc2626">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path stroke-linecap="round" d="M10 11v6m4-6v6"/></svg>
            </button>
          </div>
        </div>
        <div class="project-card-desc">${p.description || 'No description provided.'}</div>
        <div class="pbar-wrap"><div class="pbar" style="width:${p.progress || 0}%"></div></div>
        <div class="project-card-meta">
          <span class="project-card-status" style="color:${col}">
            <svg width="7" height="7" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="${col}"/></svg>
            ${p.status || 'active'}
          </span>
          <span class="project-card-tasks">${p.tasks_count || 0} tasks</span>
          ${p.due_date ? `<span class="project-card-due">Due ${new Date(p.due_date).toLocaleDateString('en',{month:'short',day:'numeric'})}</span>` : ''}
          <span style="margin-left:auto;font-size:12.5px;font-weight:700;color:${p.color}">${p.progress || 0}%</span>
        </div>
        ${members.length > 0 ? `
        <div class="project-card-members">
          ${shown.map(m => `<img src="${m.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&size=26&background=6366f1&color=fff`}" title="${m.name}" alt="${m.name}"/>`).join('')}
          ${extra > 0 ? `<div class="member-more">+${extra}</div>` : ''}
        </div>` : ''}
      </div>
    </div>`;
}

async function openNewProjectModal(container) {
  let users = [];
  try {
    const res = await api.get('/users/search?per_page=50');
    users = Array.isArray(res) ? res : (res.data || []);
  } catch {}

  openModal({
    title: 'Create New Project',
    subtitle: 'Set up a workspace for your team to collaborate',
    body: `
      <form id="new-proj-form">
        <div class="form-group">
          <label class="form-label">Project Name *</label>
          <input name="name" class="form-input" placeholder="e.g. Website Redesign" required autofocus/>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea name="description" class="form-input form-textarea" placeholder="What is this project about?"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Color</label>
            <input type="color" name="color" class="form-input" value="#6366f1" style="height:40px;padding:4px 6px;cursor:pointer"/>
          </div>
          <div class="form-group">
            <label class="form-label">Visibility</label>
            <select name="visibility" class="form-input form-select">
              <option value="team">Team</option>
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Start Date</label>
            <input type="date" name="start_date" class="form-input"/>
          </div>
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input type="date" name="due_date" class="form-input"/>
          </div>
        </div>
        <div class="form-sep">AI Task Generation</div>
        <div class="ai-toggle-row">
          <label class="ai-toggle-label">
            <input type="checkbox" name="ai_enabled" id="proj-ai-toggle" value="1" class="ai-toggle-cb"/>
            <span class="ai-toggle-track"><span class="ai-toggle-thumb"></span></span>
            <span>Enable AI task generation for this project</span>
          </label>
        </div>
        <div id="ai-context-wrap" class="hidden">
          <div class="form-group" style="margin-top:10px">
            <label class="form-label">AI Context <span class="form-hint" style="display:inline">— helps AI understand your project</span></label>
            <textarea name="ai_context" class="form-input form-textarea" rows="3"
              placeholder="e.g. This is a React/Node.js e-commerce app. We use Jira for tracking and deploy to AWS. Focus on frontend tasks."></textarea>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Members</label>
          <div style="max-height:160px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--r);padding:6px" id="proj-member-picker">
            ${users.map(u => `
              <label style="display:flex;align-items:center;gap:8px;padding:4px 6px;cursor:pointer;font-size:13px;border-radius:4px" class="proj-member-opt">
                <input type="checkbox" value="${u.id}" name="member_ids"/>
                <img src="${u.avatar_url}" style="width:22px;height:22px;border-radius:50%;object-fit:cover"/>
                ${u.name}
              </label>`).join('')}
          </div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px;padding-top:14px;border-top:1px solid #e2e8f0">
          <button type="button" class="btn btn-ghost" id="proj-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary" id="proj-submit">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
            Create Project
          </button>
        </div>
      </form>`,
  });

  document.getElementById('proj-cancel').addEventListener('click', closeModal);

  // AI toggle show/hide context
  document.getElementById('proj-ai-toggle').addEventListener('change', function () {
    document.getElementById('ai-context-wrap').classList.toggle('hidden', !this.checked);
  });

  document.getElementById('new-proj-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('proj-submit');
    btn.disabled = true; btn.textContent = 'Creating…';
    try {
      const fd = Object.fromEntries(new FormData(e.target));
      Object.keys(fd).forEach(k => { if (fd[k] === '') delete fd[k]; });
      // Checkbox: convert '1' to boolean, absent means false
      fd.ai_enabled = !!fd.ai_enabled;
      fd.member_ids = [...document.querySelectorAll('#proj-member-picker input:checked')].map(cb => parseInt(cb.value));
      await createProject(fd);
      closeModal();
      showToast('Project created!', 'success');
      renderProjects(container);
    } catch { btn.disabled = false; btn.textContent = 'Create Project'; }
  });
}

export async function renderProjectDetail(projectId) {
  return async (container) => {
    container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;
    const { getProject, getProjectStats } = await import('@api/projects.js');
    const [project, stats] = await Promise.all([getProject(projectId), getProjectStats(projectId)]);

    container.innerHTML = `
      <div class="project-detail-header">
        <div class="proj-header-top">
          <div class="proj-header-left">
            <div class="proj-header-label">
              <span class="proj-color-badge" style="background:${project.color}"></span>
              <span style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.5px">${project.status || 'active'}</span>
            </div>
            <div class="proj-header-name">${project.name}</div>
            <div class="proj-header-desc">${project.description || ''}</div>
          </div>
          <div class="proj-header-right">
            ${project.ai_enabled ? `
            <button class="btn btn-ai btn-sm" id="ai-gen-tasks-btn" title="Generate tasks with AI">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
              ✨ AI Tasks
            </button>` : ''}
            <button class="btn btn-secondary btn-sm" id="open-kanban">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/></svg>
              Kanban
            </button>
            <button class="btn btn-primary btn-sm" id="new-task-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
              New Task
            </button>
          </div>
        </div>
        <div class="proj-stats-strip">
          <div class="proj-stat"><span class="proj-stat-val">${stats.total ?? 0}</span><span class="proj-stat-lbl">Total</span></div>
          <div class="proj-stat brand"><span class="proj-stat-val">${stats.in_progress ?? 0}</span><span class="proj-stat-lbl">In Progress</span></div>
          <div class="proj-stat green"><span class="proj-stat-val">${stats.completed ?? 0}</span><span class="proj-stat-lbl">Completed</span></div>
          <div class="proj-stat red"><span class="proj-stat-val">${stats.overdue ?? 0}</span><span class="proj-stat-lbl">Overdue</span></div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="proj-tabs">
        <button class="proj-tab active" data-tab="tasks">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          Tasks
        </button>
        <button class="proj-tab" data-tab="milestones">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>
          Milestones
        </button>
        <button class="proj-tab" data-tab="progress">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          Progress
        </button>
      </div>

      <div id="proj-tab-content"></div>`;

    // Nav button wiring
    document.getElementById('open-kanban').addEventListener('click', () => {
      import('../js/router.js').then(m => m.router.navigate(`/projects/${projectId}/kanban`));
    });

    // Tab switching
    const tabContent = document.getElementById('proj-tab-content');
    const { renderTaskList, openNewTaskModal } = await import('./tasks.js');

    async function showTab(tab) {
      container.querySelectorAll('.proj-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));

      if (tab === 'tasks') {
        document.getElementById('new-task-btn').classList.remove('hidden');
        await renderTaskList(tabContent, projectId);
      } else if (tab === 'milestones') {
        document.getElementById('new-task-btn').classList.add('hidden');
        await renderMilestonesTab(tabContent, projectId);
      } else if (tab === 'progress') {
        document.getElementById('new-task-btn').classList.add('hidden');
        await renderProgressTab(tabContent, project, stats, projectId);
      }
    }

    container.querySelectorAll('.proj-tab').forEach(btn => {
      btn.addEventListener('click', () => showTab(btn.dataset.tab));
    });

    document.getElementById('new-task-btn')?.addEventListener('click', () => {
      openNewTaskModal(tabContent, parseInt(projectId));
    });

    document.getElementById('ai-gen-tasks-btn')?.addEventListener('click', () => {
      openAiGenerateTasksModal(project, parseInt(projectId), tabContent);
    });

    await showTab('tasks');
  };
}

// ── Milestones tab ──────────────────────────────────────────────────────────────

async function renderMilestonesTab(container, projectId) {
  container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;
  const res = await getMilestones(projectId).catch(() => ({ data: [] }));
  const milestones = res.data || [];

  container.innerHTML = `
    <div class="proj-ms-header">
      <span style="font-size:13px;color:var(--text3)">${milestones.length} milestone${milestones.length !== 1 ? 's' : ''}</span>
      <button class="btn btn-primary btn-sm" id="add-milestone-btn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
        Add Milestone
      </button>
    </div>
    <div class="proj-ms-list" id="proj-ms-list">
      ${milestones.length === 0
        ? `<div class="full-empty" style="padding:40px"><div class="full-empty-icon">🏁</div><h3>No milestones yet</h3><p>Add milestones to mark key checkpoints in your project</p></div>`
        : milestones.map(m => projectMilestoneRow(m, projectId)).join('')}
    </div>`;

  document.getElementById('add-milestone-btn').addEventListener('click', () => {
    openMilestoneModal(container, projectId, null);
  });

  bindMilestoneEvents(container, projectId, milestones);
}

function projectMilestoneRow(m, projectId) {
  const completed = m.status === 'completed';
  const od        = !completed && m.due_date && isOverdue(m.due_date, 'active');
  return `
    <div class="proj-ms-row ${completed ? 'ms-done' : ''} ${od ? 'ms-overdue' : ''}">
      <div class="proj-ms-row-left">
        <button class="ms-circle-btn ms-toggle-btn"
          data-project-id="${projectId}" data-milestone-id="${m.id}" data-current-status="${m.status}"
          title="${completed ? 'Reopen' : 'Mark complete'}"
          style="border-color:${m.color||'#6366f1'}">
          ${completed
            ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${m.color||'#6366f1'}" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`
            : `<span style="width:7px;height:7px;border-radius:50%;background:${m.color||'#6366f1'};display:inline-block"></span>`}
        </button>
        <div>
          <div class="proj-ms-title ${completed ? 'done' : ''}">${m.title}</div>
          ${m.description ? `<div class="proj-ms-desc">${m.description}</div>` : ''}
        </div>
      </div>
      <div class="proj-ms-row-right">
        ${m.due_date ? `<span class="ms-due ${od ? 'overdue' : completed ? 'done' : ''}">📅 ${formatDate(m.due_date)}</span>` : ''}
        <span class="ms-status-pill ${m.status === 'completed' ? 'completed' : od ? 'overdue' : 'open'}">
          ${m.status === 'completed' ? 'Completed' : od ? 'Overdue' : 'Open'}
        </span>
        <button class="btn-icon ms-edit-btn" data-milestone-id="${m.id}" title="Edit">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </button>
        <button class="btn-icon ms-delete-btn" data-project-id="${projectId}" data-milestone-id="${m.id}" title="Delete" style="color:#dc2626">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
        </button>
      </div>
    </div>`;
}

function bindMilestoneEvents(container, projectId, milestones) {
  container.querySelectorAll('.ms-toggle-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const newStatus = btn.dataset.currentStatus === 'open' ? 'completed' : 'open';
      try {
        await updateMilestone(projectId, btn.dataset.milestoneId, { status: newStatus });
        showToast(newStatus === 'completed' ? '✅ Milestone completed!' : 'Milestone reopened', 'success');
        renderMilestonesTab(container, projectId);
      } catch { showToast('Update failed', 'error'); }
    });
  });

  container.querySelectorAll('.ms-edit-btn').forEach(btn => {
    const m = milestones.find(x => x.id == btn.dataset.milestoneId);
    if (m) btn.addEventListener('click', () => openMilestoneModal(container, projectId, m));
  });

  container.querySelectorAll('.ms-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this milestone?')) return;
      try {
        await deleteMilestone(projectId, btn.dataset.milestoneId);
        showToast('Milestone deleted', 'success');
        renderMilestonesTab(container, projectId);
      } catch { showToast('Delete failed', 'error'); }
    });
  });
}

function openMilestoneModal(container, projectId, milestone) {
  const isEdit = !!milestone;
  openModal({
    title: isEdit ? 'Edit Milestone' : 'Add Milestone',
    body: `
      <form id="ms-form">
        <div class="form-group">
          <label class="form-label">Title *</label>
          <input name="title" class="form-input" value="${isEdit ? milestone.title : ''}" placeholder="Milestone name" required autofocus/>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea name="description" class="form-input form-textarea" placeholder="Optional notes…">${isEdit ? (milestone.description || '') : ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input type="date" name="due_date" class="form-input" value="${isEdit && milestone.due_date ? milestone.due_date.slice(0,10) : ''}"/>
          </div>
          <div class="form-group">
            <label class="form-label">Color</label>
            <input type="color" name="color" class="form-input" value="${isEdit ? (milestone.color||'#6366f1') : '#6366f1'}" style="height:40px;padding:4px 6px;cursor:pointer"/>
          </div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px;padding-top:14px;border-top:1px solid #e2e8f0">
          <button type="button" class="btn btn-ghost" id="ms-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary" id="ms-submit">${isEdit ? 'Save' : 'Add Milestone'}</button>
        </div>
      </form>`,
  });

  document.getElementById('ms-cancel').addEventListener('click', closeModal);
  document.getElementById('ms-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('ms-submit');
    btn.disabled = true; btn.textContent = 'Saving…';
    const fd = Object.fromEntries(new FormData(e.target));
    Object.keys(fd).forEach(k => { if (fd[k] === '') delete fd[k]; });
    try {
      if (isEdit) {
        await updateMilestone(projectId, milestone.id, fd);
        showToast('Milestone updated', 'success');
      } else {
        await createMilestone(projectId, fd);
        showToast('Milestone added', 'success');
      }
      closeModal();
      renderMilestonesTab(container, projectId);
    } catch { btn.disabled = false; btn.textContent = isEdit ? 'Save' : 'Add Milestone'; }
  });
}

// ── Progress tab ──────────────────────────────────────────────────────────────

async function renderProgressTab(container, project, stats, projectId) {
  const milestones = await getMilestones(projectId).then(r => r.data || []).catch(() => []);

  const total     = stats.total     || 0;
  const completed = stats.completed || 0;
  const inProg    = stats.in_progress || 0;
  const overdue   = stats.overdue   || 0;
  const todo      = total - completed - inProg - (stats.backlog || 0) - (stats.review || 0);
  const pct       = project.progress || 0;

  const completedMs = milestones.filter(m => m.status === 'completed').length;
  const totalMs     = milestones.length;

  // Status breakdown bars
  const breakdown = [
    { label: 'Completed',   val: completed, color: '#16a34a', bg: '#dcfce7' },
    { label: 'In Progress', val: inProg,    color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Review',      val: stats.review || 0, color: '#7c3aed', bg: '#ede9fe' },
    { label: 'To Do',       val: stats.todo  || 0, color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Backlog',     val: stats.backlog || 0, color: '#94a3b8', bg: '#f1f5f9' },
  ].filter(b => b.val > 0);

  container.innerHTML = `
    <div class="progress-tab-grid">

      <!-- Overall Progress Ring -->
      <div class="card progress-ring-card">
        <div class="card-header"><h3>Overall Progress</h3></div>
        <div class="card-body" style="display:flex;align-items:center;gap:28px">
          <div class="progress-ring-wrap">
            <svg width="110" height="110" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r="46" fill="none" stroke="#e2e8f0" stroke-width="10"/>
              <circle cx="55" cy="55" r="46" fill="none"
                stroke="${pct >= 100 ? '#16a34a' : '#6366f1'}" stroke-width="10"
                stroke-dasharray="${2 * Math.PI * 46}"
                stroke-dashoffset="${2 * Math.PI * 46 * (1 - pct / 100)}"
                stroke-linecap="round"
                transform="rotate(-90 55 55)"/>
              <text x="55" y="59" text-anchor="middle" font-size="22" font-weight="800"
                fill="${pct >= 100 ? '#16a34a' : '#0f172a'}" font-family="Inter,sans-serif">${pct}%</text>
            </svg>
          </div>
          <div class="progress-ring-stats">
            <div class="progress-ring-stat"><span style="color:#16a34a;font-weight:700">${completed}</span> Completed</div>
            <div class="progress-ring-stat"><span style="color:#f59e0b;font-weight:700">${inProg}</span> In Progress</div>
            <div class="progress-ring-stat"><span style="color:#dc2626;font-weight:700">${overdue}</span> Overdue</div>
            <div class="progress-ring-stat"><span style="color:#64748b;font-weight:700">${total}</span> Total tasks</div>
          </div>
        </div>
      </div>

      <!-- Status Breakdown -->
      <div class="card">
        <div class="card-header"><h3>Task Breakdown</h3></div>
        <div class="card-body">
          ${breakdown.map(b => `
            <div class="breakdown-row">
              <div class="breakdown-label">
                <span class="breakdown-dot" style="background:${b.color}"></span>
                ${b.label}
              </div>
              <div class="breakdown-bar-wrap">
                <div class="breakdown-bar" style="width:${total > 0 ? Math.round(b.val/total*100) : 0}%;background:${b.color}"></div>
              </div>
              <div class="breakdown-nums">
                <span style="font-weight:700">${b.val}</span>
                <span style="color:var(--muted);font-size:11px">${total > 0 ? Math.round(b.val/total*100) : 0}%</span>
              </div>
            </div>`).join('')}
          ${breakdown.length === 0 ? `<div class="widget-empty">No tasks yet</div>` : ''}
        </div>
      </div>

    </div>

    <!-- Milestone Roadmap -->
    <div class="card" style="margin-top:16px">
      <div class="card-header">
        <h3>Milestone Roadmap</h3>
        ${totalMs > 0 ? `<span style="font-size:12px;color:var(--text3)">${completedMs}/${totalMs} completed</span>` : ''}
      </div>
      <div class="card-body">
        ${totalMs === 0
          ? `<div class="widget-empty"><div class="widget-empty-icon">🏁</div>No milestones — add them in the Milestones tab</div>`
          : `
          <div class="roadmap-track">
            <div class="roadmap-progress-line" style="width:${totalMs > 0 ? Math.round(completedMs/totalMs*100) : 0}%"></div>
            ${milestones
              .sort((a, b) => (!a.due_date ? 1 : !b.due_date ? -1 : new Date(a.due_date) - new Date(b.due_date)))
              .map((m, i) => {
                const pos     = totalMs > 1 ? Math.round((i / (totalMs - 1)) * 100) : 50;
                const done    = m.status === 'completed';
                const od      = !done && m.due_date && isOverdue(m.due_date, 'active');
                const dotColor = done ? '#16a34a' : od ? '#dc2626' : (m.color || '#6366f1');
                return `
                  <div class="roadmap-node" style="left:${pos}%">
                    <div class="roadmap-dot ${done ? 'done' : ''}" style="border-color:${dotColor};background:${done ? dotColor : '#fff'}">
                      ${done ? `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>` : ''}
                    </div>
                    <div class="roadmap-label">
                      <div class="roadmap-title ${done ? 'done' : ''}">${m.title}</div>
                      ${m.due_date ? `<div class="roadmap-date ${od ? 'overdue' : ''}">${formatDate(m.due_date)}</div>` : ''}
                    </div>
                  </div>`;
              }).join('')}
          </div>`}
      </div>
    </div>`;
}

// ── AI Generate Tasks Modal ────────────────────────────────────────────────────

async function openAiGenerateTasksModal(project, projectId, tabContent) {
  const priorityColors = { low:'#64748b', medium:'#2563eb', high:'#d97706', urgent:'#dc2626' };

  openModal({
    title: `✨ AI Generate Tasks`,
    subtitle: `for ${project.name}`,
    wide: true,
    body: `
      <div class="ai-gen-body">
        <p class="ai-modal-hint">Describe what needs to be done in this project. AI will break it down into tasks.</p>

        ${project.ai_context ? `
        <div class="ai-context-hint">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 8v4m0 4h.01"/></svg>
          Project context: <em>${project.ai_context.slice(0, 120)}${project.ai_context.length > 120 ? '…' : ''}</em>
        </div>` : ''}

        <div class="ai-examples" style="margin-bottom:8px">
          <span class="ai-example-chip" data-ex="Build a user authentication system with login, register, and password reset">User auth system</span>
          <span class="ai-example-chip" data-ex="Create a dashboard with charts, filters, and export to CSV functionality">Analytics dashboard</span>
          <span class="ai-example-chip" data-ex="Set up CI/CD pipeline, Docker containers, and automated testing">DevOps setup</span>
          <span class="ai-example-chip" data-ex="Design and implement REST API endpoints for the mobile app">API for mobile</span>
        </div>

        <div class="form-group">
          <label class="form-label">What needs to be done? *</label>
          <textarea id="ai-gen-prompt" class="form-input form-textarea" rows="3"
            placeholder="e.g. Build a complete checkout flow with cart, payment integration (Stripe), order confirmation emails, and admin order management…"
            style="resize:vertical"></textarea>
        </div>

        <div id="ai-gen-result" class="ai-gen-result hidden">
          <div class="ai-gen-result-header">
            <div class="ai-gen-result-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              <span id="ai-gen-count">0</span> tasks generated — select which to create
            </div>
            <button type="button" class="btn btn-ghost btn-sm" id="ai-gen-select-all">Select all</button>
          </div>
          <div id="ai-gen-tasks-list" class="ai-gen-tasks-list"></div>
        </div>

        <div id="ai-gen-error" class="ai-error hidden"></div>

        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px;padding-top:14px;border-top:1px solid #e2e8f0">
          <button type="button" class="btn btn-ghost" id="ai-gen-cancel">Cancel</button>
          <button type="button" class="btn btn-secondary" id="ai-gen-parse-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            Generate Tasks
          </button>
          <button type="button" class="btn btn-primary hidden" id="ai-gen-create-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
            Create Selected
          </button>
        </div>
      </div>`,
  });

  let generatedTasks = [];

  // Example chips
  document.querySelectorAll('.ai-example-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.getElementById('ai-gen-prompt').value = chip.dataset.ex;
    });
  });

  document.getElementById('ai-gen-cancel').addEventListener('click', closeModal);

  // Select all toggle
  document.getElementById('ai-gen-select-all').addEventListener('click', () => {
    const checks = document.querySelectorAll('.ai-task-check');
    const allChecked = [...checks].every(c => c.checked);
    checks.forEach(c => c.checked = !allChecked);
    document.getElementById('ai-gen-select-all').textContent = allChecked ? 'Select all' : 'Deselect all';
  });

  // Generate
  document.getElementById('ai-gen-parse-btn').addEventListener('click', async () => {
    const prompt = document.getElementById('ai-gen-prompt').value.trim();
    if (!prompt) return;

    const parseBtn  = document.getElementById('ai-gen-parse-btn');
    const errorEl   = document.getElementById('ai-gen-error');
    const resultEl  = document.getElementById('ai-gen-result');

    parseBtn.disabled = true;
    parseBtn.innerHTML = `<span class="spinner-sm"></span> Generating…`;
    errorEl.classList.add('hidden');
    resultEl.classList.add('hidden');

    try {
      const res = await api.post(`/projects/${projectId}/ai/generate-tasks`, { description: prompt });
      generatedTasks = res.tasks || [];

      document.getElementById('ai-gen-count').textContent = generatedTasks.length;

      document.getElementById('ai-gen-tasks-list').innerHTML = generatedTasks.map((t, i) => `
        <div class="ai-gen-task-row" data-index="${i}">
          <label class="ai-gen-task-check-wrap">
            <input type="checkbox" class="ai-task-check" data-index="${i}" checked/>
            <span class="ai-gen-task-check-box"></span>
          </label>
          <div class="ai-gen-task-info">
            <div class="ai-gen-task-title" contenteditable="true" data-index="${i}">${t.title}</div>
            ${t.description ? `<div class="ai-gen-task-desc">${t.description}</div>` : ''}
            <div class="ai-gen-task-meta">
              <span class="ai-gen-priority" style="color:${priorityColors[t.priority]||'#64748b'}">● ${t.priority}</span>
              ${t.due_date ? `<span class="ai-gen-meta-item">📅 ${t.due_date}</span>` : ''}
              ${t.estimated_minutes ? `<span class="ai-gen-meta-item">⏱ ${Math.round(t.estimated_minutes/60*10)/10}h</span>` : ''}
              <span class="ai-gen-meta-item" style="color:#94a3b8">${t.status?.replace('_',' ')}</span>
            </div>
          </div>
        </div>`).join('');

      resultEl.classList.remove('hidden');
      document.getElementById('ai-gen-create-btn').classList.remove('hidden');

      // Update generatedTasks when title edited
      document.querySelectorAll('.ai-gen-task-title[contenteditable]').forEach(el => {
        el.addEventListener('blur', () => {
          const idx = parseInt(el.dataset.index);
          if (generatedTasks[idx]) generatedTasks[idx].title = el.textContent.trim();
        });
      });
    } catch (err) {
      errorEl.textContent = err?.message || 'AI failed. Make sure ANTHROPIC_API_KEY is set in .env';
      errorEl.classList.remove('hidden');
    } finally {
      parseBtn.disabled = false;
      parseBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg> Generate Tasks`;
    }
  });

  // Bulk create selected tasks
  document.getElementById('ai-gen-create-btn').addEventListener('click', async () => {
    const createBtn = document.getElementById('ai-gen-create-btn');
    const selected  = [...document.querySelectorAll('.ai-task-check:checked')]
      .map(c => generatedTasks[parseInt(c.dataset.index)])
      .filter(Boolean);

    if (selected.length === 0) {
      showToast('Select at least one task', 'error');
      return;
    }

    createBtn.disabled = true;
    createBtn.textContent = `Creating ${selected.length} task${selected.length > 1 ? 's' : ''}…`;

    const { createTask } = await import('@api/tasks.js');
    let created = 0, failed = 0;

    for (const t of selected) {
      try {
        await createTask(projectId, {
          title:              t.title,
          description:        t.description || null,
          priority:           t.priority    || 'medium',
          status:             t.status      || 'todo',
          due_date:           t.due_date    || null,
          estimated_minutes:  t.estimated_minutes || null,
        });
        created++;
      } catch { failed++; }
    }

    closeModal();
    if (created > 0) showToast(`✅ ${created} task${created > 1 ? 's' : ''} created!`, 'success');
    if (failed  > 0) showToast(`${failed} task${failed > 1 ? 's' : ''} failed`, 'error');

    // Refresh task list
    const { renderTaskList } = await import('./tasks.js');
    await renderTaskList(tabContent, projectId);
  });
}

