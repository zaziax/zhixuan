/// <reference types="vite/client" />

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL
  : '/api';  // 开发环境指向本地后端 