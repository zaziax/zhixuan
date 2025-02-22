import { Request, Response } from 'express';
import redis from '../config/redis';

// 获取当前时间段的key
const getTimeSlotKey = () => {
  const now = new Date();
  const hour = now.getHours().toString().padStart(2, '0');
  const timeSlot = `${now.toISOString().split('T')[0]}:${hour}`;
  return timeSlot;
};

interface TimeStats {
  pv: number;
  uv: number;
}

interface StatsResponse {
  hourly: TimeStats;
  daily: TimeStats;
  weekly: TimeStats;
  monthly: TimeStats;
  yearly: TimeStats;
  tarotCalls: number;
  ichingCalls: number;
}

export const getStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const timeKeys = {
      hourly: getTimeSlotKey(),
      daily: now.toISOString().split('T')[0],
      weekly: `${now.getFullYear()}-W${Math.ceil((now.getDate() + now.getDay()) / 7)}`,
      monthly: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`,
      yearly: now.getFullYear().toString()
    };

    const [
      tarotCalls,
      ichingCalls,
      ...stats
    ] = await Promise.all([
      redis.get('tarot_calls'),
      redis.get('iching_calls'),
      ...Object.entries(timeKeys).flatMap(([period, key]) => [
        redis.get(`pv:${period}:${key}`),
        redis.get(`uv:${period}:${key}`)
      ])
    ]);

    const response: StatsResponse = {
      hourly: {
        pv: parseInt(stats[0] || '0'),
        uv: parseInt(stats[1] || '0')
      },
      daily: {
        pv: parseInt(stats[2] || '0'),
        uv: parseInt(stats[3] || '0')
      },
      weekly: {
        pv: parseInt(stats[4] || '0'),
        uv: parseInt(stats[5] || '0')
      },
      monthly: {
        pv: parseInt(stats[6] || '0'),
        uv: parseInt(stats[7] || '0')
      },
      yearly: {
        pv: parseInt(stats[8] || '0'),
        uv: parseInt(stats[9] || '0')
      },
      tarotCalls: parseInt(tarotCalls || '0'),
      ichingCalls: parseInt(ichingCalls || '0')
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const incrementStats = async (req: Request) => {
  if (req.path === '/api/stats') return;

  const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
  const now = new Date();
  
  const timeKeys = {
    hourly: getTimeSlotKey(),
    daily: now.toISOString().split('T')[0],
    weekly: `${now.getFullYear()}-W${Math.ceil((now.getDate() + now.getDay()) / 7)}`,
    monthly: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`,
    yearly: now.getFullYear().toString()
  };

  try {
    // 只统计前端路由的访问
    const isFrontendRoute = (
      req.method === 'GET' && 
      !req.path.includes('.') &&
      ['/tarot', '/iching', '/stats', '/'].includes(req.path)
    );

    if (isFrontendRoute) {
      // 增加各时间维度的 PV
      await Promise.all([
        redis.incr(`pv:hourly:${timeKeys.hourly}`),
        redis.incr(`pv:daily:${timeKeys.daily}`),
        redis.incr(`pv:weekly:${timeKeys.weekly}`),
        redis.incr(`pv:monthly:${timeKeys.monthly}`),
        redis.incr(`pv:yearly:${timeKeys.yearly}`)
      ]);

      // 处理各时间维度的 UV
      for (const [period, key] of Object.entries(timeKeys)) {
        const visitorKey = `visitors:${period}:${key}`;
        const hasVisited = await redis.sismember(visitorKey, clientIP);
        if (!hasVisited) {
          await Promise.all([
            redis.sadd(visitorKey, clientIP),
            redis.incr(`uv:${period}:${key}`)
          ]);
        }
      }

      // 设置过期时间
      const expiryTimes = {
        hourly: 48 * 3600,
        daily: 30 * 24 * 3600,
        weekly: 90 * 24 * 3600,
        monthly: 365 * 24 * 3600,
        yearly: 2 * 365 * 24 * 3600
      };

      for (const [period, key] of Object.entries(timeKeys)) {
        const expiry = expiryTimes[period as keyof typeof expiryTimes];
        await Promise.all([
          redis.expire(`pv:${period}:${key}`, expiry),
          redis.expire(`uv:${period}:${key}`, expiry),
          redis.expire(`visitors:${period}:${key}`, expiry)
        ]);
      }
    }
  } catch (error) {
    console.error('Error incrementing stats:', error);
  }
};

export const initializeStats = async () => {
  try {
    const now = new Date();
    const timeKeys = {
      hourly: getTimeSlotKey(),
      daily: now.toISOString().split('T')[0],
      weekly: `${now.getFullYear()}-W${Math.ceil((now.getDate() + now.getDay()) / 7)}`,
      monthly: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`,
      yearly: now.getFullYear().toString()
    };
    
    // 检查是否需要初始化
    const hasData = await redis.exists(`pv:${timeKeys.hourly}`);
    
    if (!hasData) {
      // 初始化各时间维度的数据
      await Promise.all([
        ...Object.entries(timeKeys).flatMap(([period, key]) => [
          redis.set(`pv:${period}:${key}`, '0'),
          redis.set(`uv:${period}:${key}`, '0')
        ]),
        redis.set('tarot_calls', '0'),
        redis.set('iching_calls', '0')
      ]);
    }
  } catch (error) {
    console.error('Error initializing stats:', error);
  }
};

// 添加新的统计方法
export const incrementPageView = async (req: Request, res: Response) => {
  try {
    const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
    const { page } = req.body; // 接收前端传来的页面路径
    
    const now = new Date();
    const timeKeys = {
      hourly: getTimeSlotKey(),
      daily: now.toISOString().split('T')[0],
      weekly: `${now.getFullYear()}-W${Math.ceil((now.getDate() + now.getDay()) / 7)}`,
      monthly: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`,
      yearly: now.getFullYear().toString()
    };

    // 增加 PV
    await Promise.all([
      redis.incr(`pv:hourly:${timeKeys.hourly}`),
      redis.incr(`pv:daily:${timeKeys.daily}`),
      redis.incr(`pv:weekly:${timeKeys.weekly}`),
      redis.incr(`pv:monthly:${timeKeys.monthly}`),
      redis.incr(`pv:yearly:${timeKeys.yearly}`)
    ]);

    // 处理 UV
    for (const [period, key] of Object.entries(timeKeys)) {
      const visitorKey = `visitors:${period}:${key}`;
      const hasVisited = await redis.sismember(visitorKey, clientIP);
      if (!hasVisited) {
        await Promise.all([
          redis.sadd(visitorKey, clientIP),
          redis.incr(`uv:${period}:${key}`)
        ]);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error incrementing page view:', error);
    res.status(500).json({ error: 'Failed to increment page view' });
  }
}; 