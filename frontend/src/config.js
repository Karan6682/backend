// Central API/socket URLs driven by Vite env variables
// Set a safe production fallback to the deployed backend so any stale builds
// still point to the correct backend until a proper VERCEL env is set.
export const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-v15h.vercel.app';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE;
