/**
 * Admin Module — Team members CRUD + task overview
 * Visible to admin role only.
 */

import { api } from '@api/apiClient.js';
import { formatDate, statusPill, priorityBadge, avatarUrl, isOverdue } from '@utils/helpers.js';
import { showToast } from '@components/toast.js';

let cachedRoles = null;

async function loadRoles() {
  if (cachedRoles) return cachedRoles;
  try {
    const res = await api.get('/admin/roles');
    cachedRoles = res.data || [];
  } catch {
    cachedRoles = [
      { name: 'admin', display_name: 'Admin' },
      { name: 'manager', display_name: 'Manager' },
      { name: 'member', display_name: 'Member' },
      { name: 'guest', display_name: 'Guest' },
    ];
  }
  return cachedRoles;
}

export async function renderAdmin(container) {
  container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  let res;
  try {
    res = await api.get('/admin/users');
  } catch {
    container.innerHTML = `
      <div class="full-empty">
        <div class="full-empty-icon">🔒</div>
        <h3>Admin access required</h3>
        <p>You don't have permission to view this page.</p>
      </div>`;
    return;
  }

  const users = res.data || [];

  // Load roles for permissions tab
  const roles = await loadRoles();

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>User Management</h1>
        <p>${users.length} member${users.length !== 1 ? 's' : ''} total</p>
      </div>
      <div class="page-header-right" style="display:flex;gap:10px;align-items:center">
        <input type="search" id="admin-search" class="form-input" placeholder="Search members…" style="width:220px"/>
        <button class="btn btn-primary btn-sm" id="add-user-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
          Add Member
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="admin-tabs">
      <button class="admin-tab active" data-tab="members">👥 Members</button>
      <button class="admin-tab" data-tab="roles">🔑 Roles & Permissions</button>
    </div>

    <!-- Members Tab -->
    <div class="admin-tab-panel" id="tab-members">
      <div class="admin-overview-strip">
        ${adminStatCard('👥', 'stat-icon-blue',   users.length, 'Members')}
        ${adminStatCard('📋', 'stat-icon-purple', users.reduce((a, u) => a + u.task_stats.total, 0), 'Total Tasks')}
        ${adminStatCard('⚡', 'stat-icon-amber',  users.reduce((a, u) => a + u.task_stats.in_progress, 0), 'In Progress')}
        ${adminStatCard('⚠️', 'stat-icon-red',    users.reduce((a, u) => a + u.task_stats.overdue, 0), 'Overdue')}
      </div>
      <div class="admin-members-list" id="admin-members-list">
        ${users.map(u => memberCard(u)).join('')}
      </div>
    </div>

    <!-- Roles & Permissions Tab -->
    <div class="admin-tab-panel hidden" id="tab-roles">
      ${renderRolesPanel(roles, users)}
    </div>`;

  // Tab switching
  container.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.admin-tab-panel').forEach(p => p.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`)?.classList.remove('hidden');
    });
  });

  // Add User button
  document.getElementById('add-user-btn')?.addEventListener('click', () => openUserModal(container));

  // Search
  document.getElementById('admin-search')?.addEventListener('input', function () {
    const q = this.value.toLowerCase();
    container.querySelectorAll('.admin-member-card').forEach(card => {
      card.style.display = card.dataset.name.toLowerCase().includes(q) ? '' : 'none';
    });
  });

  bindCardEvents(container);

  // Role CRUD events
  document.getElementById('create-role-btn')?.addEventListener('click', () => {
    openRoleModal(container, null);
  });

  container.querySelectorAll('.role-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const roleName = btn.dataset.roleName;
      const role = roles.find(r => r.name === roleName);
      if (role) openRoleModal(container, role);
    });
  });

  container.querySelectorAll('.role-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const roleName = btn.dataset.roleName;
      if (!confirm(`Are you sure you want to delete the role "${roleName}"? This cannot be undone.`)) return;
      try {
        await api.delete(`/admin/roles/${roleName}`);
        showToast('Role deleted', 'success');
        cachedRoles = null;
        renderAdmin(container);
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to delete role', 'error');
      }
    });
  });
}

