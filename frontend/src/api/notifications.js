import { api } from './apiClient.js';

export const getNotifications = (params) => api.get('/notifications', params);
export const getUnread        = ()       => api.get('/notifications/unread');
export const markRead         = (id)     => api.post(`/notifications/${id}/read`);
export const markAllRead      = ()       => api.post('/notifications/read-all');
