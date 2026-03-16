import { getProjects, createProject, deleteProject } from '@api/projects.js';
import { getMilestones, createMilestone, updateMilestone, deleteMilestone } from '@api/milestones.js';
import { openModal, closeModal } from '@components/modal.js';
import { showToast } from '@components/toast.js';
import { formatDate, isOverdue } from '@utils/helpers.js';

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
        <button class="btn btn-primary" id="new-project-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
          New Project
        </button>
      </div>
    </div>
    <div class="projects-grid" id="projects-grid">
      ${projects.length === 0 ? `
        <div class="project-empty">
          <div class="project-empty-icon">📁</div>
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
        </div>` : projects.map(p => projectCard(p)).join('')}
    </div>`;

  document.getElementById('new-project-btn').addEventListener('click', () => openNewProjectModal(container));

  container.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.project-card-actions')) return;
      import('../js/router.js').then(m => m.router.navigate(`/projects/${card.dataset.id}`));
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
          <div class="project-card-name">${p.name}</div>
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

function openNewProjectModal(container) {
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
  document.getElementById('new-proj-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('proj-submit');
    btn.disabled = true; btn.textContent = 'Creating…';
    try {
      const fd = Object.fromEntries(new FormData(e.target));
      Object.keys(fd).forEach(k => { if (fd[k] === '') delete fd[k]; });
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
