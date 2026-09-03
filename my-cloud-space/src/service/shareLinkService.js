import apiClient, { API_BASE_URL } from './apiClient';

export const createShareLink = async (fileId, { expirySeconds, maxDownloads }) => {
  const response = await apiClient.post(`/share/links/${fileId}`, { expirySeconds, maxDownloads });
  return response.data;
};

export const getMyShareLinks = async () => {
  const response = await apiClient.get('/share/links');
  return response.data;
};

export const revokeShareLink = async (token) => {
  const response = await apiClient.delete(`/share/links/${token}`);
  return response.data;
};

export const publicLinkUrl = (token) => `${API_BASE_URL}/api/share/download/${token}`;
