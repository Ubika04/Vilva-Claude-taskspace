import { api } from './apiClient.js';

export const getProjectTasks  = (projectId, params) => api.get(`/projects/${projectId}/tasks`, params);
export const getKanbanBoard   = (projectId)          => api.get(`/projects/${projectId}/kanban`);
export const getTask          = (id)                 => api.get(`/tasks/${id}`);
export const createTask       = (projectId, data)    => api.post(`/projects/${projectId}/tasks`, data);
export const updateTask       = (id, data)           => api.patch(`/tasks/${id}`, data);
export const deleteTask       = (id)                 => api.delete(`/tasks/${id}`);
export const moveTask         = (id, data)           => api.post(`/tasks/${id}/move`, data);
export const reorderTasks     = (projectId, data)    => api.post(`/projects/${projectId}/tasks/reorder`, data);
export const getMyTasks       = (params)             => api.get('/my-tasks', params);
export const getOverdueTasks  = ()                   => api.get('/overdue');

// Comments
export const getComments    = (taskId)       => api.get(`/tasks/${taskId}/comments`);
export const postComment    = (taskId, data) => api.post(`/tasks/${taskId}/comments`, data);
export const updateComment  = (id, body)     => api.put(`/comments/${id}`, { body });
export const deleteComment  = (id)           => api.delete(`/comments/${id}`);

// Attachments
export const uploadAttachment  = (taskId, formData) => api.upload(`/tasks/${taskId}/attachments`, formData);
export const downloadAttachment = (id)              => api.get(`/attachments/${id}/download`);
export const deleteAttachment  = (id)               => api.delete(`/attachments/${id}`);

// Dependencies
export const getDependencies    = (taskId)       => api.get(`/tasks/${taskId}/dependencies`);
export const addDependency      = (taskId, data) => api.post(`/tasks/${taskId}/dependencies`, data);
export const removeDependency   = (taskId, depId)=> api.delete(`/tasks/${taskId}/dependencies/${depId}`);
