import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import path from 'path';
import tarotRoutes from './routes/tarotRoutes';
import ichingRoutes from './routes/ichingRoutes';
import { serverConfig, rateLimitConfig } from './config/config';

const app = express();

// 基础中间件
app.use(cors());
app.use(express.json());

// 速率限制中间件
app.use(rateLimit(rateLimitConfig));

// API路由
app.use('/api/tarot', tarotRoutes);
app.use('/api/iching', ichingRoutes);

// 处理前端路由
app.get(['/', '/tarot', '/iching'], (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    next();
    return;
  }
  // 在生产环境中返回前端构建的index.html
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  } else {
    // 在开发环境中，让Vite处理
    next();
  }
});

app.listen(serverConfig.port, () => {
  console.log(`服务器运行在 http://localhost:${serverConfig.port}`);
  console.log(`当前环境: ${serverConfig.nodeEnv}`);
});

export default app; 