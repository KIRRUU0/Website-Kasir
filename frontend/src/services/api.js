import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
});

// Otomatis menyuntikkan Token JWT jika ada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const checkout = async (data) => {
  return api.post(`/checkout?product_id=${data.product_id}&qty=${data.qty}&type=${data.type}`, data);
};

export default api;