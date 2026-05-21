import mongoose from 'mongoose';

import { env } from '../../core/config/env.js';
import { logger } from '../../core/logger/logger.js';

const RECONNECT_INTERVAL_MS = 5000;

export async function connectMongoDB(): Promise<void> {
  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected — retrying in 5s');
    setTimeout(() => void connectMongoDB(), RECONNECT_INTERVAL_MS);
  });
  mongoose.connection.on('error', (err) => logger.error({ err }, 'MongoDB error'));

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
}

export async function disconnectMongoDB(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully');
}
