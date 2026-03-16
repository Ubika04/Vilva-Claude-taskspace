/**
 * Vilva Taskspace — API Client
 * Centralized fetch wrapper with auth, error handling, and response parsing.
 */

import { store } from '@store/store.js';
import { showToast } from '@components/toast.js';

const BASE_URL = '/api/v1';

class ApiClient {
  async request(method, endpoint, data = null, options = {}) {
    const token   = store.get('token') || localStorage.getItem('vilva_token');
    const headers = {
      'Accept':       'application/json',
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const config = {
      method,
      headers,
    };

    if (data && method !== 'GET') {
      if (data instanceof FormData) {
        delete headers['Content-Type']; // Let browser set multipart boundary
        config.body = data;
      } else {
        config.body = JSON.stringify(data);
      }
    }

    const url = data && method === 'GET'
      ? `${BASE_URL}${endpoint}?${new URLSearchParams(data)}`
      : `${BASE_URL}${endpoint}`;

    const response = await fetch(url, config);

    if (response.status === 401) {
      localStorage.removeItem('vilva_token');
      location.reload();
      return;
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await response.json() : await response.text();

    if (! response.ok) {
      const message = body?.message || body?.error || `HTTP ${response.status}`;
      showToast(message, 'error');
      throw new Error(message);
    }

    return body;
  }

  get(endpoint, params = null)       { return this.request('GET',    endpoint, params); }
  post(endpoint, data = null)        { return this.request('POST',   endpoint, data); }
  put(endpoint, data = null)         { return this.request('PUT',    endpoint, data); }
  patch(endpoint, data = null)       { return this.request('PATCH',  endpoint, data); }
  delete(endpoint)                   { return this.request('DELETE', endpoint); }
  upload(endpoint, formData)         { return this.request('POST',   endpoint, formData); }
}

export const api = new ApiClient();
