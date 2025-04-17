import axios from "axios";
const API_URL = import.meta.env.VITE_BASE_URL;

export const fetchPrivateTasks = async (token) =>
  axios.get(`${API_URL}/api/tasks/private`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchSharedTasks = async (token) =>
  axios.get(`${API_URL}/api/tasks/shared`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createTask = async (title, token) =>
  axios.post(`${API_URL}/api/tasks`, { title }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const generateInviteLink = async (taskId, token) =>
  axios.post(`${API_URL}/api/tasks/generate-link/${taskId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const acceptInvite = async (token, authToken) =>
  axios.post(`${API_URL}/api/tasks/accept-invite/${token}`, {}, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
