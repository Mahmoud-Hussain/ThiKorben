import { getCartSubtotal } from './shop-data';

export const AGREED_LABOR_COST = 700;

export const FREE_DELIVERY_THRESHOLD = 1500;

export const STANDARD_DELIVERY_FEE = 80;

export const SHOP_PLATFORM_FEE = 20;

export const SERVICE_PLATFORM_FEE = 35;

export type ServiceCostSummary = {
  laborCost: number;
  materialSubtotal: number;
  deliveryFee: number;
  shopPlatformFee: number;
  servicePlatformFee: number;
  totalPlatformFees: number;
  shopTotal: number;
  grandTotal: number;
};

export function getServiceCostSummary(): ServiceCostSummary {
  const materialSubtotal = getCartSubtotal();

  const deliveryFee =
    materialSubtotal === 0
      ? 0
      : materialSubtotal >= FREE_DELIVERY_THRESHOLD
        ? 0
        : STANDARD_DELIVERY_FEE;

  const shopPlatformFee = materialSubtotal > 0 ? SHOP_PLATFORM_FEE : 0;

  const servicePlatformFee = SERVICE_PLATFORM_FEE;

  const totalPlatformFees = shopPlatformFee + servicePlatformFee;

  const shopTotal = materialSubtotal + deliveryFee + shopPlatformFee;

  const grandTotal = AGREED_LABOR_COST + shopTotal + servicePlatformFee;

  return {
    laborCost: AGREED_LABOR_COST,
    materialSubtotal,
    deliveryFee,
    shopPlatformFee,
    servicePlatformFee,
    totalPlatformFees,
    shopTotal,
    grandTotal,
  };
}
