import * as repository from './order.repository';
import type { PaymentMethod, ServiceOrderRecord } from './types';

function requireRequestId(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error('Service request ID is required.');
  }

  return normalized;
}

export async function loadServiceOrder(
  serviceRequestId: string,
): Promise<ServiceOrderRecord | null> {
  return repository.getServiceOrder(requireRequestId(serviceRequestId));
}

export async function placeServiceOrder(input: {
  serviceRequestId: string;
  paymentMethod: PaymentMethod;
}): Promise<ServiceOrderRecord> {
  return repository.confirmServiceOrder(
    requireRequestId(input.serviceRequestId),
    input.paymentMethod,
  );
}
