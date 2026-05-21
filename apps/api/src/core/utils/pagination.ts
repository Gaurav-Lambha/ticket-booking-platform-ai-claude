import { APP_CONSTANTS } from '@repo/config';
import type { PaginationQuery, PaginatedResponse } from '@repo/types';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
  sort: Record<string, 1 | -1>;
}

export function parsePaginationQuery(query: PaginationQuery): PaginationOptions {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(
    APP_CONSTANTS.MAX_PAGE_SIZE,
    Math.max(1, query.limit ?? APP_CONSTANTS.DEFAULT_PAGE_SIZE),
  );
  const skip = (page - 1) * limit;
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  const sort: Record<string, 1 | -1> = query.sortBy
    ? { [query.sortBy]: sortOrder }
    : { createdAt: -1 };

  return { page, limit, skip, sort };
}

export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
