import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

// Use the current domain in production, fallback to localhost in development
const API_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:5000';

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
      const response = await axios.post(`${API_URL}/api/auth/login`, {
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
      const response = await axios.post(`${API_URL}/api/links`, linkData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      set((state) => ({
        links: [response.data, ...state.links],
        totalLinks: state.totalLinks + 1,
        error: null
      }));
      return response.data;
    } catch (error) {
      console.error('Error creating link:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create link';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchLinks: async (page = 1, search = '') => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`${API_URL}/api/links`, {
        params: { page, search },
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Ensure we have valid data before setting state
      const links = response.data?.links || [];
      const total = response.data?.total || 0;
      
      set({
        links,
        totalLinks: total,
        currentPage: page,
        searchQuery: search,
        error: null
      });
    } catch (error) {
      console.error('Error fetching links:', error);
      set({ 
        error: error.response?.data?.error || 'Failed to fetch links',
        links: [],
        totalLinks: 0
      });
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