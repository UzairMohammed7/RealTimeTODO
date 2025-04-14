import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL;

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isCheckingAuth: true,

  register: async (name, email, password) => {
    try {
        const res = await axios.post(`${API_URL}/api/users/register`, {name,email,password});
        set({ user: res.data.user, isAuthenticated: true, error: null });
        window.location.reload(); // Add this line
        return res.data;
    } catch (error) {
        set({ error: error.response?.data || { message: "Registration failed" } || { message: "Something went wrong" } });
        throw error;
    }
  },

  login: async (email, password) => {
    try {
        const res = await axios.post(`${API_URL}/api/users/login`, {email, password});
        set({ user: res.data.user, isAuthenticated: true, error: null });
        window.location.reload(); 
        return res.data;
    } catch (error) {
        set({ error: error.response?.data || { message: "Login failed" } || { message: "Something went wrong" }});
        throw error;
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API_URL}/api/users/logout`);
      set({ user: null, isAuthenticated: false, error: null });
      window.location.reload(); 
    } catch (error) {
      set({ error: error});
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/users/check-auth`);
      set({user: response.data.user, isAuthenticated: true, isCheckingAuth: false});
    } catch (error) {
      set({ error: error.message, isCheckingAuth: false, isAuthenticated: false, user: null});
    } finally {
      set({ isCheckingAuth: false });
    }
  },
    
}));
