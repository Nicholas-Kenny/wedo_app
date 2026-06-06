// src/api/client.ts
import axios from "axios";

// Buat instance Axios dengan URL backend kita
export const apiClient = axios.create({
  baseURL: "http://localhost:3000",
});

// Interceptor: Satpam Frontend yang otomatis menyelipkan token
apiClient.interceptors.request.use(
  (config) => {
    // Kita akan menyimpan token di localStorage saat user login nanti
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
