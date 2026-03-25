/**
 * Task Side Panel — Quick view/edit without leaving current page
 */
import { getTask, updateTask } from '@api/tasks.js';
import { showToast } from '@components/toast.js';
import { priorityBadge, statusPill, formatDate, avatarUrl } from '@utils/helpers.js';

const TYPE_ICONS = { feature:'✨', bug:'🐛', improvement:'🔧', story:'📖', spike:'🔬', chore:'🧹', task:'📋' };

export function openSidePanel(taskId) {
  const overlay = document.getElementById('side-panel-overlay');
  const header  = document.getElementById('side-panel-header');
  const body    = document.getElementById('side-panel-body');
  if (!overlay || !header || !body) return;

  overlay.classList.remove('hidden');
  body.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;
  header.innerHTML = '';

  loadTask(taskId, header, body, overlay);

  // Close on overlay click
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeSidePanel();
  });

  // Close on Escape
  const onKey = e => { if (e.key === 'Escape') { closeSidePanel(); document.removeEventListener('keydown', onKey); } };
  document.addEventListener('keydown', onKey);
}

export function closeSidePanel() {
  document.getElementById('side-panel-overlay')?.classList.add('hidden');
}

async function loadTask(taskId, header, body, overlay) {
  try {
    const task = await getTask(taskId);
    const typeIcon = TYPE_ICONS[task.task_type] || TYPE_ICONS.task;

    header.innerHTML = `
      <div class="sp-header-top">
        <div class="sp-type-badge">${typeIcon} ${(task.task_type || 'task')}</div>
        <div class="sp-header-actions">
          <button class="btn btn-ghost btn-sm sp-open-full" data-task-id="${task.id}" title="Open full detail">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
          </button>
          <button class="btn btn-ghost btn-sm sp-close" title="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
      <div class="sp-title" contenteditable="true" id="sp-title">${task.title}</div>
      <div class="sp-pills">
        ${priorityBadge(task.priority)}
        ${statusPill(task.status)}
        ${task.is_reviewed ? `<span class="reviewed-badge-lg">✓ Reviewed</span>` : ''}
        ${task.score ? `<span class="score-badge-lg">${task.score}pts</span>` : ''}
      </div>`;

    body.innerHTML = `
      <div class="sp-section">
        <label class="sp-label">Status</label>
        <select class="form-input form-select" id="sp-status">
          ${['backlog','todo','in_progress','working_on','review','completed'].map(s =>
            `<option value="${s}" ${task.status===s?'selected':''}>${{backlog:'Backlog',todo:'To Do',in_progress:'In Progress',working_on:'🔥 Working On',review:'Review',completed:'Completed'}[s]}</option>`
          ).join('')}
        </select>
      </div>
      <div class="sp-section">
        <label class="sp-label">Priority</label>
        <select class="form-input form-select" id="sp-priority">
          ${['low','medium','high','urgent'].map(p =>
            `<option value="${p}" ${task.priority===p?'selected':''}>${{low:'🟢 Low',medium:'🔵 Medium',high:'🟠 High',urgent:'🔴 Urgent'}[p]}</option>`
          ).join('')}
        </select>
      </div>
      <div class="sp-section">
        <label class="sp-label">Task Type</label>
        <select class="form-input form-select" id="sp-type">
          ${['task','feature','bug','improvement','story','spike','chore'].map(t =>
            `<option value="${t}" ${task.task_type===t?'selected':''}>${TYPE_ICONS[t]} ${t}</option>`
          ).join('')}
        </select>
      </div>
      <div class="sp-section">
        <label class="sp-label">Due Date</label>
        <input type="date" class="form-input" id="sp-due" value="${task.due_date || ''}"/>
      </div>
      <div class="sp-section">
        <label class="sp-label">Assignees</label>
        <div class="sp-assignees">
          ${(task.assignees || []).map(a => `
            <div class="sp-assignee">
              <img src="${avatarUrl(a)}" class="av-xs"/>
              <span>${a.name}</span>
            </div>`).join('') || '<span style="color:#94a3b8;font-size:13px">Unassigned</span>'}
        </div>
      </div>
      <div class="sp-section">
        <label class="sp-label">Description</label>
        <div class="sp-desc" id="sp-desc" contenteditable="true" data-placeholder="Add description…">${task.description || ''}</div>
      </div>
      <div class="sp-section">
        <label class="sp-label">Tags</label>
        <div class="sp-tags">
          ${(task.tags || []).map(t => `<span class="tag-chip" style="background:${t.color}20;color:${t.color}">${t.name}</span>`).join('') || '<span style="color:#94a3b8;font-size:13px">No tags</span>'}
        </div>
      </div>
      <div class="sp-section">
        <div class="ts-reviewed-row">
          <label class="sp-label" style="margin-bottom:0">Reviewed</label>
          <label class="toggle-switch">
            <input type="checkbox" id="sp-reviewed" ${task.is_reviewed ? 'checked' : ''}/>
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>
      </div>
      <div class="sp-section">
        <label class="sp-label">Score</label>
        <div style="display:flex;align-items:center;gap:8px">
          <input type="range" id="sp-score" min="0" max="100" value="${task.score || 0}" class="score-slider"/>
          <span id="sp-score-val" class="score-val">${task.score || 0}</span>
        </div>
      </div>`;

    // Bind events
    header.querySelector('.sp-close')?.addEventListener('click', closeSidePanel);
    header.querySelector('.sp-open-full')?.addEventListener('click', () => {
      closeSidePanel();
      import('../js/router.js').then(m => m.router.navigate(`/tasks/${task.id}`));
    });

    // Title edit
    const titleEl = header.querySelector('#sp-title');
    titleEl?.addEventListener('blur', async () => {
      const v = titleEl.textContent.trim();
      if (v && v !== task.title) { await updateTask(task.id, { title: v }); showToast('Title updated', 'success'); }
    });
    titleEl?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); titleEl.blur(); } });

    // Quick-change selects
    const bindSelect = (id, field) => {
      body.querySelector(`#${id}`)?.addEventListener('change', async e => {
        await updateTask(task.id, { [field]: e.target.value });
        showToast(`${field.replace('_',' ')} updated`, 'success');
      });
    };
    bindSelect('sp-status', 'status');
    bindSelect('sp-priority', 'priority');
    bindSelect('sp-type', 'task_type');

    body.querySelector('#sp-due')?.addEventListener('change', async e => {
      await updateTask(task.id, { due_date: e.target.value || null });
      showToast('Due date updated', 'success');
    });

    body.querySelector('#sp-desc')?.addEventListener('blur', async () => {
      const v = body.querySelector('#sp-desc').textContent.trim();
      if (v !== (task.description || '')) { await updateTask(task.id, { description: v }); showToast('Description saved', 'success'); }
    });

    body.querySelector('#sp-reviewed')?.addEventListener('change', async e => {
      await updateTask(task.id, { is_reviewed: e.target.checked });
      showToast(e.target.checked ? 'Marked reviewed' : 'Unmarked', 'success');
    });

    const scoreSlider = body.querySelector('#sp-score');
    const scoreVal    = body.querySelector('#sp-score-val');
    scoreSlider?.addEventListener('input', () => { scoreVal.textContent = scoreSlider.value; });
    scoreSlider?.addEventListener('change', async () => {
      await updateTask(task.id, { score: parseInt(scoreSlider.value) || null });
      showToast('Score updated', 'success');
    });

  } catch (err) {
    body.innerHTML = `<div style="padding:24px;color:#dc2626">Failed to load task</div>`;
  }
}
