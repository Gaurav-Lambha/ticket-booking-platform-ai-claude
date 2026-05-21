import pino from 'pino';
import pretty from 'pino-pretty';

import { env } from '../config/env.js';

const pinoOpts: pino.LoggerOptions = {
  level: env.LOG_LEVEL,
  redact: {
    paths: ['password', 'token', 'accessToken', 'refreshToken', '*.password', '*.token'],
    censor: '[REDACTED]',
  },
};

// In development use pino-pretty as a synchronous stream so tsx/ESM worker
// thread resolution issues are avoided entirely.
export const logger =
  env.NODE_ENV !== 'production'
    ? pino(
        pinoOpts,
        pretty({ colorize: true, translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' }),
      )
    : pino(pinoOpts);
