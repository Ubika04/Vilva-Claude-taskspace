/**
 * Dependencies Module — View, add, complete, and manage task dependencies.
 */

import { api } from '@api/apiClient.js';
import { showToast } from '@components/toast.js';
import { statusPill, priorityBadge, formatDate, isOverdue, avatarUrl } from '@utils/helpers.js';

let _container = null;

export async function renderDependencies(container) {
  _container = container;
  container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  let data;
  try {
    data = await api.get('/dependencies/all');
  } catch {
    container.innerHTML = `<div class="full-empty"><div class="full-empty-icon">⚠️</div><h3>Could not load dependencies</h3></div>`;
    return;
  }

  const blocked  = data.blocked || [];
  const blocking = data.blocking || [];
  const activeBlocked = blocked.filter(t => t.is_blocked);
  const resolvedBlocked = blocked.filter(t => !t.is_blocked);

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Dependencies</h1>
        <p>${blocked.length + blocking.length} dependency relationships across all projects</p>
      </div>
      <div class="page-header-right">
        <button class="btn btn-primary btn-sm" id="add-dep-page-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
          Add Dependency
        </button>
      </div>
    </div>

    <div class="dep-page-stats">
      <div class="stat-card">
        <div class="stat-icon stat-icon-red">🔒</div>
        <div class="stat-info"><span class="stat-val">${activeBlocked.length}</span><span class="stat-label">Currently Blocked</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-green">✅</div>
        <div class="stat-info"><span class="stat-val">${resolvedBlocked.length}</span><span class="stat-label">Resolved</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-purple">➡</div>
        <div class="stat-info"><span class="stat-val">${blocking.length}</span><span class="stat-label">Blocking Others</span></div>
      </div>
    </div>

    ${activeBlocked.length > 0 ? `
    <div class="section-card" style="margin-bottom:20px">
      <div class="section-head"><span class="section-title" style="color:#dc2626">🔒 Currently Blocked (${activeBlocked.length})</span></div>
      <div class="dep-task-list">${activeBlocked.map(t => depCard(t, 'blocked')).join('')}</div>
    </div>` : ''}

    ${resolvedBlocked.length > 0 ? `
    <div class="section-card" style="margin-bottom:20px">
      <div class="section-head"><span class="section-title" style="color:#10b981">✅ Resolved Dependencies (${resolvedBlocked.length})</span></div>
      <div class="dep-task-list">${resolvedBlocked.map(t => depCard(t, 'blocked')).join('')}</div>
    </div>` : ''}

    ${blocking.length > 0 ? `
    <div class="section-card" style="margin-bottom:20px">
      <div class="section-head"><span class="section-title" style="color:#6366f1">➡ Blocking Other Tasks (${blocking.length})</span></div>
      <div class="dep-task-list">${blocking.map(t => depCard(t, 'blocking')).join('')}</div>
    </div>` : ''}

    ${blocked.length === 0 && blocking.length === 0 ? `
    <div class="full-empty">
      <div class="full-empty-icon">✅</div>
      <h3>No dependencies found</h3>
      <p>Click "Add Dependency" to create one.</p>
    </div>` : ''}`;

  bindEvents(container);
}

function bindEvents(container) {
  // Add Dependency
  document.getElementById('add-dep-page-btn')?.addEventListener('click', () => openAddDepModal());

  // Open task
  container.querySelectorAll('.dep-go-task').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      if (el.dataset.taskId) {
        import('../js/router.js').then(m => m.router.navigate(`/tasks/${el.dataset.taskId}`));
      }
    });
  });

  // Remove dependency
  container.querySelectorAll('.dep-rm-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      if (!confirm('Remove this dependency?')) return;
      try {
        await api.delete(`/tasks/${btn.dataset.taskId}/dependencies/${btn.dataset.depId}`);
        showToast('Dependency removed', 'success');
        renderDependencies(_container);
      } catch { showToast('Failed to remove', 'error'); }
    });
  });

  // Complete task (mark as done)
  container.querySelectorAll('.dep-complete-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const taskId = btn.dataset.taskId;
      const taskTitle = btn.dataset.taskTitle || 'this task';
      if (!confirm(`Mark "${taskTitle}" as completed?`)) return;
      try {
        await api.post(`/tasks/${taskId}/move`, { status: 'completed' });
        showToast(`"${taskTitle}" completed`, 'success');
        renderDependencies(_container);
      } catch { showToast('Failed to complete task', 'error'); }
    });
  });

  // Complete blocker task (resolve the blocking dependency)
  container.querySelectorAll('.dep-complete-blocker-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const blockerId = btn.dataset.blockerId;
      const blockerTitle = btn.dataset.blockerTitle || 'this task';
      if (!confirm(`Mark blocker "${blockerTitle}" as completed? This will unblock dependent tasks.`)) return;
      try {
        await api.post(`/tasks/${blockerId}/move`, { status: 'completed' });
        showToast(`"${blockerTitle}" completed — dependencies resolved`, 'success');
        renderDependencies(_container);
      } catch { showToast('Failed to complete blocker', 'error'); }
    });
  });

  // Close dependency (complete task + remove dependency link)
  container.querySelectorAll('.dep-close-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const taskId = btn.dataset.taskId;
      const depId = btn.dataset.depId;
      const taskTitle = btn.dataset.taskTitle || 'this dependency';
      if (!confirm(`Close dependency and remove the link between tasks?`)) return;
      try {
        await api.delete(`/tasks/${taskId}/dependencies/${depId}`);
        showToast(`Dependency closed`, 'success');
        renderDependencies(_container);
      } catch { showToast('Failed to close dependency', 'error'); }
    });
  });

  // Expand/collapse
  container.querySelectorAll('.dep-toggle-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const panel = btn.closest('.dep-task-card').querySelector('.dep-detail-panel');
      if (panel) {
        const hidden = panel.classList.toggle('hidden');
        btn.textContent = hidden ? 'Details ▾' : 'Details ▴';
      }
    });
  });
}

function depCard(t, type) {
  const od = isOverdue(t.due_date, t.status);
  const deps = type === 'blocked' ? (t.blocked_by || []) : (t.blocking || []);
  const assignees = t.assignees || [];
  const isCompleted = t.status === 'completed';

  return `
    <div class="dep-task-card ${isCompleted ? 'dep-completed' : ''}">
      <div class="dep-task-header">
        <div class="dep-task-info">
          ${priorityBadge(t.priority)}
          <a href="#/tasks/${t.id}" class="dep-task-title dep-go-task" data-task-id="${t.id}">${t.title}</a>
          ${statusPill(t.status)}
          ${t.is_blocked ? `<span class="dep-blocked-tag">🔒 BLOCKED</span>` : ''}
        </div>
        <div class="dep-task-meta">
          ${assignees.length > 0 ? `<div class="dep-avatars">${assignees.slice(0, 4).map(a => `<img src="${a.avatar_url || avatarUrl(a)}" title="${a.name}" class="dep-av"/>`).join('')}${assignees.length > 4 ? `<span class="dep-av-more">+${assignees.length - 4}</span>` : ''}</div>` : ''}
          ${t.project ? `<span class="task-proj-chip" style="background:${t.project.color}18;color:${t.project.color}">${t.project.name}</span>` : ''}
          ${t.due_date ? `<span class="task-due ${od ? 'overdue' : ''}" style="font-size:12px">📅 ${formatDate(t.due_date)}</span>` : ''}
          ${!isCompleted ? `<button class="btn btn-sm dep-complete-btn" style="background:#10b981;color:#fff;font-size:11px;padding:3px 10px" data-task-id="${t.id}" data-task-title="${esc(t.title)}" title="Mark as completed">✓ Complete</button>` : ''}
          <button class="btn btn-ghost btn-sm dep-toggle-btn" style="font-size:11px;padding:2px 8px">Details ▾</button>
        </div>
      </div>

      <div class="dep-chain">
        ${deps.map(d => {
          const da = d.assignees || [];
          const dCompleted = d.status === 'completed';
          return `
          <div class="dep-chain-item ${type === 'blocked' ? (dCompleted ? 'resolved' : 'blocked') : 'blocking'}">
            <span class="dep-chain-icon">${type === 'blocked' ? (dCompleted ? '✅' : '🔒') : '➡'}</span>
            <a href="#/tasks/${d.id}" class="dep-chain-title dep-go-task" data-task-id="${d.id}">${d.title}</a>
            ${statusPill(d.status)}
            ${da.length > 0 ? `<div class="dep-chain-avs">${da.slice(0, 3).map(a => `<img src="${a.avatar_url || avatarUrl(a)}" title="${a.name}" class="dep-av-sm"/>`).join('')}</div>` : ''}
            <div class="dep-chain-actions">
              ${type === 'blocked' && !dCompleted ? `<button class="dep-complete-blocker-btn" data-blocker-id="${d.id}" data-blocker-title="${esc(d.title)}" title="Complete blocker to unblock">✓</button>` : ''}
              <button class="dep-close-btn" data-task-id="${t.id}" data-dep-id="${d.id}" data-task-title="${esc(t.title)}" title="Close & remove dependency">✕</button>
            </div>
          </div>`;
        }).join('')}
      </div>

      <div class="dep-detail-panel hidden">
        <div class="dep-detail-grid">
          <div class="dep-detail-col">
            <div class="dep-detail-label">Task Details</div>
            <div style="font-size:14px;font-weight:600;margin:4px 0">${t.title}</div>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:4px 0">
              ${statusPill(t.status)} ${priorityBadge(t.priority)}
              ${t.task_type ? `<span style="font-size:11px;background:var(--s3);padding:2px 8px;border-radius:10px">${t.task_type}</span>` : ''}
            </div>
            ${t.due_date ? `<div style="margin-top:4px;font-size:12.5px" class="${od ? 'overdue' : ''}">📅 Due: ${formatDate(t.due_date)}</div>` : ''}
            ${t.project ? `<div style="margin-top:4px"><span class="task-proj-chip" style="background:${t.project.color}18;color:${t.project.color}">${t.project.name}</span></div>` : ''}
          </div>
          <div class="dep-detail-col">
            <div class="dep-detail-label">Assigned Members</div>
            ${assignees.length > 0 ? assignees.map(a => `
              <div class="dep-detail-member">
                <img src="${a.avatar_url || avatarUrl(a)}" class="dep-av"/>
                <span>${a.name}</span>
              </div>`).join('') : '<span style="color:var(--muted);font-size:12px">No one assigned</span>'}

            <div class="dep-detail-label" style="margin-top:12px">${type === 'blocked' ? 'Blocked By' : 'Blocking'} (${deps.length})</div>
            ${deps.map(d => {
              const da = d.assignees || [];
              const dCompleted = d.status === 'completed';
              return `
              <div class="dep-detail-dep-row">
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                  <span>${type === 'blocked' ? (dCompleted ? '✅' : '🔒') : '➡'}</span>
                  <a href="#/tasks/${d.id}" class="dep-go-task" data-task-id="${d.id}" style="font-weight:600;color:var(--brand);cursor:pointer">${d.title}</a>
                  ${statusPill(d.status)}
                  ${type === 'blocked' && !dCompleted ? `<button class="btn btn-sm dep-complete-blocker-btn" style="background:#10b981;color:#fff;font-size:10px;padding:2px 8px;border-radius:4px" data-blocker-id="${d.id}" data-blocker-title="${esc(d.title)}">✓ Complete Blocker</button>` : ''}
                  <button class="btn btn-sm dep-close-btn" style="font-size:10px;padding:2px 8px;color:var(--red)" data-task-id="${t.id}" data-dep-id="${d.id}" data-task-title="${esc(t.title)}">✕ Remove Link</button>
                </div>
                ${da.length > 0 ? `<div style="display:flex;gap:4px;margin-top:4px;align-items:center">${da.map(a => `<img src="${a.avatar_url || avatarUrl(a)}" title="${a.name}" class="dep-av-sm" style="margin-left:0"/><span style="font-size:11px">${a.name}</span>`).join('')}</div>` : '<div style="font-size:11px;color:var(--muted);margin-top:2px">Unassigned</div>'}
              </div>`;
            }).join('')}
          </div>
        </div>
        <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
          ${!isCompleted ? `<button class="btn btn-sm dep-complete-btn" style="background:#10b981;color:#fff" data-task-id="${t.id}" data-task-title="${esc(t.title)}">✓ Complete Task</button>` : ''}
          <button class="btn btn-primary btn-sm dep-go-task" data-task-id="${t.id}">Open Task →</button>
        </div>
      </div>
    </div>`;
}

function esc(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── Add Dependency Modal ──────────────────────────────────────────────────

async function openAddDepModal() {
  let projects = [];
  try {
    const res = await api.get('/projects');
    projects = res.data || [];
  } catch {}

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:520px">
      <div class="modal-header bg-white">
        <h3 class='text-white'>Add Dependency</h3>
        <button class="modal-close" id="adm-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Project <span style="color:var(--red)">*</span></label>
          <select class="form-input form-select" id="adm-project">
            <option value="">— Select project —</option>
            ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Task (will be blocked) <span style="color:var(--red)">*</span></label>
          <select class="form-input form-select" id="adm-task" disabled>
            <option value="">— Select project first —</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Depends on (blocker) <span style="color:var(--red)">*</span></label>
          <select class="form-input form-select" id="adm-depends" disabled>
            <option value="">— Select project first —</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Dependency Type</label>
          <select class="form-input form-select" id="adm-type">
            <option value="finish_to_start">Finish to Start (most common)</option>
            <option value="start_to_start">Start to Start</option>
            <option value="finish_to_finish">Finish to Finish</option>
            <option value="start_to_finish">Start to Finish</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="adm-cancel">Cancel</button>
        <button class="btn btn-primary" id="adm-submit">Add Dependency</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));

  const close = () => { overlay.remove(); };
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.getElementById('adm-close').addEventListener('click', close);
  document.getElementById('adm-cancel').addEventListener('click', close);

  document.getElementById('adm-project').addEventListener('change', async function () {
    const pid = this.value;
    const taskSel = document.getElementById('adm-task');
    const depsSel = document.getElementById('adm-depends');
    if (!pid) {
      taskSel.disabled = depsSel.disabled = true;
      taskSel.innerHTML = depsSel.innerHTML = '<option value="">— Select project first —</option>';
      return;
    }
    taskSel.innerHTML = depsSel.innerHTML = '<option value="">Loading…</option>';
    try {
      const res = await api.get(`/projects/${pid}/tasks`, { per_page: 200 });
      const tasks = res.data || [];
      const opts = tasks.map(t => `<option value="${t.id}">${t.title} (${t.status})</option>`).join('');
      taskSel.innerHTML = `<option value="">— Select task —</option>${opts}`;
      depsSel.innerHTML = `<option value="">— Select blocker —</option>${opts}`;
      taskSel.disabled = depsSel.disabled = false;
    } catch {
      taskSel.innerHTML = depsSel.innerHTML = '<option value="">Failed to load</option>';
    }
  });

  document.getElementById('adm-submit').addEventListener('click', async () => {
    const taskId = document.getElementById('adm-task').value;
    const dependsOnId = document.getElementById('adm-depends').value;
    const type = document.getElementById('adm-type').value;
    if (!taskId || !dependsOnId) { showToast('Select both tasks', 'error'); return; }
    if (taskId === dependsOnId) { showToast('A task cannot depend on itself', 'error'); return; }
    try {
      await api.post(`/tasks/${taskId}/dependencies`, { depends_on_id: parseInt(dependsOnId), type });
      showToast('Dependency added', 'success');
      close();
      if (_container) renderDependencies(_container);
    } catch (err) { showToast(err?.message || 'Failed to add', 'error'); }
  });
}
