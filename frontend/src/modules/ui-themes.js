/**
 * UI Theme Engine
 * ─────────────────────────────────────────────────────────────
 * Each theme renders completely different HTML — not just CSS.
 * Themes: default, compact, glass, flat, rounded, terminal, brutalist
 */

import { formatDuration, formatDate, priorityBadge, statusPill, isOverdue, avatarUrl } from '@utils/helpers.js';

export function getUiTheme() {
  return localStorage.getItem('vilva_ui_theme') || '';
}

// ══════════════════════════════════════════════════════════════
// DASHBOARD LAYOUTS — Each theme gets a unique dashboard
// ══════════════════════════════════════════════════════════════

export function themeDashboard(data, theme) {
  const mt = data.my_tasks || [];
  const ov = data.overdue || [];
  const pp = data.project_progress || [];
  const ws = data.weekly_stats || [];
  const totalTime = ws.reduce((a, d) => a + (d.seconds || 0), 0);
  const totalDone = ws.reduce((a, d) => a + (d.tasks_done || 0), 0);

  switch (theme) {
    case 'compact':   return dashCompact(mt, ov, pp, ws, totalTime, totalDone);
    case 'terminal':  return dashTerminal(mt, ov, pp, ws, totalTime, totalDone);
    case 'flat':      return dashFlat(mt, ov, pp, ws, totalTime, totalDone);
    case 'brutalist': return dashBrutalist(mt, ov, pp, ws, totalTime, totalDone);
    case 'glass':     return dashGlass(mt, ov, pp, ws, totalTime, totalDone);
    default:          return null; // use default renderer
  }
}

// ── Compact: Single-column spreadsheet, no cards ──
function dashCompact(mt, ov, pp, ws, totalTime, totalDone) {
  return `
    <div class="dc-strip">
      <span class="dc-stat">${mt.length} active</span>
      <span class="dc-stat dc-red">${ov.length} overdue</span>
      <span class="dc-stat dc-green">${totalDone} done</span>
      <span class="dc-stat dc-purple">${formatDuration(totalTime)}</span>
    </div>
    <div class="dc-table-wrap">
      <table class="dc-table">
        <thead><tr><th>Task</th><th>Project</th><th>Status</th><th>Priority</th><th>Due</th></tr></thead>
        <tbody>
          ${mt.map(t => `<tr class="dash-task-row" data-task-id="${t.id}">
            <td class="dc-task-title">${t.title}</td>
            <td class="dc-muted">${t.project?.name || '—'}</td>
            <td>${statusPill(t.status)}</td>
            <td>${priorityBadge(t.priority)}</td>
            <td class="dc-muted ${isOverdue(t.due_date, t.status) ? 'dc-red' : ''}">${t.due_date ? formatDate(t.due_date) : '—'}</td>
          </tr>`).join('') || '<tr><td colspan="5" class="dc-empty">No tasks</td></tr>'}
        </tbody>
      </table>
    </div>
    ${ov.length > 0 ? `<div class="dc-warn">⚠ ${ov.length} overdue task${ov.length > 1 ? 's' : ''}</div>` : ''}
    <div class="dc-projects">
      ${pp.map(p => `<div class="dc-proj"><span style="color:${p.color}">●</span> ${p.name} <span class="dc-muted">${p.progress}%</span></div>`).join('')}
    </div>`;
}

