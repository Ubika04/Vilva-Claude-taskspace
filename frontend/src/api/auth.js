import { api } from './apiClient.js';
import { store } from '@store/store.js';

export const login = async (email, password) => {
  const res = await api.post('/login', { email, password });
  localStorage.setItem('vilva_token', res.token);
  store.set('token', res.token);
  store.set('user', res.user);
  return res;
};

export const register = async (data) => {
  const res = await api.post('/register', data);
  localStorage.setItem('vilva_token', res.token);
  store.set('token', res.token);
  store.set('user', res.user);
  return res;
};

export const logout = () => api.post('/logout');

export const fetchCurrentUser = () => api.get('/me');
