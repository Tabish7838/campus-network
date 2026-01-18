import { apiFetch } from './apiClient.js';

export const fetchFeed = (params) => apiFetch('/api/feed', { params });

export const createFeedPost = (payload) =>
  apiFetch('/api/feed', {
    method: 'POST',
    data: payload,
  });

export const joinFeedPost = (postId, payload) =>
  apiFetch(`/api/feed/${postId}/join`, {
    method: 'POST',
    data: payload,
  });
