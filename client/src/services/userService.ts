import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

// Set up axios instance
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
  // Get all users
  getUsers: async () => {
    const response = await api.get('/');
    return response.data;
  },

  // Get a single user
  getUser: async (id: string) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // Create a new user
  createUser: async (userData: Partial<User>) => {
    const response = await api.post('/', userData);
    return response.data;
  },

  // Update a user
  updateUser: async (id: string, userData: Partial<User>) => {
    const response = await api.put(`/${id}`, userData);
    return response.data;
  },

  // Delete a user
  deleteUser: async (id: string) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },
}; 