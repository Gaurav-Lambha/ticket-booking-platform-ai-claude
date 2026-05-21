import { APP_CONSTANTS, REDIS_KEYS } from '@repo/config';
import { AppError } from '../../core/errors/AppError.js';
import { getRedisClient } from '../../infrastructure/cache/redis.js';

export interface SeatLockInfo {
  lockedBy: string;
  bookingId: string;
  expiresAt: Date;
}

export class SeatLockService {
  private get redis() {
    return getRedisClient();
  }

  async lockSeats(
    eventId: string,
    seatIds: string[],
    userId: string,
    bookingId: string,
  ): Promise<Date> {
    const expiresAt = new Date(Date.now() + APP_CONSTANTS.SEAT_LOCK_TTL_SECONDS * 1000);

    // Lua script for atomic multi-seat lock — prevents partial locks
    const lockScript = `
      local keys = KEYS
      local userId = ARGV[1]
      local bookingId = ARGV[2]
      local ttl = tonumber(ARGV[3])

      -- Check all seats are unlocked before locking any
      for i = 1, #keys do
        local existing = redis.call('GET', keys[i])
        if existing ~= false then
          return {err = 'SEAT_ALREADY_LOCKED:' .. keys[i]}
        end
      end

      -- Atomically lock all seats
      for i = 1, #keys do
        local value = cjson.encode({lockedBy = userId, bookingId = bookingId})
        redis.call('SET', keys[i], value, 'EX', ttl)
      end

      return 1
    `;

    const lockKeys = seatIds.map((id) => REDIS_KEYS.seatLock(eventId, id));
    const result = await this.redis.eval(
      lockScript,
      lockKeys.length,
      ...lockKeys,
      userId,
      bookingId,
      String(APP_CONSTANTS.SEAT_LOCK_TTL_SECONDS),
    );

    if (result !== 1) {
      throw AppError.conflict('One or more seats are already locked', 'SEAT_ALREADY_LOCKED');
    }

    return expiresAt;
  }

  async releaseLocks(eventId: string, seatIds: string[]): Promise<void> {
    const lockKeys = seatIds.map((id) => REDIS_KEYS.seatLock(eventId, id));
    if (lockKeys.length > 0) {
      await this.redis.del(...lockKeys);
    }
  }

  async getLockInfo(eventId: string, seatId: string): Promise<SeatLockInfo | null> {
    const key = REDIS_KEYS.seatLock(eventId, seatId);
    const value = await this.redis.get(key);
    if (!value) return null;

    const data = JSON.parse(value) as { lockedBy: string; bookingId: string };
    const ttl = await this.redis.ttl(key);
    return {
      ...data,
      expiresAt: new Date(Date.now() + ttl * 1000),
    };
  }

  async isLockedByUser(eventId: string, seatId: string, userId: string): Promise<boolean> {
    const info = await this.getLockInfo(eventId, seatId);
    return info?.lockedBy === userId;
  }

  async extendLock(eventId: string, seatIds: string[], userId: string): Promise<void> {
    for (const seatId of seatIds) {
      const key = REDIS_KEYS.seatLock(eventId, seatId);
      const value = await this.redis.get(key);
      if (!value) continue;

      const data = JSON.parse(value) as { lockedBy: string };
      if (data.lockedBy !== userId) {
        throw AppError.forbidden('Cannot extend lock owned by another user');
      }
      await this.redis.expire(key, APP_CONSTANTS.SEAT_LOCK_TTL_SECONDS);
    }
  }
}
