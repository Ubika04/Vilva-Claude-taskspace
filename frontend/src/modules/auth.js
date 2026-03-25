/**
 * Auth Module — Login / Register / Forgot Password forms
 */

import { login, register } from '@api/auth.js';
import { api } from '@api/apiClient.js';
import { showToast } from '@components/toast.js';

export function initAuth() {
  renderLoginForm();
}

function renderLoginForm() {
  document.getElementById('auth-form-slot').innerHTML = `
    <form id="login-form">
      <h2 class="auth-heading">Welcome back</h2>
      <p class="auth-sub">Sign in to your workspace</p>
      <div class="form-group">
        <label class="form-label">Email address</label>
        <input type="email" name="email" class="form-input" placeholder="you@company.com" required autocomplete="email"/>
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input type="password" name="password" class="form-input" placeholder="••••••••" required autocomplete="current-password"/>
      </div>
      <div style="text-align:right;margin-bottom:6px">
        <a href="#" id="go-forgot" class="auth-forgot-link">Forgot password?</a>
      </div>
      <button type="submit" class="auth-btn" id="login-submit">
        Sign In
      </button>
      <p class="auth-switch">New to Vilva? <a href="#" id="go-register">Create an account</a></p>
    </form>`;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-submit');
    btn.textContent = 'Signing in…';
    btn.disabled = true;

    try {
      await login(e.target.email.value, e.target.password.value);
      location.reload();
    } catch (err) {
      btn.textContent = 'Sign In';
      btn.disabled = false;
    }
  });

  document.getElementById('go-register').addEventListener('click', (e) => {
    e.preventDefault();
    renderRegisterForm();
  });

  document.getElementById('go-forgot').addEventListener('click', (e) => {
    e.preventDefault();
    renderForgotForm();
  });
}

function renderRegisterForm() {
  document.getElementById('auth-form-slot').innerHTML = `
    <form id="register-form">
      <h2 class="auth-heading">Create account</h2>
      <p class="auth-sub">Start managing your work today</p>
      <div class="form-group">
        <label class="form-label">Full name</label>
        <input type="text" name="name" class="form-input" placeholder="Jane Smith" required autocomplete="name"/>
      </div>
      <div class="form-group">
        <label class="form-label">Work email</label>
        <input type="email" name="email" class="form-input" placeholder="you@company.com" required autocomplete="email"/>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" name="password" class="form-input" placeholder="Min. 8 characters" required autocomplete="new-password"/>
        </div>
        <div class="form-group">
          <label class="form-label">Confirm password</label>
          <input type="password" name="password_confirmation" class="form-input" placeholder="Confirm" required autocomplete="new-password"/>
        </div>
      </div>
      <button type="submit" class="auth-btn" id="register-submit" style="margin-top:10px">
        Create Account
      </button>
      <p class="auth-switch">Already have an account? <a href="#" id="go-login">Sign in</a></p>
    </form>`;

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('register-submit');
    btn.textContent = 'Creating account…';
    btn.disabled = true;

    const fd = new FormData(e.target);
    try {
      await register(Object.fromEntries(fd.entries()));
      location.reload();
    } catch (err) {
      btn.textContent = 'Create Account';
      btn.disabled = false;
    }
  });

  document.getElementById('go-login').addEventListener('click', (e) => {
    e.preventDefault();
    renderLoginForm();
  });
}

// ── Forgot Password Step 1: Enter email ────────────────────────────────────

function renderForgotForm() {
  document.getElementById('auth-form-slot').innerHTML = `
    <form id="forgot-form">
      <h2 class="auth-heading">Forgot password?</h2>
      <p class="auth-sub">Enter your email and we'll send you a 6-digit reset code</p>
      <div class="form-group">
        <label class="form-label">Email address</label>
        <input type="email" name="email" class="form-input" placeholder="you@company.com" required autocomplete="email"/>
      </div>
      <button type="submit" class="auth-btn" id="forgot-submit">
        Send Reset Code
      </button>
      <p class="auth-switch"><a href="#" id="go-login">Back to sign in</a></p>
    </form>`;

  document.getElementById('forgot-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('forgot-submit');
    const email = e.target.email.value.trim();
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const res = await api.post('/forgot-password', { email });
      // In dev mode the API returns the code directly
      if (res.reset_code) {
        showToast(`Reset code: ${res.reset_code}`, 'success');
      } else {
        showToast('Reset code sent to your email', 'success');
      }
      renderResetForm(email, res.reset_code || '');
    } catch (err) {
      btn.textContent = 'Send Reset Code';
      btn.disabled = false;
      showToast(err?.message || 'Failed to send reset code', 'error');
    }
  });

  document.getElementById('go-login').addEventListener('click', (e) => {
    e.preventDefault();
    renderLoginForm();
  });
}

// ── Forgot Password Step 2: Enter code + new password ──────────────────────

function renderResetForm(email, prefillCode) {
  document.getElementById('auth-form-slot').innerHTML = `
    <form id="reset-form">
      <h2 class="auth-heading">Reset password</h2>
      <p class="auth-sub">Enter the 6-digit code and your new password</p>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input type="email" class="form-input" value="${email}" readonly style="opacity:.7"/>
      </div>
      <div class="form-group">
        <label class="form-label">Reset Code</label>
        <input type="text" name="code" class="form-input" placeholder="6-digit code" required maxlength="6"
               value="${prefillCode}" style="letter-spacing:6px;font-size:18px;font-weight:700;text-align:center"/>
      </div>
      <div class="form-group">
        <label class="form-label">New Password</label>
        <input type="password" name="password" class="form-input" placeholder="Min. 8 characters" required autocomplete="new-password"/>
      </div>
      <div class="form-group">
        <label class="form-label">Confirm New Password</label>
        <input type="password" name="password_confirmation" class="form-input" placeholder="Confirm password" required autocomplete="new-password"/>
      </div>
      <button type="submit" class="auth-btn" id="reset-submit">
        Reset Password
      </button>
      <p class="auth-switch"><a href="#" id="go-login">Back to sign in</a></p>
    </form>`;

  document.getElementById('reset-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('reset-submit');
    const code = e.target.code.value.trim();
    const password = e.target.password.value;
    const passwordConfirmation = e.target.password_confirmation.value;

    if (password !== passwordConfirmation) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    btn.textContent = 'Resetting…';
    btn.disabled = true;

    try {
      const res = await api.post('/reset-password', {
        email, code, password, password_confirmation: passwordConfirmation,
      });
      showToast(res.message || 'Password reset! You can now sign in.', 'success');
      renderLoginForm();
    } catch (err) {
      btn.textContent = 'Reset Password';
      btn.disabled = false;
      showToast(err?.message || 'Reset failed', 'error');
    }
  });

  document.getElementById('go-login').addEventListener('click', (e) => {
    e.preventDefault();
    renderLoginForm();
  });
}
