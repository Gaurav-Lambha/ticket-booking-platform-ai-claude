import 'dotenv/config';
import http from 'node:http';
import { Server as SocketServer } from 'socket.io';

import type { ClientToServerEvents, ServerToClientEvents } from '@repo/types';

import { createApp } from './app.js';
import { env } from './core/config/env.js';
import { logger } from './core/logger/logger.js';
import { connectMongoDB, disconnectMongoDB } from './infrastructure/database/mongodb.js';
import { disconnectRedis } from './infrastructure/cache/redis.js';
import { socketService } from './infrastructure/socket/socket.service.js';
import { BookingService } from './modules/bookings/booking.service.js';
import { BookingRepository } from './modules/bookings/booking.repository.js';
import { EventRepository } from './modules/events/event.repository.js';
import { SeatLockService } from './modules/bookings/seatLock.service.js';

async function bootstrap(): Promise<void> {
  await connectMongoDB();

  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new SocketServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  socketService.initialize(io);

  // Periodic job: expire stale pending bookings
  const bookingService = new BookingService(
    new BookingRepository(),
    new EventRepository(),
    new SeatLockService(),
    socketService,
  );

  const EXPIRY_CHECK_INTERVAL = 60 * 1000;
  setInterval(() => {
    bookingService.processExpiredBookings().catch((err) =>
      logger.error({ err }, 'Failed to process expired bookings'),
    );
  }, EXPIRY_CHECK_INTERVAL);

  httpServer.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal} — shutting down gracefully`);
    httpServer.close(async () => {
      await Promise.all([disconnectMongoDB(), disconnectRedis()]);
      logger.info('Shutdown complete');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.fatal({ reason }, 'Unhandled promise rejection');
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});
