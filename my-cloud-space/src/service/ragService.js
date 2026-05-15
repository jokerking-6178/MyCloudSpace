import axios from 'axios';

const API_URL = "http://localhost:8081/api/rag";

// Create axios instance with interceptor for auth token
const api = axios.create({
    baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const ingestFile = async (fileId, userId) => {
    try {
        const response = await api.post(`/ingest/${fileId}`, null, {
            params: { userId }
        });
        return response.data;
    } catch (error) {
        console.error('Ingest error:', error);
        throw error;
    }
};

export const chatWithRag = async (userId, question, fileId = null) => {
    try {
        const response = await api.post('/chat', {
            userId,
            question,
            fileId
        });
        return response.data;
    } catch (error) {
        console.error('Chat error:', error);
        throw error;
    }
};

export const clearConversation = async (userId) => {
    try {
        await api.delete(`/conversation/${userId}`);
    } catch (error) {
        console.error('Clear conversation error:', error);
        throw error;
    }
};