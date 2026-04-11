/**
 * Subscription plan event names
 */
export enum SubscriptionEvent {
  PLAN_PRICE_UPDATED = 'plan.price.updated',
}

/**
 * Payload for plan price/name update event
 */
export interface PlanPriceUpdatedPayload {
  planId: string;
  planName: string;
  planSlug: string;
  changes: {
    priceMonthly?: { old: number; new: number };
    priceYearly?: { old: number | null; new: number | null };
    name?: { old: string; new: string };
  };
  currency: string;
}
