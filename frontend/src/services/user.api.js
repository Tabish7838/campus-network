import { apiFetch } from './apiClient.js';

export const getMe = () => apiFetch('/api/users/me');

export const endorsePeer = (payload) =>
  apiFetch('/api/trust/endorse', {
    method: 'POST',
    data: payload,
  });
