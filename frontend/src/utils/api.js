import axios from "axios";

// Axios instance for backend API
const api = axios.create({
  baseURL: "http://localhost:5000/api", // your backend base URL
});

// Add JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // JWT token stored after login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