function bindCardEvents(container) {
  // Expand/collapse task lists
  container.querySelectorAll('.admin-expand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card     = btn.closest('.admin-member-card');
      const taskList = card.querySelector('.admin-task-list');
      const isOpen   = !taskList.classList.contains('hidden');
      taskList.classList.toggle('hidden', isOpen);
      btn.innerHTML  = isOpen
        ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg> Show tasks`
        : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg> Hide tasks`;
    });
  });

  // Navigate to task detail on row click
  container.querySelectorAll('.admin-task-row').forEach(el => {
    el.addEventListener('click', () => {
      import('../js/router.js').then(m => m.router.navigate(`/tasks/${el.dataset.taskId}`));
    });
  });

  // Edit user buttons
  container.querySelectorAll('.admin-edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const userData = JSON.parse(btn.dataset.user);
      openUserModal(container, userData);
    });
  });

  // Reset password buttons
  container.querySelectorAll('.admin-reset-pw-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openResetPasswordModal(btn.dataset.userId, btn.dataset.userName);
    });
  });

  // Delete user buttons
  container.querySelectorAll('.admin-delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const userId = btn.dataset.userId;
      const userName = btn.dataset.userName;
      if (!confirm(`Are you sure you want to remove ${userName}? This action cannot be undone.`)) return;
      try {
        await api.delete(`/admin/users/${userId}`);
        showToast('Member removed', 'success');
        renderAdmin(container);
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to remove member', 'error');
      }
    });
  });
}

// ── Create / Edit User Modal ─────────────────────────────────────────────

