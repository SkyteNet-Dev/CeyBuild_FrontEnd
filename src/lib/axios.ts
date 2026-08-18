import axios from "axios";
import { auth } from "./firebase";
import { getIdToken, signOut } from "firebase/auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    if (auth.currentUser) {
      const token = await getIdToken(auth.currentUser, true);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await signOut(auth);
      } catch {}
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default api;
