import { apiFetch } from './apiClient.js';

export const fetchEvents = (params) => apiFetch('/api/events', { params });

export const joinEventTeam = (eventId, payload) =>
  apiFetch(`/api/events/${eventId}/team`, {
    method: 'POST',
    data: payload,
  });
