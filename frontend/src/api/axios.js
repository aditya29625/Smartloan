import axios from 'axios'

// In production (Vercel), VITE_API_URL points to the live Render backend.
// In local dev it falls back to localhost:8000.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// ── Request interceptor: attach JWT ───────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor: handle 401 globally ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
}

// ── Predictions ───────────────────────────────────────────────────────────────
export const predictionApi = {
  predict:    (data) => api.post('/predictions/predict', data),
  getHistory: (params) => api.get('/predictions/history', { params }),
  getById:    (id) => api.get(`/predictions/history/${id}`),
  exportCsv:  () => api.get('/predictions/history/export/csv', { responseType: 'blob' }),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  get: () => api.get('/dashboard'),
}

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  get:    () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
}

export default api
