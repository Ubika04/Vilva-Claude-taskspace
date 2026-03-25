/**
 * Profile Module — Full user profile with stats, projects, and settings.
 */

import { api } from '@api/apiClient.js';
import { store } from '@store/store.js';
import { showToast } from '@components/toast.js';
import { avatarUrl } from '@utils/helpers.js';

export async function renderProfile(container) {
  container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  let user;
  try {
    user = await api.get('/me');
    store.set('user', user);
  } catch {
    user = store.get('user') || {};
  }

  const roleName = user.roles?.[0]?.name || user.roles?.[0] || 'Member';
  const roleDisplay = roleName.charAt(0).toUpperCase() + roleName.slice(1);
  const stats = user.task_stats || { total: 0, in_progress: 0, completed: 0, overdue: 0 };
  const projects = user.projects || [];
  const joined = user.created_at ? new Date(user.created_at).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>My Profile</h1>
        <p>Manage your account information and preferences</p>
      </div>
    </div>

    <div class="profile-layout">

      <!-- Left Column: Avatar + Info Card -->
      <div class="profile-left-col">
        <div class="profile-avatar-card card">
          <div class="profile-avatar-wrap">
            <img id="profile-avatar-preview" src="${user.avatar_url || avatarUrl(user)}" class="profile-avatar-img" alt="${user.name || ''}"/>
            <label class="profile-avatar-overlay" for="avatar-input" title="Change photo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </label>
            <input type="file" id="avatar-input" accept="image/*" style="display:none"/>
          </div>
          <div class="profile-card-name">${user.name || ''}</div>
          <div class="profile-card-role">
            <span class="admin-role-badge role-${roleName}">${roleDisplay}</span>
          </div>
          <div class="profile-card-email">${user.email || ''}</div>
          ${user.mobile ? `<div class="profile-card-meta">📱 ${user.mobile}</div>` : ''}
          ${user.department ? `<div class="profile-card-meta">🏢 ${user.department}</div>` : ''}
          ${user.designation ? `<div class="profile-card-meta">💼 ${user.designation}</div>` : ''}
          <div class="profile-card-meta" style="margin-top:8px;color:var(--muted);font-size:11px">Joined ${joined}</div>
          <div id="avatar-status" class="profile-avatar-status"></div>
        </div>

        <!-- Task Stats -->
        <div class="card" style="margin-top:14px;padding:18px">
          <h4 style="font-size:13px;font-weight:700;color:var(--text3);margin-bottom:12px">MY TASK STATS</h4>
          <div class="profile-stats-grid">
            <div class="profile-stat"><span class="profile-stat-num">${stats.total}</span><span class="profile-stat-lbl">Total</span></div>
            <div class="profile-stat" style="color:#f59e0b"><span class="profile-stat-num">${stats.in_progress}</span><span class="profile-stat-lbl">Active</span></div>
            <div class="profile-stat" style="color:#10b981"><span class="profile-stat-num">${stats.completed}</span><span class="profile-stat-lbl">Done</span></div>
            <div class="profile-stat" style="color:#ef4444"><span class="profile-stat-num">${stats.overdue}</span><span class="profile-stat-lbl">Overdue</span></div>
          </div>
        </div>

        <!-- Projects -->
        ${projects.length > 0 ? `
        <div class="card" style="margin-top:14px;padding:18px">
          <h4 style="font-size:13px;font-weight:700;color:var(--text3);margin-bottom:10px">MY PROJECTS</h4>
          <div class="profile-projects-list">
            ${projects.map(p => `
              <a href="#/projects/${p.id}" class="profile-project-chip" style="background:${p.color}12;color:${p.color};border:1px solid ${p.color}30">
                <span class="profile-proj-dot" style="background:${p.color}"></span>
                ${p.name}
              </a>`).join('')}
          </div>
        </div>` : ''}
      </div>

      <!-- Right Column: Forms -->
      <div class="profile-forms-col">

        <!-- Account Info -->
        <div class="card">
          <div class="card-header"><h3>Account Information</h3></div>
          <div class="card-body">
            <form id="profile-info-form">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div class="form-group">
                  <label class="form-label">Full Name</label>
                  <input type="text" id="pf-name" class="form-input" value="${user.name || ''}" placeholder="Your full name" required/>
                </div>
                <div class="form-group">
                  <label class="form-label">Email Address</label>
                  <input type="email" id="pf-email" class="form-input" value="${user.email || ''}" placeholder="you@example.com" required/>
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div class="form-group">
                  <label class="form-label">Mobile</label>
                  <input type="text" id="pf-mobile" class="form-input" value="${user.mobile || ''}" placeholder="+91 9876543210"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Department</label>
                  <input type="text" id="pf-dept" class="form-input" value="${user.department || ''}" placeholder="e.g. Engineering"/>
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div class="form-group">
                  <label class="form-label">Designation</label>
                  <input type="text" id="pf-desig" class="form-input" value="${user.designation || ''}" placeholder="e.g. Senior Developer"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Timezone</label>
                  <input type="text" id="pf-timezone" class="form-input" value="${user.timezone || 'UTC'}" placeholder="e.g. Asia/Kolkata"/>
                </div>
              </div>
              <div class="form-footer">
                <button type="submit" class="btn btn-primary" id="save-info-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Change Password -->
        <div class="card" style="margin-top:16px">
          <div class="card-header"><h3>Change Password</h3></div>
          <div class="card-body">
            <form id="profile-pw-form">
              <div class="form-group">
                <label class="form-label">Current Password</label>
                <input type="password" id="pf-current-pw" class="form-input" placeholder="Enter current password"/>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div class="form-group">
                  <label class="form-label">New Password</label>
                  <input type="password" id="pf-new-pw" class="form-input" placeholder="At least 8 characters"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Confirm New Password</label>
                  <input type="password" id="pf-confirm-pw" class="form-input" placeholder="Repeat new password"/>
                </div>
              </div>
              <div class="form-footer">
                <button type="submit" class="btn btn-primary" id="save-pw-btn">Update Password</button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>`;

  // ── Avatar upload ─────────────────────────────────────────────────────────
  document.getElementById('avatar-input').addEventListener('change', async function () {
    const file = this.files[0];
    if (!file) return;
    const statusEl = document.getElementById('avatar-status');
    statusEl.textContent = 'Uploading…';
    const reader = new FileReader();
    reader.onload = e => { document.getElementById('profile-avatar-preview').src = e.target.result; };
    reader.readAsDataURL(file);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.upload('/me/avatar', formData);
      const u = store.get('user');
      if (u) { u.avatar_url = res.avatar_url; store.set('user', u); }
      const sidebarAvatar = document.getElementById('sidebar-avatar');
      if (sidebarAvatar) sidebarAvatar.src = res.avatar_url;
      statusEl.textContent = '✓ Photo updated';
      showToast('Profile photo updated', 'success');
    } catch {
      statusEl.textContent = '✗ Upload failed';
      showToast('Failed to upload photo', 'error');
    }
  });

  // ── Save account info ─────────────────────────────────────────────────────
  document.getElementById('profile-info-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = document.getElementById('save-info-btn');
    btn.disabled = true; btn.textContent = 'Saving…';
    try {
      const payload = {
        name:        document.getElementById('pf-name').value.trim(),
        email:       document.getElementById('pf-email').value.trim(),
        mobile:      document.getElementById('pf-mobile').value.trim() || null,
        department:  document.getElementById('pf-dept').value.trim() || null,
        designation: document.getElementById('pf-desig').value.trim() || null,
        timezone:    document.getElementById('pf-timezone').value.trim() || 'UTC',
      };
      const updated = await api.patch('/me', payload);
      store.set('user', updated);
      const sidebarName = document.getElementById('sidebar-name');
      if (sidebarName) sidebarName.textContent = updated.name;
      container.querySelector('.profile-card-name').textContent = updated.name;
      container.querySelector('.profile-card-email').textContent = updated.email;
      showToast('Profile updated', 'success');
    } catch (err) {
      showToast(err?.message || 'Failed to save profile', 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Save Changes';
    }
  });

  // ── Change password ───────────────────────────────────────────────────────
  document.getElementById('profile-pw-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn    = document.getElementById('save-pw-btn');
    const newPw  = document.getElementById('pf-new-pw').value;
    const confPw = document.getElementById('pf-confirm-pw').value;
    if (newPw !== confPw) { showToast('Passwords do not match', 'error'); return; }
    if (newPw.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
    btn.disabled = true; btn.textContent = 'Updating…';
    try {
      await api.patch('/me', {
        current_password: document.getElementById('pf-current-pw').value,
        password: newPw,
        password_confirmation: confPw,
      });
      showToast('Password changed successfully', 'success');
      document.getElementById('pf-current-pw').value = '';
      document.getElementById('pf-new-pw').value = '';
      document.getElementById('pf-confirm-pw').value = '';
    } catch (err) {
      showToast(err?.message || 'Failed to change password', 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Update Password';
    }
  });
}
