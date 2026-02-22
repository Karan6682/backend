// Central API/socket URLs driven by Vite env variables
export const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-v15h.vercel.app/';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE;
