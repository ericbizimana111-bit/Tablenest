import { SettingsService, Settings } from './settings.service';
import { RestaurantPlan } from './platform-settings.schema';

const settings: Settings = {
  currency: 'USD',
  requireRestaurantApproval: false,
  serviceFeeRate: 0.05,
  serviceFeeCap: 3,
  bookingFeePerCover: 1,
  plans: { [RestaurantPlan.STARTER]: { monthlyFee: 0, commissionRate: 0.15 }, [RestaurantPlan.PRO]: { monthlyFee: 49, commissionRate: 0.1 } },
  sponsoredWeeklyFee: 25,
  loyaltyPointsPerUnit: 1,
};

describe('SettingsService pricing rules', () => {
  it('uses the plan commission unless the restaurant has an override', () => {
    expect(SettingsService.commissionRate(settings, { plan: 'starter', commissionRate: null })).toBe(0.15);
    expect(SettingsService.commissionRate(settings, { plan: 'pro', commissionRate: null })).toBe(0.1);
    expect(SettingsService.commissionRate(settings, { plan: 'pro', commissionRate: 0.05 })).toBe(0.05);
    expect(SettingsService.commissionRate(settings, { commissionRate: 0 })).toBe(0); // 0 is a valid negotiated rate
    expect(SettingsService.commissionRate(settings, {})).toBe(0.15);
  });

  it('computes the service fee with rounding and a cap', () => {
    expect(SettingsService.serviceFee(settings, 33.33)).toBe(1.67);
    expect(SettingsService.serviceFee(settings, 1000)).toBe(3);
    expect(SettingsService.serviceFee(settings, -5)).toBe(0);
    expect(SettingsService.serviceFee({ ...settings, serviceFeeCap: 0 }, 1000)).toBe(50);
  });
});
