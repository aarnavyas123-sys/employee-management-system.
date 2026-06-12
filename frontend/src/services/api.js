import axios from "axios";

const API = axios.create({
  // Base URL is configured dynamically to support Vercel/Render deployment base API routing
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
});

// Automatically inject JWT token in headers before every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn(
        "Axios Guardrail Notice: No token discovered in localStorage!",
      );
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ==========================================================================
// 📑 USER & AUTHENTICATION ENDPOINTS (Explicitly using /auth prefix map)
// ==========================================================================
export const loginUser = (credentials) => API.post("/auth/login", credentials);
export const signupUser = (userData) => API.post("/auth/signup", userData);

// Admin exclusive actions mapped with correct network routing layers
export const adminCreateUser = (userData) =>
  API.post("/auth/create-user", userData);
export const fetchAllUsers = () => API.get("/auth/users");

// 🛠️ FIX HERE: Role update endpoint with exact route context path matching backend router
export const adminUpdateUserRole = (id, role) =>
  API.put(`/auth/users/${id}/role`, { role });
export const adminUpdateUserStatus = (id, status) =>
  API.put(`/auth/users/${id}/status`, { status });
export const fetchAdminAnalytics = () => API.get("/auth/admin/analytics");
// ==========================================================================
// 📋 AUDIT MANAGEMENT ENDPOINTS (Advanced Dynamic Parameters Mapping)
// ==========================================================================
export const fetchFilteredAuditLogs = (params) =>
  API.get("/audit-logs", { params }); // Pass criteria parameters as an object directly

export default API;
