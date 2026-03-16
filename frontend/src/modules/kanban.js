import { getKanbanBoard, moveTask, createTask } from '@api/tasks.js';
import { showToast } from '@components/toast.js';
import { priorityBadge, formatDate, isOverdue, avatarUrl } from '@utils/helpers.js';
import { store } from '@store/store.js';
import Sortable from 'sortablejs';

const COLS = [
  { key:'backlog',     label:'Backlog',      color:'#94a3b8' },
  { key:'todo',        label:'To Do',        color:'#3b82f6' },
  { key:'in_progress', label:'In Progress',  color:'#f59e0b' },
  { key:'review',      label:'Review',       color:'#8b5cf6' },
  { key:'completed',   label:'Completed',    color:'#10b981' },
];

export async function renderKanban(projectId) {
  return async (container) => {
    container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;
    let board;
    try { board = await getKanbanBoard(projectId); }
    catch { container.innerHTML = `<div class="full-empty"><div class="full-empty-icon">⚠️</div><h3>Could not load board</h3></div>`; return; }

    const allTasks  = COLS.flatMap(c => board[c.key] || []);
    const overdueN  = allTasks.filter(t => isOverdue(t.due_date, t.status)).length;
    const activeTimN = allTasks.filter(t => t.active_timer).length;

    container.innerHTML = `
      <div class="kb-topbar">
        <div class="kb-col-summary">
          ${COLS.map(c => `
            <div class="kb-summary-pill">
              <span class="kb-summary-dot" style="background:${c.color}"></span>
              <span>${c.label}</span>
              <strong id="kb-count-${c.key}">${(board[c.key]||[]).length}</strong>
            </div>`).join('')}
        </div>
        <div class="kb-topbar-meta">
          ${overdueN   > 0 ? `<span class="kb-meta-badge red">⚠ ${overdueN} overdue</span>` : ''}
          ${activeTimN > 0 ? `<span class="kb-meta-badge purple">⏱ ${activeTimN} timing</span>` : ''}
        </div>
      </div>
      <div class="kanban-wrap" id="kanban-board">
        ${COLS.map(c => renderColumn(c, board[c.key] || [])).join('')}
      </div>`;

    initDragDrop(container, projectId);
    bindAddTask(container, projectId, board);
    bindTimerButtons(container);
  };
}

function renderColumn(col, tasks) {
  return `
    <div class="kb-col" data-col="${col.key}">
      <div class="kb-col-header">
        <span class="kb-col-dot" style="background:${col.color}"></span>
        <span class="kb-col-title">${col.label}</span>
        <span class="kb-col-count" id="kb-count-${col.key}">${tasks.length}</span>
      </div>
      <div class="kb-col-body sortable-list" id="kb-col-${col.key}" data-status="${col.key}">
        ${tasks.map(t => kbCard(t)).join('')}
        <button class="kb-add-btn" data-add-col="${col.key}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
          Add task
        </button>
      </div>
    </div>`;
}

