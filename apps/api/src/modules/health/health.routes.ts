import { Router } from 'express';
import mongoose from 'mongoose';

import { getRedisClient } from '../../infrastructure/cache/redis.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: getRedisClient().status === 'ready' ? 'connected' : 'disconnected',
    },
  });
});

export default router;
