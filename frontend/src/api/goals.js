import { api } from './apiClient.js';

export const getGoals    = (params)     => api.get('/goals', params);
export const createGoal  = (data)       => api.post('/goals', data);
export const updateGoal  = (id, data)   => api.patch(`/goals/${id}`, data);
export const deleteGoal  = (id)         => api.delete(`/goals/${id}`);
