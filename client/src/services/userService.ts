import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export const userService = {
  getUsers: async () => {
    const response = await api.get('/');
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  createUser: async (userData: Partial<User>) => {
    const response = await api.post('/', userData);
    return response.data;
  },

  updateUser: async (id: string, userData: Partial<User>) => {
    const response = await api.put(`/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },
}; 