// ── Terminal: ASCII-style, monospace everything ──
function dashTerminal(mt, ov, pp, ws, totalTime, totalDone) {
  const line = '─'.repeat(56);
  return `
    <pre class="term-dash">
┌${line}┐
│ VILVA TASKSPACE — DASHBOARD                            │
├${line}┤
│ Active: ${String(mt.length).padEnd(6)} Overdue: ${String(ov.length).padEnd(6)} Done: ${String(totalDone).padEnd(6)} Time: ${formatDuration(totalTime).padEnd(8)}│
├${line}┤
│ TASKS                                                  │
├${line}┤
${mt.slice(0, 12).map(t => {
  const title = t.title.slice(0, 30).padEnd(30);
  const st = (t.status || '').padEnd(12);
  const pri = (t.priority || '').padEnd(8);
  return `│ ${title} ${st} ${pri}   │`;
}).join('\n') || '│ (no tasks)                                             │'}
├${line}┤
│ PROJECTS                                               │
├${line}┤
${pp.map(p => {
  const bar = '█'.repeat(Math.round(p.progress / 5)) + '░'.repeat(20 - Math.round(p.progress / 5));
  return `│ ${p.name.slice(0, 20).padEnd(20)} [${bar}] ${String(p.progress).padStart(3)}% │`;
}).join('\n') || '│ (no projects)                                          │'}
└${line}┘</pre>
    <div class="term-tasks">
      ${mt.map(t => `<div class="term-row dash-task-row" data-task-id="${t.id}">
        <span class="term-arrow">></span>
        <span class="term-title">${t.title}</span>
        <span class="term-meta">[${t.status}]</span>
        <span class="term-meta">{${t.priority}}</span>
        ${t.due_date ? `<span class="term-date">${formatDate(t.due_date)}</span>` : ''}
      </div>`).join('')}
    </div>`;
}

// ── Flat: Full-width, clean sections, no decoration ──
function dashFlat(mt, ov, pp, ws, totalTime, totalDone) {
  return `
    <div class="flat-stats-bar">
      <div class="flat-stat"><strong>${mt.length}</strong> Active Tasks</div>
      <div class="flat-stat flat-red"><strong>${ov.length}</strong> Overdue</div>
      <div class="flat-stat flat-green"><strong>${totalDone}</strong> Done This Week</div>
      <div class="flat-stat"><strong>${formatDuration(totalTime)}</strong> Tracked</div>
    </div>
    <div class="flat-two-col">
      <div>
        <h2 class="flat-h2">My Tasks</h2>
        <div class="flat-task-list">
          ${mt.map(t => `<div class="flat-task-row dash-task-row" data-task-id="${t.id}">
            <span class="flat-dot" style="background:${{low:'#94a3b8',medium:'#3b82f6',high:'#f59e0b',urgent:'#dc2626'}[t.priority] || '#94a3b8'}"></span>
            <span class="flat-task-title">${t.title}</span>
            <span class="flat-task-meta">${t.project?.name || ''}</span>
            <span class="flat-task-status">${t.status?.replace('_', ' ')}</span>
            ${t.due_date ? `<span class="flat-task-due ${isOverdue(t.due_date, t.status) ? 'overdue' : ''}">${formatDate(t.due_date)}</span>` : ''}
          </div>`).join('') || '<div class="flat-empty">No tasks assigned</div>'}
        </div>
      </div>
      <div>
        <h2 class="flat-h2">Projects</h2>
        ${pp.map(p => `<div class="flat-proj-row">
          <span class="flat-proj-name">${p.name}</span>
          <div class="flat-prog-bar"><div class="flat-prog-fill" style="width:${p.progress}%;background:${p.color}"></div></div>
          <span class="flat-prog-pct">${p.progress}%</span>
        </div>`).join('') || '<div class="flat-empty">No projects</div>'}
        ${ov.length > 0 ? `<h2 class="flat-h2 flat-red" style="margin-top:20px">⚠ Overdue (${ov.length})</h2>
          ${ov.slice(0,5).map(t => `<div class="flat-task-row dash-overdue-row" data-task-id="${t.id}">
            <span class="flat-dot" style="background:#dc2626"></span>
            <span class="flat-task-title">${t.title}</span>
            <span class="flat-task-due overdue">${formatDate(t.due_date)}</span>
          </div>`).join('')}` : ''}
      </div>
    </div>`;
}

