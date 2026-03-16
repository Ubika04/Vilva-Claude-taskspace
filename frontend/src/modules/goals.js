/**
 * Goals Module — Personal goal tracking with progress bars.
 */

import { getGoals, createGoal, updateGoal, deleteGoal } from '@api/goals.js';
import { openModal, closeModal } from '@components/modal.js';
import { showToast } from '@components/toast.js';
import { formatDate, isOverdue } from '@utils/helpers.js';

export async function renderGoals(container) {
  container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  let goals = [];
  try {
    const res = await getGoals();
    goals     = res.data || [];
  } catch {
    container.innerHTML = `<div class="full-empty"><div class="full-empty-icon">⚠️</div><h3>Could not load goals</h3></div>`;
    return;
  }

  const active    = goals.filter(g => g.status === 'active');
  const completed = goals.filter(g => g.status === 'completed');
  const paused    = goals.filter(g => g.status === 'paused');

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Goals</h1>
        <p>Track progress toward your personal targets</p>
      </div>
      <div class="page-header-right">
        <button class="btn btn-primary" id="new-goal-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
          New Goal
        </button>
      </div>
    </div>

    <div class="goals-overview-strip">
      ${goalStatPill('🎯', active.length, 'Active', '#6366f1')}
      ${goalStatPill('✅', completed.length, 'Completed', '#16a34a')}
      ${goalStatPill('⏸',  paused.length, 'Paused', '#64748b')}
      ${goalStatPill('📈', goals.length > 0 ? Math.round(goals.reduce((a, g) => a + g.progress_percent, 0) / goals.length) + '%' : '—', 'Avg. Progress', '#f59e0b')}
    </div>

    ${active.length > 0 ? `
    <div class="goals-section">
      <div class="goals-section-title">Active Goals</div>
      <div class="goals-grid">
        ${active.map(g => goalCard(g)).join('')}
      </div>
    </div>` : ''}

    ${paused.length > 0 ? `
    <div class="goals-section">
      <div class="goals-section-title">Paused</div>
      <div class="goals-grid">
        ${paused.map(g => goalCard(g)).join('')}
      </div>
    </div>` : ''}

    ${completed.length > 0 ? `
    <div class="goals-section">
      <div class="goals-section-title">Completed</div>
      <div class="goals-grid">
        ${completed.map(g => goalCard(g)).join('')}
      </div>
    </div>` : ''}

    ${goals.length === 0 ? `
    <div class="full-empty">
      <div class="full-empty-icon">🎯</div>
      <h3>No goals yet</h3>
      <p>Create your first goal and start tracking your progress</p>
    </div>` : ''}
  `;

  document.getElementById('new-goal-btn').addEventListener('click', () => openGoalModal(container, null));

  // Edit goal
  container.querySelectorAll('.goal-edit-btn').forEach(btn => {
    const goal = goals.find(g => g.id == btn.dataset.goalId);
    if (goal) btn.addEventListener('click', () => openGoalModal(container, goal));
  });

  // Delete goal
  container.querySelectorAll('.goal-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this goal?')) return;
      try {
        await deleteGoal(btn.dataset.goalId);
        showToast('Goal deleted', 'success');
        renderGoals(container);
      } catch { showToast('Delete failed', 'error'); }
    });
  });

  // Quick update progress
  container.querySelectorAll('.goal-update-form').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const goalId = form.dataset.goalId;
      const input  = form.querySelector('.goal-update-input');
      const val    = parseFloat(input.value);
      if (isNaN(val) || val < 0) return;
      try {
        await updateGoal(goalId, { current_value: val });
        showToast('Progress updated', 'success');
        renderGoals(container);
      } catch { showToast('Update failed', 'error'); }
    });
  });

  // Toggle status
  container.querySelectorAll('.goal-status-toggle').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { goalId, currentStatus } = btn.dataset;
      const newStatus = currentStatus === 'paused' ? 'active' : 'paused';
      try {
        await updateGoal(goalId, { status: newStatus });
        showToast(newStatus === 'active' ? 'Goal resumed' : 'Goal paused', 'success');
        renderGoals(container);
      } catch { showToast('Update failed', 'error'); }
    });
  });
}

function goalStatPill(icon, val, label, color) {
  return `
    <div class="goal-overview-pill" style="border-left:3px solid ${color}">
      <span class="goal-pill-icon">${icon}</span>
      <div>
        <div class="goal-pill-val" style="color:${color}">${val}</div>
        <div class="goal-pill-lbl">${label}</div>
      </div>
    </div>`;
}

function goalCard(g) {
  const pct      = g.progress_percent;
  const od       = g.status === 'active' && isOverdue(g.due_date, 'active');
  const statusCls = { active: 'active', completed: 'completed', paused: 'paused' }[g.status] || 'active';

  const barColor = pct >= 100 ? '#16a34a' : pct >= 60 ? '#6366f1' : pct >= 30 ? '#f59e0b' : '#dc2626';

  return `
    <div class="goal-card ${g.status === 'completed' ? 'goal-done' : ''}">
      <div class="goal-card-top">
        <div class="goal-card-color-bar" style="background:${g.color || '#6366f1'}"></div>
        <div class="goal-card-header">
          <div class="goal-card-title">${g.title}</div>
          <div class="goal-card-actions">
            <button class="btn-icon goal-edit-btn" data-goal-id="${g.id}" title="Edit">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            ${g.status !== 'completed' ? `
            <button class="btn-icon goal-status-toggle" data-goal-id="${g.id}" data-current-status="${g.status}"
              title="${g.status === 'paused' ? 'Resume' : 'Pause'}">
              ${g.status === 'paused'
                ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>`
                : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`}
            </button>` : ''}
            <button class="btn-icon goal-delete-btn" data-goal-id="${g.id}" title="Delete" style="color:#dc2626">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
            </button>
          </div>
        </div>
        ${g.description ? `<div class="goal-card-desc">${g.description}</div>` : ''}
      </div>

      <div class="goal-progress-section">
        <div class="goal-progress-nums">
          <span class="goal-current" style="color:${barColor}">${g.current_value}</span>
          <span class="goal-sep">/</span>
          <span class="goal-target">${g.target_value} ${g.unit || ''}</span>
          <span class="goal-pct-badge" style="background:${barColor}18;color:${barColor}">${pct}%</span>
        </div>
        <div class="goal-pbar-wrap">
          <div class="goal-pbar" style="width:${pct}%;background:${barColor}"></div>
        </div>
      </div>

      ${g.status !== 'completed' ? `
      <form class="goal-update-form" data-goal-id="${g.id}">
        <input type="number" class="goal-update-input form-input" value="${g.current_value}"
          min="0" max="${g.target_value}" step="any" style="width:100px;height:30px;font-size:12px;padding:4px 8px"/>
        <button type="submit" class="btn btn-primary btn-sm" style="height:30px;font-size:12px">Update</button>
      </form>` : `
      <div class="goal-completed-badge">🎉 Goal achieved!</div>`}

      <div class="goal-card-footer">
        <span class="goal-status-tag ${statusCls}">${g.status}</span>
        ${g.due_date ? `<span class="goal-due ${od ? 'overdue' : ''}">📅 ${formatDate(g.due_date)}</span>` : ''}
      </div>
    </div>`;
}

function openGoalModal(container, goal) {
  const isEdit = !!goal;

  openModal({
    title: isEdit ? 'Edit Goal' : 'New Goal',
    body: `
      <form id="goal-form">
        <div class="form-group">
          <label class="form-label">Goal Title *</label>
          <input name="title" class="form-input" value="${isEdit ? goal.title : ''}" placeholder="What do you want to achieve?" required autofocus/>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea name="description" class="form-input form-textarea" placeholder="Describe your goal…">${isEdit ? (goal.description || '') : ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Target Value *</label>
            <input type="number" name="target_value" class="form-input" value="${isEdit ? goal.target_value : '100'}" min="1" required/>
          </div>
          <div class="form-group">
            <label class="form-label">Current Value</label>
            <input type="number" name="current_value" class="form-input" value="${isEdit ? goal.current_value : '0'}" min="0"/>
          </div>
          <div class="form-group">
            <label class="form-label">Unit</label>
            <input name="unit" class="form-input" value="${isEdit ? (goal.unit || '%') : '%'}" placeholder="%, tasks, hours…"/>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Start Date</label>
            <input type="date" name="start_date" class="form-input" value="${isEdit && goal.start_date ? goal.start_date.slice(0,10) : ''}"/>
          </div>
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input type="date" name="due_date" class="form-input" value="${isEdit && goal.due_date ? goal.due_date.slice(0,10) : ''}"/>
          </div>
          <div class="form-group">
            <label class="form-label">Color</label>
            <input type="color" name="color" class="form-input" value="${isEdit ? (goal.color || '#6366f1') : '#6366f1'}" style="height:40px;padding:4px 6px;cursor:pointer"/>
          </div>
        </div>
        ${isEdit ? `
        <div class="form-group">
          <label class="form-label">Status</label>
          <select name="status" class="form-input form-select">
            <option value="active" ${goal.status==='active'?'selected':''}>Active</option>
            <option value="paused" ${goal.status==='paused'?'selected':''}>Paused</option>
            <option value="completed" ${goal.status==='completed'?'selected':''}>Completed</option>
          </select>
        </div>` : ''}
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px;padding-top:14px;border-top:1px solid #e2e8f0">
          <button type="button" class="btn btn-ghost" id="goal-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary" id="goal-submit">
            ${isEdit ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </form>`,
  });

  document.getElementById('goal-cancel').addEventListener('click', closeModal);

  document.getElementById('goal-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('goal-submit');
    btn.disabled = true; btn.textContent = 'Saving…';

    const fd = Object.fromEntries(new FormData(e.target));
    Object.keys(fd).forEach(k => { if (fd[k] === '') delete fd[k]; });

    try {
      if (isEdit) {
        await updateGoal(goal.id, fd);
        showToast('Goal updated', 'success');
      } else {
        await createGoal(fd);
        showToast('Goal created!', 'success');
      }
      closeModal();
      renderGoals(container);
    } catch {
      btn.disabled = false;
      btn.textContent = isEdit ? 'Save Changes' : 'Create Goal';
    }
  });
}
