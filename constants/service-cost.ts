import { getAcceptedProposal, getSelectedJob } from './community-marketplace';

import { getCartSubtotal } from './shop-data';

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
  const job = getSelectedJob();

  const accepted = job ? getAcceptedProposal(job.id) : undefined;

  const laborCost = accepted?.price ?? 0;

  const materialSubtotal = getCartSubtotal();

  const deliveryFee =
    materialSubtotal === 0
      ? 0
      : materialSubtotal >= FREE_DELIVERY_THRESHOLD
        ? 0
        : STANDARD_DELIVERY_FEE;

  const shopPlatformFee = materialSubtotal > 0 ? SHOP_PLATFORM_FEE : 0;

  const servicePlatformFee = laborCost > 0 ? SERVICE_PLATFORM_FEE : 0;

  const totalPlatformFees = shopPlatformFee + servicePlatformFee;

  const shopTotal = materialSubtotal + deliveryFee + shopPlatformFee;

  const grandTotal =
    laborCost +
    materialSubtotal +
    deliveryFee +
    shopPlatformFee +
    servicePlatformFee;

  return {
    laborCost,
    materialSubtotal,
    deliveryFee,
    shopPlatformFee,
    servicePlatformFee,
    totalPlatformFees,
    shopTotal,
    grandTotal,
  };
}
