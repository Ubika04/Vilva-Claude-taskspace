import { api } from './apiClient.js';

export const getMilestones      = (projectId)               => api.get(`/projects/${projectId}/milestones`);
export const createMilestone    = (projectId, data)         => api.post(`/projects/${projectId}/milestones`, data);
export const updateMilestone    = (projectId, id, data)     => api.patch(`/projects/${projectId}/milestones/${id}`, data);
export const deleteMilestone    = (projectId, id)           => api.delete(`/projects/${projectId}/milestones/${id}`);
