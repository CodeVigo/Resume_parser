import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ——— Auth token refresh interceptor ———
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        await api.post("/auth/refresh");
        return api(original);
      } catch {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ——— AUTH ———
export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const logout = () => api.post("/auth/logout");
export const getProfile = () => api.get("/auth/me");
export const updateProfile = (data) => api.put("/auth/me", data);

// ——— RESUME ———
export const uploadResume = (formData) =>
  api.post("/upload/resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getParsedResume = (id, jobId) =>
  api.get(`/upload/resume/${id}/parsed${jobId ? `?jobId=${jobId}` : ""}`);

// ——— JOBS ———
export const getAllJobs = (page = 1, limit = 0) =>
  api.get("/jobs", { params: { page, limit } });
export const getJobById = (id) => api.get(`/jobs/${id}`);
export const createJob = (data) => api.post("/jobs", data);
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);
export const getRecruiterJobs = (page = 1, limit = 0) =>
  api.get("/jobs/my/jobs", { params: { page, limit } });

// ——— STUDENT ACTIONS ———
export const saveJob = (jobId) => api.post(`/jobs/${jobId}/save`);
export const getSavedJobs = () =>
  api.get("/auth/me").then((res) => res.data.user.savedJobs || []);
export const applyJob = (jobId) => api.post("/candidates/apply", { jobId });
export const getAppliedJobs = () =>
  api.get("/auth/me").then((res) => res.data.user.appliedJobs || []);

// ——— CANDIDATES ———
export const getJobCandidates = (jobId) => api.get(`/candidates/job/${jobId}`);
export const getCandidateDetail = (rid, jobId) =>
  api.get(`/candidates/detail/${rid}${jobId ? `?jobId=${jobId}` : ""}`);
export const shortlistCandidate = (payload) =>
  api.post("/candidates/shortlist", payload);
export const getMyShortlists = () => api.get("/candidates/my/scores");
export const getCandidatesOverview = () => api.get("/candidates/overview");

export default api;
