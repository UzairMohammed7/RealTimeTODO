import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;

const useAuthStore = create((set) => ({
    user: null,
    register: async (name, email, password) => {
        const res = await axios.post("http://localhost:5000/api/users/register", { name, email, password });
        set({ user: res.data });
    },
    login: async (email, password) => {
        const res = await axios.post("http://localhost:5000/api/users/login", { email, password });
        set({ user: res.data });
    },
    logout: () => set({ user: null }),
}));

export default useAuthStore;
