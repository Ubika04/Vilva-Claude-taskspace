/**
 * Auth Module — Login / Register forms
 */

import { login, register } from '@api/auth.js';
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
        <input type="email" name="email" class="form-input" placeholder="you@company.com" required autocomplete="email" value="admin@vilva.com"/>
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input type="password" name="password" class="form-input" placeholder="••••••••" required autocomplete="current-password" value="password123"/>
      </div>
      <button type="submit" class="auth-btn" id="login-submit" style="margin-top:10px">
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
