import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  signup: (data: { email: string; password: string; full_name: string; phone?: string }) =>
    api.post('/auth/signup', data),

  me: () => api.get('/auth/me')
};

export const appointmentsAPI = {
  list: (params?: any) => api.get('/appointments', { params }),
  create: (data: any) => api.post('/appointments', data),
  get: (id: string) => api.get(`/appointments/${id}`),
  cancel: (id: string) => api.delete(`/appointments/${id}`),
  getAvailableSlots: (professionalId: string, date: string, procedureId: string) =>
    api.get(`/appointments/available-slots/${professionalId}`, {
      params: { date, procedimento_id: procedureId }
    })
};

export const proceduresAPI = {
  list: () => api.get('/procedures'),
  get: (id: string) => api.get(`/procedures/${id}`)
};

export const productsAPI = {
  list: () => api.get('/inventory?for_sale_only=true'),
  get: (id: string) => api.get(`/inventory/${id}`)
};

export const ordersAPI = {
  create: (data: any) => api.post('/orders', data),
  list: (patientId: string) => api.get(`/orders/patient/${patientId}`),
  get: (id: string) => api.get(`/orders/${id}`)
};

export const telemedicineAPI = {
  createSession: (data: any) => api.post('/telemedicine/sessions', data),
  getSession: (id: string) => api.get(`/telemedicine/sessions/${id}`),
  startSession: (id: string) => api.patch(`/telemedicine/sessions/${id}/start`),
  endSession: (id: string, notes?: string) => api.patch(`/telemedicine/sessions/${id}/end`, { notes })
};

export default api;
