import apiClient from './apiClient';

export const ingestFile = async (fileId) => {
  const response = await apiClient.post(`/rag/ingest/${fileId}`);
  return response.data;
};
export const getIngestedFileIds = async () => {
  const response = await apiClient.get('/rag/ingested');
  return response.data;
};

export const chatWithRag = async (question, fileId = null) => {
  const response = await apiClient.post('/rag/chat', { question, fileId });
  return response.data;
};

export const clearConversation = async () => {
  const response = await apiClient.delete('/rag/conversation');
  return response.data;
};
