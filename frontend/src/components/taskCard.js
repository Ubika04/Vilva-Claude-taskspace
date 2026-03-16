/**
 * Task Card Component — used in Kanban board columns
 */

import { priorityBadge, formatDate } from '@utils/helpers.js';

export function renderTaskCard(task) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return `
    <div class="task-card ${isOverdue ? 'overdue' : ''} ${task.is_blocked ? 'blocked' : ''}"
         data-task-id="${task.id}"
         draggable="false">
      <div class="card-tags">
        ${(task.tags || []).map(t =>
          `<span class="tag-chip-sm" style="background:${t.color}">${t.name}</span>`
        ).join('')}
      </div>
      <p class="card-title">${task.title}</p>
      ${task.is_blocked ? '<span class="blocked-badge">🔒 Blocked</span>' : ''}
      <div class="card-footer">
        <div class="card-footer-left">
          ${priorityBadge(task.priority)}
          ${task.subtasks_count > 0 ? `
            <span class="subtask-count" title="Subtasks">
              ⊞ ${task.subtasks_count}
            </span>` : ''}
          ${task.active_timer ? '<span class="timer-indicator">⏱</span>' : ''}
        </div>
        <div class="card-footer-right">
          ${task.due_date ? `
            <span class="card-due ${isOverdue ? 'text-danger' : ''}">
              📅 ${formatDate(task.due_date)}
            </span>` : ''}
          <div class="card-assignees">
            ${(task.assignees || []).slice(0, 3).map(a =>
              `<img src="${a.avatar_url}" class="avatar-xs" title="${a.name}"/>`
            ).join('')}
          </div>
        </div>
      </div>
    </div>`;
}
