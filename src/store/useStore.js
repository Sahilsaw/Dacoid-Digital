import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useStore = create((set) => ({
  // Auth state
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  user: null,

  // Link state
  links: [],
  totalLinks: 0,
  currentPage: 1,
  searchQuery: '',
  isLoading: false,
  error: null,

  // Analytics state
  analytics: null,
  isLoadingAnalytics: false,

  // Auth actions
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      const { token } = response.data;
      localStorage.setItem('token', token);
      set({ token, isAuthenticated: true });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Login failed' });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, isAuthenticated: false, user: null });
  },

  // Link actions
  createLink: async (linkData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(`${API_URL}/links`, linkData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      set((state) => ({
        links: [response.data, ...state.links],
        totalLinks: state.totalLinks + 1
      }));
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create link';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchLinks: async (page = 1, search = '') => {
    try {
      set({ isLoading: true });
      const response = await axios.get(`${API_URL}/links`, {
        params: { page, search },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      set({
        links: response.data.links,
        totalLinks: response.data.total,
        currentPage: page,
        searchQuery: search
      });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch links' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Analytics actions
  fetchAnalytics: async (linkId) => {
    try {
      set({ isLoadingAnalytics: true });
      const response = await axios.get(`${API_URL}/analytics/${linkId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      set({ analytics: response.data });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch analytics' });
    } finally {
      set({ isLoadingAnalytics: false });
    }
  },

  // Redirect actions
  getOriginalUrl: async (shortCode) => {
    try {
      const response = await axios.get(`${API_URL}/links/${shortCode}`);
      return response.data.originalUrl;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to get original URL' });
      return null;
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}));

export default useStore; 