async function openUserModal(container, existing = null) {
  const roles = await loadRoles();
  const isEdit = !!existing;
  const title = isEdit ? 'Edit Member' : 'Add New Member';
  const currentRole = isEdit ? (existing.roles?.[0] || 'member') : 'member';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:480px">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" id="um-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Name <span style="color:var(--red)">*</span></label>
          <input type="text" class="form-input" id="um-name" value="${isEdit ? existing.name : ''}" placeholder="Full name" required/>
        </div>
        <div class="form-group">
          <label class="form-label">Email <span style="color:var(--red)">*</span></label>
          <input type="email" class="form-input" id="um-email" value="${isEdit ? existing.email : ''}" placeholder="email@company.com" required/>
        </div>
        <div class="form-group">
          <label class="form-label">Mobile</label>
          <input type="text" class="form-input" id="um-mobile" value="${isEdit ? (existing.mobile || '') : ''}" placeholder="+91 9876543210"/>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group">
            <label class="form-label">Role <span style="color:var(--red)">*</span></label>
            <select class="form-input form-select" id="um-role">
              ${roles.map(r => `<option value="${r.name}" ${r.name === currentRole ? 'selected' : ''}>${r.display_name || r.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Department</label>
            <input type="text" class="form-input" id="um-dept" value="${isEdit ? (existing.department || '') : ''}" placeholder="e.g. Engineering"/>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Designation</label>
          <input type="text" class="form-input" id="um-desig" value="${isEdit ? (existing.designation || '') : ''}" placeholder="e.g. Senior Developer"/>
        </div>
        ${!isEdit ? `
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" class="form-input" id="um-password" placeholder="Leave blank for default (password)"/>
        </div>` : ''}
        ${isEdit ? `
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-input form-select" id="um-status">
            <option value="active" ${existing.status === 'active' ? 'selected' : ''}>Active</option>
            <option value="inactive" ${existing.status === 'inactive' ? 'selected' : ''}>Inactive</option>
            <option value="suspended" ${existing.status === 'suspended' ? 'selected' : ''}>Suspended</option>
          </select>
        </div>` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="um-cancel">Cancel</button>
        <button class="btn btn-primary" id="um-submit">${isEdit ? 'Save Changes' : 'Create Member'}</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));
  document.getElementById('um-name').focus();

  const close = () => { overlay.remove(); };
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.getElementById('um-close').addEventListener('click', close);
  document.getElementById('um-cancel').addEventListener('click', close);

  document.getElementById('um-submit').addEventListener('click', async () => {
    const name  = document.getElementById('um-name').value.trim();
    const email = document.getElementById('um-email').value.trim();
    const mobile = document.getElementById('um-mobile').value.trim();
    const role  = document.getElementById('um-role').value;
    const dept  = document.getElementById('um-dept').value.trim();
    const desig = document.getElementById('um-desig').value.trim();

    if (!name || !email) {
      showToast('Name and email are required', 'error');
      return;
    }

    const payload = { name, email, role, mobile: mobile || null, department: dept || null, designation: desig || null };

    try {
      if (isEdit) {
        const status = document.getElementById('um-status')?.value;
        if (status) payload.status = status;
        await api.patch(`/admin/users/${existing.id}`, payload);
        showToast('Member updated', 'success');
      } else {
        const pw = document.getElementById('um-password')?.value;
        if (pw) payload.password = pw;
        await api.post('/admin/users', payload);
        showToast('Member created', 'success');
      }
      close();
      renderAdmin(container);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors
        ? Object.values(err.response.data.errors || {}).flat().join(', ')
        : 'Operation failed';
      showToast(msg, 'error');
    }
  });
}

// ── Reset Password Modal ──────────────────────────────────────────────────

function openResetPasswordModal(userId, userName) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:400px">
      <div class="modal-header">
        <h3>Reset Password</h3>
        <button class="modal-close" id="rp-close">&times;</button>
      </div>
      <div class="modal-body">
        <p style="margin-bottom:14px;color:var(--text2);font-size:13px">Set a new password for <strong>${userName}</strong></p>
        <div class="form-group">
          <label class="form-label">New Password</label>
          <input type="password" class="form-input" id="rp-password" placeholder="Min. 6 characters" required/>
        </div>
        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <input type="password" class="form-input" id="rp-confirm" placeholder="Repeat password" required/>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="rp-cancel">Cancel</button>
        <button class="btn btn-primary" id="rp-submit">Reset Password</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));
  document.getElementById('rp-password').focus();

  const close = () => { overlay.remove(); };
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.getElementById('rp-close').addEventListener('click', close);
  document.getElementById('rp-cancel').addEventListener('click', close);

  document.getElementById('rp-submit').addEventListener('click', async () => {
    const pw = document.getElementById('rp-password').value;
    const confirm = document.getElementById('rp-confirm').value;

    if (pw !== confirm) { showToast('Passwords do not match', 'error'); return; }
    if (pw.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }

    try {
      const res = await api.post(`/admin/users/${userId}/reset-password`, { password: pw });
      showToast(res.message || 'Password reset', 'success');
      close();
    } catch (err) {
      showToast(err?.message || 'Failed to reset password', 'error');
    }
  });
}

// ── Roles & Permissions Panel ─────────────────────────────────────────────

const PERMISSION_GROUPS = {
  projects: ['projects.view', 'projects.create', 'projects.update', 'projects.delete'],
  tasks:    ['tasks.view', 'tasks.create', 'tasks.update', 'tasks.delete', 'tasks.assign'],
  members:  ['members.manage'],
  reports:  ['reports.view', 'reports.export'],
};

const PERM_LABELS = {
  'projects.view': 'View Projects',
  'projects.create': 'Create Projects',
  'projects.update': 'Update Projects',
  'projects.delete': 'Delete Projects',
  'tasks.view': 'View Tasks',
  'tasks.create': 'Create Tasks',
  'tasks.update': 'Update Tasks',
  'tasks.delete': 'Delete Tasks',
  'tasks.assign': 'Assign Tasks',
  'members.manage': 'Manage Members',
  'reports.view': 'View Reports',
  'reports.export': 'Export Reports',
};

function renderRolesPanel(roles, users) {
  // Count users per role
  const roleCounts = {};
  for (const u of users) {
    for (const r of (u.roles || [])) {
      roleCounts[r] = (roleCounts[r] || 0) + 1;
    }
  }

  // Known permission sets per role (from seeder defaults)
  const ROLE_PERMS = {
    owner:   Object.values(PERMISSION_GROUPS).flat(),
    admin:   Object.values(PERMISSION_GROUPS).flat(),
    manager: ['projects.view','projects.update','tasks.view','tasks.create','tasks.update','tasks.assign','members.manage','reports.view'],
    member:  ['projects.view','tasks.view','tasks.create','tasks.update'],
    guest:   ['projects.view','tasks.view'],
  };

  return `
    <div style="margin-bottom:16px">
      <button class="btn btn-primary btn-sm" id="create-role-btn">
        + Create Role
      </button>
    </div>
    <div class="roles-grid">
      ${roles.map(role => {
        const perms = ROLE_PERMS[role.name] || role.permissions || [];
        const count = roleCounts[role.name] || 0;
        const membersInRole = users.filter(u => (u.roles || []).includes(role.name));

        return `
        <div class="role-card">
          <div class="role-card-header">
            <div class="role-card-title">
              <span class="admin-role-badge role-${role.name}">${role.display_name || role.name}</span>
              <span class="role-count">${count} member${count !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div class="role-perms">
            ${Object.entries(PERMISSION_GROUPS).map(([group, groupPerms]) => `
              <div class="role-perm-group">
                <div class="role-perm-group-label">${group.charAt(0).toUpperCase() + group.slice(1)}</div>
                ${groupPerms.map(p => `
                  <div class="role-perm-item ${perms.includes(p) ? 'granted' : 'denied'}">
                    <span>${perms.includes(p) ? '✅' : '❌'}</span>
                    <span>${PERM_LABELS[p] || p}</span>
                  </div>`).join('')}
              </div>`).join('')}
          </div>

          ${membersInRole.length > 0 ? `
          <div class="role-members">
            <div class="role-perm-group-label" style="margin-bottom:6px">Members with this role</div>
            <div class="role-member-list">
              ${membersInRole.slice(0, 8).map(u => `
                <div class="role-member-chip" title="${u.name}">
                  <img src="${u.avatar_url || ''}" class="dep-av-sm" style="margin-left:0"/>
                  <span>${u.name}</span>
                </div>`).join('')}
              ${membersInRole.length > 8 ? `<span style="font-size:11px;color:var(--muted)">+${membersInRole.length - 8} more</span>` : ''}
            </div>
          </div>` : ''}

          ${!role.is_system ? `
          <div style="display:flex;gap:4px;margin-top:10px">
            <button class="btn btn-ghost btn-sm role-edit-btn" data-role-name="${role.name}">Edit</button>
            <button class="btn btn-ghost btn-sm role-delete-btn" data-role-name="${role.name}" style="color:var(--red)">Delete</button>
          </div>` : ''}
        </div>`;
      }).join('')}
    </div>`;
}

// ── Role Create/Edit Modal ────────────────────────────────────────────────

function openRoleModal(container, existing = null) {
  const isEdit = !!existing;
  const title = isEdit ? 'Edit Role' : 'Create Role';
  const currentPerms = existing?.permissions || [];

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:520px">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" id="rm-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Role Name <span style="color:var(--red)">*</span></label>
          <input type="text" class="form-input" id="rm-name" value="${isEdit ? existing.name : ''}" placeholder="e.g. editor" required ${isEdit ? 'readonly style="opacity:0.6"' : ''}/>
        </div>
        <div class="form-group">
          <label class="form-label">Display Name</label>
          <input type="text" class="form-input" id="rm-display-name" value="${isEdit ? (existing.display_name || '') : ''}" placeholder="e.g. Editor"/>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-input form-textarea" id="rm-description" rows="2" placeholder="Optional description">${isEdit ? (existing.description || '') : ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Permissions</label>
          <div style="max-height:220px;overflow-y:auto;border:1px solid var(--border,#e2e8f0);border-radius:6px;padding:8px">
            ${Object.entries(PERMISSION_GROUPS).map(([group, groupPerms]) => `
              <div style="margin-bottom:8px">
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text3,#94a3b8);margin-bottom:4px">${group}</div>
                ${groupPerms.map(p => `
                  <label style="display:flex;align-items:center;gap:6px;padding:3px 4px;cursor:pointer;font-size:13px">
                    <input type="checkbox" class="rm-perm-cb" value="${p}" ${currentPerms.includes(p) ? 'checked' : ''}/>
                    ${PERM_LABELS[p] || p}
                  </label>`).join('')}
              </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="rm-cancel">Cancel</button>
        <button class="btn btn-primary" id="rm-submit">${isEdit ? 'Save Changes' : 'Create Role'}</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));
  document.getElementById(isEdit ? 'rm-display-name' : 'rm-name').focus();

  const close = () => { overlay.remove(); };
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.getElementById('rm-close').addEventListener('click', close);
  document.getElementById('rm-cancel').addEventListener('click', close);

  document.getElementById('rm-submit').addEventListener('click', async () => {
    const name = document.getElementById('rm-name').value.trim();
    const displayName = document.getElementById('rm-display-name').value.trim();
    const description = document.getElementById('rm-description').value.trim();
    const permissions = [...overlay.querySelectorAll('.rm-perm-cb:checked')].map(cb => cb.value);

    if (!name) {
      showToast('Role name is required', 'error');
      return;
    }

    const payload = {
      name,
      display_name: displayName || null,
      description: description || null,
      permissions,
    };

    try {
      if (isEdit) {
        await api.patch(`/admin/roles/${existing.name}`, payload);
        showToast('Role updated', 'success');
      } else {
        await api.post('/admin/roles', payload);
        showToast('Role created', 'success');
      }
      close();
      cachedRoles = null;
      renderAdmin(container);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors
        ? Object.values(err?.response?.data?.errors || {}).flat().join(', ')
        : 'Operation failed';
      showToast(msg, 'error');
    }
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────

function adminStatCard(icon, cls, val, label) {
  return `
    <div class="stat-card">
      <div class="stat-icon ${cls}">${icon}</div>
      <div class="stat-info">
        <span class="stat-val">${val}</span>
        <span class="stat-label">${label}</span>
      </div>
    </div>`;
}

function memberCard(u) {
  const s      = u.task_stats;
  const tasks  = u.tasks || [];
  const isAdm  = (u.roles || []).includes('admin');
  const avUrl  = u.avatar_url || avatarUrl(u);
  const roleName = (u.roles || [])[0] || 'member';
  const lastAc = u.last_active_at
    ? new Date(u.last_active_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Never';

  const editData = JSON.stringify({
    id: u.id, name: u.name, email: u.email, mobile: u.mobile,
    department: u.department, designation: u.designation,
    status: u.status, roles: u.roles
  }).replace(/"/g, '&quot;');

  return `
    <div class="admin-member-card" data-name="${u.name}">
      <div class="admin-member-header">
        <img src="${avUrl}" class="admin-member-avatar" alt="${u.name}"/>
        <div class="admin-member-info">
          <div class="admin-member-name">
            ${u.name}
            <span class="admin-role-badge role-${roleName}">${roleName.charAt(0).toUpperCase() + roleName.slice(1)}</span>
            <span class="admin-status-dot ${u.status === 'active' ? 'active' : 'inactive'}"></span>
          </div>
          <div class="admin-member-email">${u.email}${u.mobile ? ` · ${u.mobile}` : ''}</div>
          <div class="admin-member-meta">
            ${u.department ? `<span class="admin-meta-chip">${u.department}</span>` : ''}
            ${u.designation ? `<span class="admin-meta-chip">${u.designation}</span>` : ''}
            <span class="admin-member-last">Last active: ${lastAc}</span>
          </div>
        </div>
        <div class="admin-member-stats">
          <div class="admin-stat-pill">
            <span class="admin-stat-num">${s.total}</span>
            <span class="admin-stat-lbl">Total</span>
          </div>
          <div class="admin-stat-pill amber">
            <span class="admin-stat-num">${s.in_progress}</span>
            <span class="admin-stat-lbl">Active</span>
          </div>
          <div class="admin-stat-pill green">
            <span class="admin-stat-num">${s.completed}</span>
            <span class="admin-stat-lbl">Done</span>
          </div>
          ${s.overdue > 0 ? `
          <div class="admin-stat-pill red">
            <span class="admin-stat-num">${s.overdue}</span>
            <span class="admin-stat-lbl">Overdue</span>
          </div>` : ''}
        </div>
        <div class="admin-member-actions">
          <button class="btn btn-ghost btn-sm admin-reset-pw-btn" data-user-id="${u.id}" data-user-name="${u.name}" title="Reset password">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path stroke-linecap="round" d="M7 11V7a5 5 0 0110 0v4"/></svg>
          </button>
          <button class="btn btn-ghost btn-sm admin-edit-btn" data-user="${editData}" title="Edit member">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path stroke-linecap="round" stroke-linejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-ghost btn-sm admin-delete-btn" data-user-id="${u.id}" data-user-name="${u.name}" title="Remove member">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
          ${tasks.length > 0 ? `
          <button class="admin-expand-btn btn btn-ghost btn-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
            Show tasks
          </button>` : ''}
        </div>
      </div>
      ${tasks.length > 0 ? `
      <div class="admin-task-list hidden">
        <div class="admin-task-list-head">
          <span>Task</span><span>Project</span><span>Status</span><span>Due</span>
        </div>
        ${tasks.map(t => adminTaskRow(t)).join('')}
      </div>
      ` : `<div class="admin-no-tasks">No tasks assigned to this member</div>`}
    </div>`;
}

function adminTaskRow(t) {
  const od = isOverdue(t.due_date, t.status);
  return `
    <div class="admin-task-row" data-task-id="${t.id}">
      <div class="admin-task-title-cell">
        ${priorityBadge(t.priority)}
        <span class="admin-task-title">${t.title}</span>
      </div>
      <div>
        ${t.project
          ? `<span class="task-proj-chip" style="background:${t.project.color}18;color:${t.project.color}">${t.project.name}</span>`
          : `<span class="muted">—</span>`}
      </div>
      <div>${statusPill(t.status)}</div>
      <div>
        ${t.due_date
          ? `<span class="task-due ${od ? 'overdue' : ''}">📅 ${formatDate(t.due_date)}</span>`
          : `<span class="muted">—</span>`}
      </div>
    </div>`;
}
