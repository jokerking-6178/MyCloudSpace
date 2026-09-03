import apiClient from './apiClient';


export const uploadFile = async (file, { onProgress } = {}) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });
  return response.data;
};

export const getFiles = async (query) => {
  const response = await apiClient.get('/files', {
    params: query ? { q: query } : undefined,
  });
  return response.data;
};

export const getSharedFiles = async () => {
  const response = await apiClient.get('/files/shared');
  return response.data;
};

export const deleteFile = async (fileId) => {
  const response = await apiClient.delete(`/files/${fileId}`);
  return response.data;
};

export const shareFile = async (fileId, email) => {
  const response = await apiClient.post(`/files/${fileId}/shares`, { email });
  return response.data;
};

export const unshareFile = async (fileId, email) => {
  const response = await apiClient.delete(`/files/${fileId}/shares`, { params: { email } });
  return response.data;
};

export const getFileShares = async (fileId) => {
  const response = await apiClient.get(`/files/${fileId}/shares`);
  return response.data;
};

export const downloadFile = async (fileId, fallbackName) => {
  const response = await apiClient.get(`/files/${fileId}/download`, { responseType: 'blob' });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileNameFromResponse(response) || fallbackName || 'download');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const fileNameFromResponse = (response) => {
  const header = response.headers?.['content-disposition'];
  if (!header) return null;

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return null;
    }
  }
  const plainMatch = header.match(/filename="?([^";]+)"?/i);
  return plainMatch ? plainMatch[1] : null;
};
