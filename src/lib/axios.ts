import axios from 'axios';

// Cria uma instância base do axios
export const api = axios.create({
  baseURL: '/api', // Todas as requisições irão para /api/...
});