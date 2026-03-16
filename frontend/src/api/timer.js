import { api } from './apiClient.js';

export const startTimer    = (taskId)        => api.post(`/tasks/${taskId}/timer/start`);
export const pauseTimer    = (taskId)        => api.post(`/tasks/${taskId}/timer/pause`);
export const resumeTimer   = (taskId)        => api.post(`/tasks/${taskId}/timer/resume`);
export const stopTimer     = (taskId, notes) => api.post(`/tasks/${taskId}/timer/stop`, { notes });
export const addManualLog  = (taskId, data)  => api.post(`/tasks/${taskId}/timer/manual`, data);
export const getTimerLogs  = (taskId)        => api.get(`/tasks/${taskId}/timer/logs`);
export const getActiveTimer = ()             => api.get('/timer/active');