function kbCard(t) {
  const od      = isOverdue(t.due_date, t.status);
  const canTime = t.status !== 'completed';
  return `
    <div class="kb-card ${od?'overdue':''} ${t.is_blocked?'blocked':''} ${t.active_timer?'timing':''}" data-task-id="${t.id}">
      ${(t.tags||[]).length > 0 ? `<div class="kb-card-tags">${t.tags.map(tag => `<span style="padding:1px 6px;border-radius:3px;font-size:10.5px;font-weight:700;background:${tag.color}20;color:${tag.color}">${tag.name}</span>`).join('')}</div>` : ''}
      <div class="kb-card-title-row">
        <div class="kb-card-title">${t.title}</div>
        ${canTime ? `<button class="kb-timer-btn ${t.active_timer ? 'running' : ''}" data-timer-task-id="${t.id}" title="${t.active_timer ? 'Timer running' : 'Start timer'}">
          ${t.active_timer
            ? `<svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
            : `<svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`}
        </button>` : ''}
      </div>
      ${t.is_blocked ? `<div style="font-size:11px;color:#d97706;font-weight:600;margin-bottom:6px">🔒 Blocked</div>` : ''}
      <div class="kb-card-footer">
        <div class="kb-card-footer-l">
          ${priorityBadge(t.priority)}
          ${t.subtasks_count > 0 ? `<span style="font-size:11px;color:#94a3b8">⊞ ${t.subtasks_count}</span>` : ''}
          ${t.active_timer ? `<span class="kb-timing-badge">⏱ live</span>` : ''}
        </div>
        <div class="kb-card-footer-r">
          ${t.due_date ? `<span class="kb-card-due ${od?'overdue':''}">📅 ${formatDate(t.due_date)}</span>` : ''}
          <div class="kb-card-avs">
            ${(t.assignees||[]).slice(0,3).map(a => `<img src="${avatarUrl(a)}" title="${a.name}" alt="${a.name}"/>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
}

function initDragDrop(container, projectId) {
  container.querySelectorAll('.sortable-list').forEach(list => {
    Sortable.create(list, {
      group: 'kanban',
      animation: 160,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      handle: '.kb-card',
      filter: '.kb-add-btn',

      onEnd: async evt => {
        const taskId = parseInt(evt.item.dataset.taskId);
        if (!taskId) return;
        const newStatus = evt.to.dataset.status;
        updateCount(evt.from); updateCount(evt.to);
        evt.item.classList.add('moving');
        try {
          await moveTask(taskId, { status: newStatus, position: evt.newIndex });
          showToast(`→ ${COLS.find(c => c.key === newStatus)?.label || newStatus}`, 'success', 1800);
        } catch {
          evt.from.insertBefore(evt.item, evt.from.children[evt.oldIndex]);
          updateCount(evt.from); updateCount(evt.to);
          showToast('Failed to move task', 'error');
        }
        evt.item.classList.remove('moving');
      },
    });
  });
}

function updateCount(list) {
  const col = list.closest('.kb-col');
  if (!col) return;
  const status = col.dataset.col;
  const count  = list.querySelectorAll('.kb-card').length;
  // Update both summary pill (topbar) and column header badge
  const summaryBadge = document.getElementById(`kb-count-${status}`);
  if (summaryBadge) summaryBadge.textContent = count;
  const colBadge = col.querySelector('.kb-col-count');
  if (colBadge) colBadge.textContent = count;
}

function bindAddTask(container, projectId, board) {
  container.querySelectorAll('[data-add-col]').forEach(btn => {
    btn.addEventListener('click', () => {
      const status = btn.dataset.addCol;
      openQuickAddModal(container, projectId, status, board);
    });
  });

  container.querySelectorAll('.kb-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.kb-timer-btn')) return;
      import('../js/router.js').then(m => m.router.navigate(`/tasks/${card.dataset.taskId}`));
    });
  });
}

function bindTimerButtons(container) {
  container.querySelectorAll('.kb-timer-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const taskId = btn.dataset.timerTaskId;
      const isRunning = btn.classList.contains('running');

      if (!isRunning && store.get('activeTimer')) {
        showToast('Stop the current timer first', 'error');
        return;
      }

      btn.disabled = true;
      try {
        const { handleTimerAction } = await import('./timer.js');
        if (isRunning) {
          await handleTimerAction(taskId, 'stop');
          btn.classList.remove('running');
          btn.innerHTML = `<svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
          btn.title = 'Start timer';
          btn.closest('.kb-card')?.classList.remove('timing');
        } else {
          await handleTimerAction(taskId, 'start');
          btn.classList.add('running');
          btn.innerHTML = `<svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
          btn.title = 'Timer running';
          btn.closest('.kb-card')?.classList.add('timing');
        }
        btn.disabled = false;
      } catch {
        btn.disabled = false;
      }
    });
  });
}

function openQuickAddModal(container, projectId, status, board) {
  import('@components/modal.js').then(({ openModal, closeModal }) => {
    openModal({
      title: `Add Task — ${COLS.find(c => c.key === status)?.label}`,
      body: `
        <form id="quick-add-form">
          <div class="form-group">
            <label class="form-label">Task Title *</label>
            <input name="title" class="form-input" placeholder="What needs to be done?" required autofocus/>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Priority</label>
              <select name="priority" class="form-input form-select">
                <option value="low">🟢 Low</option>
                <option value="medium" selected>🔵 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Due Date</label>
              <input type="date" name="due_date" class="form-input"/>
            </div>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px;padding-top:12px;border-top:1px solid #e2e8f0">
            <button type="button" class="btn btn-ghost" id="qa-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary" id="qa-submit">Add Task</button>
          </div>
        </form>`,
    });

    document.getElementById('qa-cancel').addEventListener('click', closeModal);
    document.getElementById('quick-add-form').addEventListener('submit', async e => {
      e.preventDefault();
      const btn = document.getElementById('qa-submit');
      btn.disabled = true; btn.textContent = 'Adding…';
      const data = Object.fromEntries(new FormData(e.target));
      Object.keys(data).forEach(k => { if (data[k] === '') delete data[k]; });
      data.status = status;
      try {
        await createTask(projectId, data);
        closeModal();
        showToast('Task added', 'success');
        const { renderKanban } = await import('./kanban.js');
        (await renderKanban(projectId))(container);
      } catch { btn.disabled = false; btn.textContent = 'Add Task'; }
    });
  });
}