// ── Brutalist: Bold blocks stacked ──
function dashBrutalist(mt, ov, pp, ws, totalTime, totalDone) {
  return `
    <div class="brut-stats">
      <div class="brut-stat"><div class="brut-stat-num">${mt.length}</div><div class="brut-stat-lbl">TASKS</div></div>
      <div class="brut-stat brut-red"><div class="brut-stat-num">${ov.length}</div><div class="brut-stat-lbl">OVERDUE</div></div>
      <div class="brut-stat brut-green"><div class="brut-stat-num">${totalDone}</div><div class="brut-stat-lbl">DONE</div></div>
      <div class="brut-stat"><div class="brut-stat-num">${formatDuration(totalTime)}</div><div class="brut-stat-lbl">TRACKED</div></div>
    </div>
    <div class="brut-section">
      <div class="brut-heading">MY TASKS</div>
      ${mt.map(t => `<div class="brut-task dash-task-row" data-task-id="${t.id}">
        <div class="brut-task-pri" style="background:${{urgent:'#dc2626',high:'#f59e0b',medium:'#3b82f6',low:'#94a3b8'}[t.priority]}"></div>
        <div class="brut-task-body">
          <strong>${t.title}</strong>
          <span>${t.project?.name || ''} · ${t.status?.replace('_', ' ')}</span>
        </div>
        ${t.due_date ? `<div class="brut-task-due ${isOverdue(t.due_date, t.status) ? 'brut-red' : ''}">${formatDate(t.due_date)}</div>` : ''}
      </div>`).join('') || '<div class="brut-empty">NO TASKS</div>'}
    </div>
    <div class="brut-section">
      <div class="brut-heading">PROJECTS</div>
      <div class="brut-proj-grid">
        ${pp.map(p => `<div class="brut-proj">
          <div class="brut-proj-bar" style="background:${p.color}"></div>
          <div class="brut-proj-name">${p.name}</div>
          <div class="brut-proj-pct">${p.progress}%</div>
        </div>`).join('') || '<div class="brut-empty">NO PROJECTS</div>'}
      </div>
    </div>`;
}

// ── Glass: Floating cards with blur ──
function dashGlass(mt, ov, pp, ws, totalTime, totalDone) {
  return `
    <div class="glass-stats">
      <div class="glass-stat"><div class="glass-stat-icon">📋</div><div class="glass-stat-val">${mt.length}</div><div class="glass-stat-lbl">Active</div></div>
      <div class="glass-stat glass-warn"><div class="glass-stat-icon">⚠️</div><div class="glass-stat-val">${ov.length}</div><div class="glass-stat-lbl">Overdue</div></div>
      <div class="glass-stat glass-ok"><div class="glass-stat-icon">✅</div><div class="glass-stat-val">${totalDone}</div><div class="glass-stat-lbl">Done</div></div>
      <div class="glass-stat"><div class="glass-stat-icon">⏱</div><div class="glass-stat-val">${formatDuration(totalTime)}</div><div class="glass-stat-lbl">Tracked</div></div>
    </div>
    <div class="glass-grid">
      <div class="glass-card glass-tasks-card">
        <h3>My Tasks</h3>
        ${mt.slice(0, 8).map(t => `<div class="glass-task dash-task-row" data-task-id="${t.id}">
          <div class="glass-task-left">
            <div class="glass-pri-dot" style="background:${{urgent:'#dc2626',high:'#f59e0b',medium:'#6366f1',low:'#94a3b8'}[t.priority]}"></div>
            <span>${t.title}</span>
          </div>
          <div class="glass-task-right">
            ${statusPill(t.status)}
            ${t.due_date ? `<span class="glass-due ${isOverdue(t.due_date, t.status) ? 'overdue' : ''}">${formatDate(t.due_date)}</span>` : ''}
          </div>
        </div>`).join('') || '<div class="glass-empty">No tasks</div>'}
      </div>
      <div class="glass-card glass-right-col">
        <h3>Projects</h3>
        ${pp.map(p => `<div class="glass-proj">
          <div class="glass-proj-info"><span class="glass-proj-dot" style="background:${p.color}"></span>${p.name}</div>
          <div class="glass-prog-wrap"><div class="glass-prog" style="width:${p.progress}%;background:${p.color}"></div></div>
          <span class="glass-pct">${p.progress}%</span>
        </div>`).join('') || '<div class="glass-empty">No projects</div>'}
        ${ov.length > 0 ? `<div class="glass-warn-banner">⚠ ${ov.length} overdue</div>` : ''}
      </div>
    </div>`;
}

