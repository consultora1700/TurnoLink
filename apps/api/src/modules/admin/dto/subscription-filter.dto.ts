import { IsOptional, IsString, IsInt, Min, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export enum SubscriptionStatusFilter {
  TRIALING = 'TRIALING',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export class SubscriptionFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(SubscriptionStatusFilter)
  status?: SubscriptionStatusFilter;

  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsString()
  billingPeriod?: 'MONTHLY' | 'YEARLY';

  @IsOptional()
  @IsDateString()
  expiringBefore?: string;

  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsEnum(SubscriptionStatusFilter)
  status?: SubscriptionStatusFilter;

  @IsOptional()
  @IsDateString()
  trialEndAt?: string;

  @IsOptional()
  @IsDateString()
  currentPeriodEnd?: string;

  @IsOptional()
  @IsString()
  billingPeriod?: 'MONTHLY' | 'YEARLY';

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ExtendTrialDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  days: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
