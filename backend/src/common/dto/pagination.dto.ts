import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export function pageParams(q: { page?: number; limit?: number }, defaultLimit = 20, maxLimit = 100) {
  const page = Math.max(1, q.page || 1);
  const limit = Math.min(maxLimit, Math.max(1, q.limit || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export function paged<T>(items: T[], total: number, page: number, limit: number) {
  return { total, page, pages: Math.ceil(total / limit), items };
}

export const escapeRegex = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
