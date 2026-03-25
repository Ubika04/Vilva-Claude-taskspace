/**
 * Meetings Module — Create, view, RSVP, and manage meetings.
 */

import { api } from '@api/apiClient.js';
import { showToast } from '@components/toast.js';
import { store } from '@store/store.js';
import { avatarUrl } from '@utils/helpers.js';

const STATUS_MAP = {
  scheduled:   { label: 'Scheduled',   color: '#3b82f6', bg: '#dbeafe' },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: '#fef3c7' },
  completed:   { label: 'Completed',   color: '#10b981', bg: '#dcfce7' },
  cancelled:   { label: 'Cancelled',   color: '#94a3b8', bg: '#f1f5f9' },
};

const RSVP_MAP = {
  pending:   { label: 'Pending',   color: '#94a3b8', icon: '⏳' },
  accepted:  { label: 'Accepted',  color: '#10b981', icon: '✅' },
  declined:  { label: 'Declined',  color: '#ef4444', icon: '❌' },
  tentative: { label: 'Tentative', color: '#f59e0b', icon: '❓' },
};

export async function renderMeetings(container) {
  container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  const from = new Date(); from.setDate(from.getDate() - 7);
  const to   = new Date(); to.setDate(to.getDate() + 30);

  let meetings = [];
  try {
    const res = await api.get(`/meetings?from=${fmt(from)}&to=${fmt(to)}`);
    meetings = res.data || [];
  } catch (err) {
    container.innerHTML = `<div class="full-empty"><div class="full-empty-icon">⚠️</div><h3>Could not load meetings</h3></div>`;
    return;
  }

  const upcoming = meetings.filter(m => m.status === 'scheduled' || m.status === 'in_progress');
  const past     = meetings.filter(m => m.status === 'completed' || m.status === 'cancelled');

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Meetings</h1>
        <p>${meetings.length} meeting${meetings.length !== 1 ? 's' : ''}</p>
      </div>
      <div class="page-header-right">
        <button class="btn btn-primary btn-sm" id="new-meeting-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
          New Meeting
        </button>
      </div>
    </div>

    ${upcoming.length > 0 ? `
    <div class="section-card" style="margin-bottom:20px">
      <div class="section-head"><span class="section-title">Upcoming & Active</span></div>
      <div class="mtg-list">${upcoming.map(m => meetingCard(m)).join('')}</div>
    </div>` : ''}

    ${past.length > 0 ? `
    <div class="section-card">
      <div class="section-head"><span class="section-title">Past Meetings</span></div>
      <div class="mtg-list">${past.map(m => meetingCard(m)).join('')}</div>
    </div>` : ''}

    ${meetings.length === 0 ? `
    <div class="full-empty">
      <div class="full-empty-icon">📅</div>
      <h3>No meetings yet</h3>
      <p>Create your first meeting to get started.</p>
    </div>` : ''}`;

  document.getElementById('new-meeting-btn')?.addEventListener('click', () => openMeetingModal(container));

  // Meeting card click → detail
  container.querySelectorAll('.mtg-card').forEach(card => {
    card.addEventListener('click', () => openMeetingDetail(container, card.dataset.meetingId, meetings));
  });
}

function meetingCard(m) {
  const s = STATUS_MAP[m.status] || STATUS_MAP.scheduled;
  const start = new Date(m.scheduled_start);
  const end   = new Date(m.scheduled_end);
  const userId = store.get('user')?.id;
  const myRsvp = m.attendees?.find(a => a.id === userId);

  return `
    <div class="mtg-card" data-meeting-id="${m.id}">
      <div class="mtg-card-color" style="background:${m.color || '#f59e0b'}"></div>
      <div class="mtg-card-body">
        <div class="mtg-card-top">
          <h4 class="mtg-card-title">${m.title}</h4>
          <span class="mtg-status-pill" style="background:${s.bg};color:${s.color}">${s.label}</span>
        </div>
        <div class="mtg-card-meta">
          <span>📅 ${start.toLocaleDateString('en', { month:'short', day:'numeric' })}</span>
          <span>🕐 ${start.toLocaleTimeString('en', { hour:'2-digit', minute:'2-digit' })} – ${end.toLocaleTimeString('en', { hour:'2-digit', minute:'2-digit' })}</span>
          <span>⏱ ${m.duration_minutes}min</span>
          ${m.location ? `<span>📍 ${m.location}</span>` : ''}
          ${m.video_link ? `<span>🔗 Video</span>` : ''}
        </div>
        <div class="mtg-card-bottom">
          <div class="mtg-card-attendees">
            <img src="${avatarUrl(m.organizer)}" title="Organizer: ${m.organizer?.name}" class="av-xs" style="border:2px solid ${m.color || '#f59e0b'};border-radius:50%"/>
            ${(m.attendees || []).slice(0, 5).map(a => `<img src="${avatarUrl(a)}" title="${a.name} (${RSVP_MAP[a.rsvp_status]?.label || 'Pending'})" class="av-xs" style="border-radius:50%;margin-left:-6px"/>`).join('')}
            ${(m.attendees || []).length > 5 ? `<span class="mtg-more-badge">+${m.attendees.length - 5}</span>` : ''}
          </div>
          ${myRsvp ? `<span class="mtg-rsvp-badge" style="color:${RSVP_MAP[myRsvp.rsvp_status]?.color}">${RSVP_MAP[myRsvp.rsvp_status]?.icon} ${RSVP_MAP[myRsvp.rsvp_status]?.label}</span>` : ''}
          ${m.project ? `<span class="task-proj-chip" style="background:${m.project.color}18;color:${m.project.color}">${m.project.name}</span>` : ''}
        </div>
      </div>
    </div>`;
}

// ── Meeting Detail Modal ─────────────────────────────────────────────────

async function openMeetingDetail(container, meetingId, allMeetings) {
  let m = allMeetings?.find(x => x.id == meetingId);
  if (!m) {
    try { m = (await api.get(`/meetings/${meetingId}`)).data; } catch { showToast('Failed to load meeting', 'error'); return; }
  }

  const userId = store.get('user')?.id;
  const isOrganizer = m.organizer?.id === userId;
  const s = STATUS_MAP[m.status] || STATUS_MAP.scheduled;
  const start = new Date(m.scheduled_start);
  const end = new Date(m.scheduled_end);

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:600px;max-height:85vh;overflow-y:auto">
      <div class="modal-header">
        <div>
          <h3>${m.title}</h3>
          <span class="mtg-status-pill" style="background:${s.bg};color:${s.color};font-size:11px">${s.label}</span>
        </div>
        <button class="modal-close" id="md-close">&times;</button>
      </div>
      <div class="modal-body" style="padding:16px 20px">
        ${m.description ? `<p style="color:var(--text2);margin-bottom:14px">${m.description}</p>` : ''}

        <div class="mtg-detail-grid">
          <div class="mtg-detail-item"><span class="mtg-detail-label">Date</span><span>${start.toLocaleDateString('en', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}</span></div>
          <div class="mtg-detail-item"><span class="mtg-detail-label">Time</span><span>${start.toLocaleTimeString('en', { hour:'2-digit', minute:'2-digit' })} – ${end.toLocaleTimeString('en', { hour:'2-digit', minute:'2-digit' })} (${m.duration_minutes}min)</span></div>
          ${m.location ? `<div class="mtg-detail-item"><span class="mtg-detail-label">Location</span><span>📍 ${m.location}</span></div>` : ''}
          ${m.video_link ? `<div class="mtg-detail-item"><span class="mtg-detail-label">Video Link</span><a href="${m.video_link}" target="_blank" rel="noopener" style="color:var(--brand);text-decoration:underline">Join Meeting</a></div>` : ''}
          <div class="mtg-detail-item"><span class="mtg-detail-label">Organizer</span><div style="display:flex;align-items:center;gap:6px"><img src="${avatarUrl(m.organizer)}" class="av-xs" style="border-radius:50%"/> ${m.organizer?.name}</div></div>
        </div>

        <div style="margin-top:16px">
          <span class="ts-label">Attendees (${(m.attendees || []).length})</span>
          <div class="mtg-attendee-list">
            ${(m.attendees || []).map(a => {
              const r = RSVP_MAP[a.rsvp_status] || RSVP_MAP.pending;
              return `<div class="mtg-attendee-row">
                <img src="${avatarUrl(a)}" class="av-xs" style="border-radius:50%"/>
                <span>${a.name}</span>
                <span class="mtg-rsvp-pill" style="color:${r.color}">${r.icon} ${r.label}</span>
              </div>`;
            }).join('')}
          </div>
        </div>

        ${m.status === 'scheduled' && !isOrganizer ? `
        <div style="margin-top:16px;display:flex;gap:8px">
          <button class="btn btn-primary btn-sm" id="rsvp-accept">Accept</button>
          <button class="btn btn-ghost btn-sm" id="rsvp-tentative">Tentative</button>
          <button class="btn btn-ghost btn-sm" style="color:var(--red)" id="rsvp-decline">Decline</button>
        </div>` : ''}

        <div style="margin-top:16px">
          <span class="ts-label">Meeting Notes</span>
          <textarea id="md-notes" class="form-input" rows="4" placeholder="Add meeting notes…" ${!isOrganizer ? 'readonly' : ''}>${m.notes || ''}</textarea>
          ${isOrganizer ? `<button class="btn btn-ghost btn-sm" id="md-save-notes" style="margin-top:6px">Save Notes</button>` : ''}
        </div>
      </div>
      <div class="modal-footer">
        ${isOrganizer ? `<button class="btn btn-ghost btn-sm" style="color:var(--red)" id="md-delete">Delete Meeting</button>` : ''}
        <button class="btn btn-ghost" id="md-cancel">Close</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));

  const close = () => { overlay.remove(); };
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.getElementById('md-close').addEventListener('click', close);
  document.getElementById('md-cancel').addEventListener('click', close);

  // RSVP buttons
  ['accept', 'tentative', 'decline'].forEach(action => {
    document.getElementById(`rsvp-${action}`)?.addEventListener('click', async () => {
      const statusMap = { accept: 'accepted', tentative: 'tentative', decline: 'declined' };
      try {
        await api.post(`/meetings/${m.id}/rsvp`, { status: statusMap[action] });
        showToast(`RSVP: ${statusMap[action]}`, 'success');
        close();
        renderMeetings(container);
      } catch { showToast('Failed to RSVP', 'error'); }
    });
  });

  // Save notes
  document.getElementById('md-save-notes')?.addEventListener('click', async () => {
    try {
      await api.patch(`/meetings/${m.id}/notes`, { notes: document.getElementById('md-notes').value });
      showToast('Notes saved', 'success');
    } catch { showToast('Failed to save notes', 'error'); }
  });

  // Delete
  document.getElementById('md-delete')?.addEventListener('click', async () => {
    if (!confirm('Delete this meeting?')) return;
    try {
      await api.delete(`/meetings/${m.id}`);
      showToast('Meeting deleted', 'success');
      close();
      renderMeetings(container);
    } catch { showToast('Failed to delete', 'error'); }
  });
}

// ── Create / Edit Meeting Modal ──────────────────────────────────────────

async function openMeetingModal(container, existing = null) {
  const isEdit = !!existing;

  // Load users for attendee picker
  let users = [];
  try {
    const res = await api.get('/users/search?per_page=50');
    users = Array.isArray(res) ? res : (res.data || []);
  } catch {}

  // Load projects
  let projects = [];
  try {
    const res = await api.get('/projects');
    projects = res.data || [];
  } catch {}

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:520px;max-height:85vh;overflow-y:auto">
      <div class="modal-header">
        <h3>${isEdit ? 'Edit Meeting' : 'New Meeting'}</h3>
        <button class="modal-close" id="mm-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Title <span style="color:var(--red)">*</span></label>
          <input type="text" class="form-input" id="mm-title" value="${existing?.title || ''}" placeholder="Meeting title" required/>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-input" id="mm-desc" rows="2" placeholder="What is this meeting about?">${existing?.description || ''}</textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group">
            <label class="form-label">Start <span style="color:var(--red)">*</span></label>
            <input type="datetime-local" class="form-input" id="mm-start" value="${existing?.scheduled_start?.slice(0,16) || ''}" required/>
          </div>
          <div class="form-group">
            <label class="form-label">End <span style="color:var(--red)">*</span></label>
            <input type="datetime-local" class="form-input" id="mm-end" value="${existing?.scheduled_end?.slice(0,16) || ''}" required/>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group">
            <label class="form-label">Location</label>
            <input type="text" class="form-input" id="mm-location" value="${existing?.location || ''}" placeholder="Room or address"/>
          </div>
          <div class="form-group">
            <label class="form-label">Video Link</label>
            <input type="url" class="form-input" id="mm-video" value="${existing?.video_link || ''}" placeholder="https://meet.google.com/..."/>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group">
            <label class="form-label">Project</label>
            <select class="form-input form-select" id="mm-project">
              <option value="">None</option>
              ${projects.map(p => `<option value="${p.id}" ${existing?.project_id == p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Color</label>
            <input type="color" class="form-input" id="mm-color" value="${existing?.color || '#f59e0b'}" style="height:38px;padding:4px"/>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Attendees</label>
          <div class="mtg-attendee-picker" id="mm-attendees">
            ${users.map(u => `
              <label class="mtg-attendee-option">
                <input type="checkbox" value="${u.id}" ${(existing?.attendees || []).some(a => a.id === u.id) ? 'checked' : ''}/>
                <img src="${u.avatar_url || avatarUrl(u)}" class="av-xs" style="border-radius:50%"/>
                <span>${u.name}</span>
              </label>`).join('')}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="mm-cancel">Cancel</button>
        <button class="btn btn-primary" id="mm-submit">${isEdit ? 'Save Changes' : 'Create Meeting'}</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));
  document.getElementById('mm-title').focus();

  const close = () => { overlay.remove(); };
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.getElementById('mm-close').addEventListener('click', close);
  document.getElementById('mm-cancel').addEventListener('click', close);

  document.getElementById('mm-submit').addEventListener('click', async () => {
    const title = document.getElementById('mm-title').value.trim();
    const scheduled_start = document.getElementById('mm-start').value;
    const scheduled_end = document.getElementById('mm-end').value;

    if (!title || !scheduled_start || !scheduled_end) {
      showToast('Title, start and end time are required', 'error');
      return;
    }

    const attendee_ids = [...document.querySelectorAll('#mm-attendees input:checked')].map(cb => parseInt(cb.value));

    const payload = {
      title,
      description: document.getElementById('mm-desc').value.trim() || null,
      scheduled_start,
      scheduled_end,
      location: document.getElementById('mm-location').value.trim() || null,
      video_link: document.getElementById('mm-video').value.trim() || null,
      project_id: document.getElementById('mm-project').value || null,
      color: document.getElementById('mm-color').value,
      attendee_ids,
    };

    try {
      if (isEdit) {
        await api.patch(`/meetings/${existing.id}`, payload);
        showToast('Meeting updated', 'success');
      } else {
        await api.post('/meetings', payload);
        showToast('Meeting created', 'success');
      }
      close();
      renderMeetings(container);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed';
      showToast(msg, 'error');
    }
  });
}

function fmt(d) { return d.toISOString().slice(0, 10); }
