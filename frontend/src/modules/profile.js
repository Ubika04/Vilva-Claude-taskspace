/**
 * Profile Module — Manage account info, avatar, and password.
 */

import { api } from '@api/apiClient.js';
import { store } from '@store/store.js';
import { showToast } from '@components/toast.js';
import { avatarUrl } from '@utils/helpers.js';

export async function renderProfile(container) {
  const user = store.get('user') || {};
  const roleName = user.roles?.[0]?.name || 'Member';

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Profile Settings</h1>
        <p>Manage your account information and security</p>
      </div>
    </div>

    <div class="profile-layout">

      <!-- Avatar Card -->
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
        <div class="profile-card-role">${roleName}</div>
        <div class="profile-card-email">${user.email || ''}</div>
        <div id="avatar-status" class="profile-avatar-status"></div>
      </div>

      <!-- Forms Column -->
      <div class="profile-forms-col">

        <!-- Account Info -->
        <div class="card">
          <div class="card-header"><h3>Account Information</h3></div>
          <div class="card-body">
            <form id="profile-info-form">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" id="pf-name" class="form-input" value="${user.name || ''}" placeholder="Your full name" required/>
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" id="pf-email" class="form-input" value="${user.email || ''}" placeholder="you@example.com" required/>
              </div>
              <div class="form-group">
                <label class="form-label">Timezone</label>
                <input type="text" id="pf-timezone" class="form-input" value="${user.timezone || 'UTC'}" placeholder="e.g. UTC, America/New_York"/>
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
              <div class="form-group">
                <label class="form-label">New Password</label>
                <input type="password" id="pf-new-pw" class="form-input" placeholder="At least 8 characters"/>
              </div>
              <div class="form-group">
                <label class="form-label">Confirm New Password</label>
                <input type="password" id="pf-confirm-pw" class="form-input" placeholder="Repeat new password"/>
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

    // Instant local preview
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('profile-avatar-preview').src = e.target.result;
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.upload('/me/avatar', formData);

      const u = store.get('user');
      if (u) {
        u.avatar_url = res.avatar_url;
        store.set('user', u);
        const sidebarAvatar = document.getElementById('sidebar-avatar');
        if (sidebarAvatar) sidebarAvatar.src = res.avatar_url;
      }

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
    btn.disabled = true;
    btn.textContent = 'Saving…';

    try {
      const payload = {
        name:     document.getElementById('pf-name').value.trim(),
        email:    document.getElementById('pf-email').value.trim(),
        timezone: document.getElementById('pf-timezone').value.trim() || 'UTC',
      };

      const updated = await api.patch('/me', payload);
      store.set('user', updated);

      // Sync sidebar
      const sidebarName = document.getElementById('sidebar-name');
      if (sidebarName) sidebarName.textContent = updated.name;

      // Refresh avatar card display
      container.querySelector('.profile-card-name').textContent  = updated.name;
      container.querySelector('.profile-card-email').textContent = updated.email;

      showToast('Profile updated', 'success');
    } catch (err) {
      showToast(err?.message || 'Failed to save profile', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save Changes';
    }
  });

  // ── Change password ───────────────────────────────────────────────────────
  document.getElementById('profile-pw-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn     = document.getElementById('save-pw-btn');
    const newPw   = document.getElementById('pf-new-pw').value;
    const confPw  = document.getElementById('pf-confirm-pw').value;

    if (newPw !== confPw) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (newPw.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Updating…';

    try {
      await api.patch('/me', {
        current_password:      document.getElementById('pf-current-pw').value,
        password:              newPw,
        password_confirmation: confPw,
      });

      showToast('Password changed successfully', 'success');
      document.getElementById('pf-current-pw').value = '';
      document.getElementById('pf-new-pw').value     = '';
      document.getElementById('pf-confirm-pw').value = '';
    } catch (err) {
      showToast(err?.message || 'Failed to change password', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Update Password';
    }
  });
}