// ══════════════════════════════════════════════════════════════
// TASK ROW VARIANTS — Different task row HTML per theme
// ══════════════════════════════════════════════════════════════

export function themeTaskRow(t, theme) {
  const od = isOverdue(t.due_date, t.status);
  switch (theme) {
    case 'compact':
      return `<div class="dc-task-item task-list-item" data-task-id="${t.id}">
        <span class="dc-dot" style="background:${{urgent:'#dc2626',high:'#f59e0b',medium:'#3b82f6',low:'#94a3b8'}[t.priority]}"></span>
        <span class="dc-task-name">${t.title}</span>
        <span class="dc-chip">${t.status?.replace('_',' ')}</span>
        ${t.due_date ? `<span class="dc-muted ${od?'dc-red':''}">${formatDate(t.due_date)}</span>` : ''}
      </div>`;

    case 'terminal':
      return `<div class="term-row task-list-item" data-task-id="${t.id}">
        <span class="term-arrow">></span>
        <span class="term-title">${t.title}</span>
        <span class="term-meta">[${t.status}]</span>
        <span class="term-meta">{${t.priority}}</span>
        ${t.project ? `<span class="term-meta">(${t.project.name})</span>` : ''}
        ${t.due_date ? `<span class="term-date ${od?'term-warn':''}">${formatDate(t.due_date)}</span>` : ''}
      </div>`;

    case 'brutalist':
      return `<div class="brut-task task-list-item" data-task-id="${t.id}">
        <div class="brut-task-pri" style="background:${{urgent:'#dc2626',high:'#f59e0b',medium:'#3b82f6',low:'#94a3b8'}[t.priority]}"></div>
        <div class="brut-task-body">
          <strong>${t.title}</strong>
          <span>${t.project?.name || ''} · ${t.status?.replace('_',' ')}</span>
        </div>
        ${t.due_date ? `<div class="brut-task-due ${od?'brut-red':''}">${formatDate(t.due_date)}</div>` : ''}
      </div>`;

    default: return null; // use default renderer
  }
}

// ══════════════════════════════════════════════════════════════
// PROJECT CARD VARIANTS
// ══════════════════════════════════════════════════════════════

export function themeProjectCard(p, theme) {
  const members = p.members || [];
  switch (theme) {
    case 'compact':
      return `<div class="dc-proj-row project-card" data-id="${p.id}">
        <span class="dc-dot" style="background:${p.color}"></span>
        <span class="dc-proj-name">${p.name}</span>
        <span class="dc-chip">${p.status}</span>
        <span class="dc-muted">${p.progress || 0}%</span>
        <span class="dc-muted">${p.tasks_count || 0} tasks</span>
      </div>`;

    case 'terminal':
      return `<div class="term-row project-card" data-id="${p.id}">
        <span class="term-arrow">></span>
        <span class="term-title">${p.name}</span>
        <span class="term-meta">[${p.status}]</span>
        <span class="term-meta">${'█'.repeat(Math.round((p.progress||0)/10))}${'░'.repeat(10 - Math.round((p.progress||0)/10))} ${p.progress||0}%</span>
      </div>`;

    case 'brutalist':
      return `<div class="brut-proj project-card" data-id="${p.id}">
        <div class="brut-proj-bar" style="background:${p.color}"></div>
        <div class="brut-proj-name">${p.name}</div>
        <div class="brut-proj-pct">${p.progress || 0}%</div>
      </div>`;

    default: return null;
  }
}
