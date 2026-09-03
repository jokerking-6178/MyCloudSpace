import apiClient, { clearStoredToken, setStoredToken } from './apiClient';


export const registerUser = async (data) => {
  const response = await apiClient.post('/user/register', data);
  return response.data;
};

export const login = async (credentials) => {
  const response = await apiClient.post('/user/login', credentials);
  const { token, user } = response.data;
  setStoredToken(token);
  return { token, user };
};

export const fetchCurrentUser = async () => {
  const response = await apiClient.get('/user/me');
  return response.data;
};

export const logout = () => {
  clearStoredToken();
};
