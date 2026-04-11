export enum LoyaltyEvent {
  POINTS_EARNED = 'loyalty.points.earned',
  TIER_UPGRADED = 'loyalty.tier.upgraded',
  REWARD_REDEEMED = 'loyalty.reward.redeemed',
  SORTEO_REGISTRATION = 'sorteo.registration',
  SORTEO_WINNER = 'sorteo.winner',
}

export interface LoyaltyPointsEarnedPayload {
  tenantId: string;
  customerId: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  points: number;
  totalBalance: number;
  description: string;
  programName: string;
  currencyPerPoint: number;
  tenantName: string;
  tenantSlug: string;
}

export interface TierUpgradedPayload {
  tenantId: string;
  customerId: string;
  customerName: string;
  customerEmail: string | null;
  newTierName: string;
  newTierColor: string;
  benefitDescription: string | null;
  tenantName: string;
}

export interface SorteoRegistrationPayload {
  tenantId: string;
  participantName: string;
  participantEmail: string | null;
  sorteoTitle: string;
  tenantName: string;
}

export interface SorteoWinnerPayload {
  tenantId: string;
  winnerName: string;
  winnerEmail: string | null;
  sorteoTitle: string;
  prizeName: string;
  tenantName: string;
}
