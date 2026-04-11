import { SetMetadata } from '@nestjs/common';

export const REQUIRED_FEATURES_KEY = 'requiredFeatures';
export const REQUIRED_FEATURES_MODE_KEY = 'requiredFeaturesMode';

/**
 * Requires the tenant's plan to include ALL specified features.
 *
 * @example
 * @RequireFeature('employee_portal', 'employee_portal_advanced')
 */
export const RequireFeature = (...features: string[]) =>
  SetMetadata(REQUIRED_FEATURES_KEY, features);

/**
 * Requires the tenant's plan to include ANY ONE of the specified features.
 * Useful when multiple plan tiers grant access to the same module.
 *
 * @example
 * @RequireAnyFeature('advanced_reports', 'complete_reports', 'finance_module')
 */
export const RequireAnyFeature = (...features: string[]) => {
  return (target: any, key?: string | symbol, descriptor?: PropertyDescriptor) => {
    SetMetadata(REQUIRED_FEATURES_KEY, features)(target, key as string, descriptor as PropertyDescriptor);
    SetMetadata(REQUIRED_FEATURES_MODE_KEY, 'any')(target, key as string, descriptor as PropertyDescriptor);
  };
};
