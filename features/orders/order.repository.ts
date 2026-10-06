import { supabase } from '@/lib/supabase';
import type { PaymentMethod, ServiceOrderRecord } from './types';

export async function getServiceOrder(
  serviceRequestId: string,
): Promise<ServiceOrderRecord | null> {
  const { data, error } = await supabase
    .from('service_orders')
    .select('*')
    .eq('service_request_id', serviceRequestId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function confirmServiceOrder(
  serviceRequestId: string,
  paymentMethod: PaymentMethod,
): Promise<ServiceOrderRecord> {
  const { data, error } = await supabase.rpc('confirm_service_order', {
    p_service_request_id: serviceRequestId,
    p_payment_method: paymentMethod,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Service order was not created.');
  }

  return data;
}
