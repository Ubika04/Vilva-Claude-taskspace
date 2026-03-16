/**
 * Milestones Module — Overview of all milestones across projects.
 * Per-project milestone management is also in projects.js (project detail tabs).
 */

import { api } from '@api/apiClient.js';
import { getMilestones, createMilestone, updateMilestone, deleteMilestone } from '@api/milestones.js';
import { getProjects } from '@api/projects.js';
import { openModal, closeModal } from '@components/modal.js';
import { showToast } from '@components/toast.js';
import { formatDate, isOverdue } from '@utils/helpers.js';

export async function renderMilestones(container) {
  container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  // Load all user's projects, then milestones for each
  let projects = [];
  try {
    const res = await getProjects({ per_page: 100 });
    projects   = res.data || [];
  } catch {
    container.innerHTML = `<div class="full-empty"><div class="full-empty-icon">⚠️</div><h3>Could not load projects</h3></div>`;
    return;
  }

  // Fetch milestones for all projects in parallel
  const milestonesByProject = await Promise.all(
    projects.map(p =>
      getMilestones(p.id)
        .then(r => ({ project: p, milestones: r.data || [] }))
        .catch(() => ({ project: p, milestones: [] }))
    )
  );

  const totalOpen      = milestonesByProject.reduce((a, g) => a + g.milestones.filter(m => m.status === 'open').length, 0);
  const totalCompleted = milestonesByProject.reduce((a, g) => a + g.milestones.filter(m => m.status === 'completed').length, 0);
  const totalOverdue   = milestonesByProject.reduce((a, g) =>
    a + g.milestones.filter(m => m.status === 'open' && isOverdue(m.due_date, 'active')).length, 0);

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Milestones</h1>
        <p>Track project checkpoints across all your projects</p>
      </div>
    </div>

    <div class="dash-stats" style="margin-bottom:20px">
      <div class="stat-card">
        <div class="stat-icon stat-icon-blue">🏁</div>
        <div class="stat-info"><span class="stat-val">${totalOpen + totalCompleted}</span><span class="stat-label">Total</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-purple">⏳</div>
        <div class="stat-info"><span class="stat-val">${totalOpen}</span><span class="stat-label">Open</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-green">✅</div>
        <div class="stat-info"><span class="stat-val">${totalCompleted}</span><span class="stat-label">Completed</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-red">⚠️</div>
        <div class="stat-info"><span class="stat-val">${totalOverdue}</span><span class="stat-label">Overdue</span></div>
      </div>
    </div>

    <div id="milestones-content">
      ${milestonesByProject
        .filter(g => g.milestones.length > 0)
        .map(g => projectMilestoneGroup(g.project, g.milestones))
        .join('')}
      ${milestonesByProject.every(g => g.milestones.length === 0)
        ? `<div class="full-empty"><div class="full-empty-icon">🏁</div><h3>No milestones yet</h3><p>Add milestones from within a project to track key checkpoints</p></div>`
        : ''}
    </div>`;

  // Toggle milestone status
  container.querySelectorAll('.ms-toggle-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { projectId, milestoneId, currentStatus } = btn.dataset;
      const newStatus = currentStatus === 'open' ? 'completed' : 'open';
      try {
        await updateMilestone(projectId, milestoneId, { status: newStatus });
        showToast(newStatus === 'completed' ? '✅ Milestone completed!' : 'Milestone reopened', 'success');
        renderMilestones(container);
      } catch { showToast('Update failed', 'error'); }
    });
  });

  // Delete milestone
  container.querySelectorAll('.ms-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this milestone?')) return;
      try {
        await deleteMilestone(btn.dataset.projectId, btn.dataset.milestoneId);
        showToast('Milestone deleted', 'success');
        renderMilestones(container);
      } catch { showToast('Delete failed', 'error'); }
    });
  });

  // Navigate to project
  container.querySelectorAll('[data-goto-project]').forEach(el => {
    el.addEventListener('click', () => {
      import('../js/router.js').then(m => m.router.navigate(`/projects/${el.dataset.gotoProject}`));
    });
  });
}

function projectMilestoneGroup(project, milestones) {
  const sorted = [...milestones].sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  return `
    <div class="ms-project-group">
      <div class="ms-project-label" data-goto-project="${project.id}" style="cursor:pointer">
        <span class="ms-project-dot" style="background:${project.color}"></span>
        <span class="ms-project-name">${project.name}</span>
        <span class="ms-project-count">${milestones.length} milestone${milestones.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="ms-timeline">
        ${sorted.map(m => milestoneRow(m, project.id)).join('')}
      </div>
    </div>`;
}

function milestoneRow(m, projectId) {
  const completed = m.status === 'completed';
  const od        = !completed && isOverdue(m.due_date, 'active');

  return `
    <div class="ms-row ${completed ? 'ms-done' : ''} ${od ? 'ms-overdue' : ''}">
      <div class="ms-row-left">
        <button class="ms-circle-btn ms-toggle-btn"
          data-project-id="${projectId}"
          data-milestone-id="${m.id}"
          data-current-status="${m.status}"
          title="${completed ? 'Reopen' : 'Mark complete'}"
          style="border-color:${m.color || '#6366f1'}">
          ${completed
            ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${m.color||'#6366f1'}" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`
            : `<span style="width:8px;height:8px;border-radius:50%;background:${m.color||'#6366f1'};display:inline-block"></span>`}
        </button>
        <div class="ms-row-info">
          <div class="ms-row-title ${completed ? 'done' : ''}">${m.title}</div>
          ${m.description ? `<div class="ms-row-desc">${m.description}</div>` : ''}
        </div>
      </div>
      <div class="ms-row-right">
        ${m.due_date
          ? `<span class="ms-due ${od ? 'overdue' : completed ? 'done' : ''}">
              ${completed ? '✅' : od ? '⚠️' : '📅'} ${formatDate(m.due_date)}
            </span>`
          : ''}
        <span class="ms-status-pill ${completed ? 'completed' : od ? 'overdue' : 'open'}">
          ${completed ? 'Completed' : od ? 'Overdue' : 'Open'}
        </span>
        <button class="ms-delete-btn btn-icon" data-project-id="${projectId}" data-milestone-id="${m.id}" title="Delete" style="color:#dc2626;opacity:.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
        </button>
      </div>
    </div>`;
}
