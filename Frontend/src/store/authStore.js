import { create } from "zustand";
import axios from "axios";

const useAuthStore = create((set) => ({
    user: null,
    login: async (email, password) => {
        const res = await axios.post("http://localhost:5000/api/users/login", { email, password });
        set({ user: res.data });
    },
    logout: () => set({ user: null }),
}));

export default useAuthStore;
