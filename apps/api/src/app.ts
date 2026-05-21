import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { env } from './core/config/env.js';
import { errorHandler, notFoundHandler } from './core/errors/errorHandler.js';
import { logger } from './core/logger/logger.js';
import { globalRateLimiter } from './shared/middleware/rateLimiter.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import bookingRoutes from './modules/bookings/booking.routes.js';
import eventRoutes from './modules/events/event.routes.js';
import healthRoutes from './modules/health/health.routes.js';

export function createApp(): express.Application {
  const app = express();

  // Security
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // Performance
  app.use(compression());

  // Parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Logging
  app.use(pinoHttp({ logger }));

  // Rate limiting
  app.use(globalRateLimiter);

  // Trust proxy for rate limiting behind nginx
  app.set('trust proxy', 1);

  // Routes
  const apiPrefix = `/api/${env.API_VERSION}`;
  app.use('/health', healthRoutes);
  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/events`, eventRoutes);
  app.use(`${apiPrefix}/bookings`, bookingRoutes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
