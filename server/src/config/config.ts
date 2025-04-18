import dotenv from 'dotenv';
import { ClientOptions } from 'openai';
import { RateLimitRequestHandler, rateLimit } from 'express-rate-limit';

dotenv.config();

// OpenAI 配置
export const openaiConfig: ClientOptions = {
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  maxRetries: 3,
  timeout: 30000,
};

// 服务器配置
export const serverConfig = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
};

// API 速率限制配置
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 20, // 限制每个IP 15分钟内最多20个请求
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
} as const;

export const aiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
  model: process.env.MODEL
}; 