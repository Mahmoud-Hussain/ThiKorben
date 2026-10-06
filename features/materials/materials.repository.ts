import { supabase } from '@/lib/supabase';
import type {
  JobMaterialRequest,
  MaterialRequestStatus,
  ServiceProduct,
} from './types';

export async function listProducts(category?: string): Promise<ServiceProduct[]> {
  let query = supabase
    .from('service_products')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listMaterialRequests(
  serviceRequestId: string,
): Promise<JobMaterialRequest[]> {
  const { data, error } = await supabase
    .from('job_material_requests')
    .select('*')
    .eq('service_request_id', serviceRequestId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function requestMaterial(input: {
  serviceRequestId: string;
  productId: string;
  quantity: number;
  reason: string;
}): Promise<JobMaterialRequest> {
  const { data, error } = await supabase.rpc('request_job_material', {
    p_service_request_id: input.serviceRequestId,
    p_product_id: input.productId,
    p_quantity: input.quantity,
    p_reason: input.reason,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Material request was not created.');
  }

  return data;
}

export async function resolveMaterial(input: {
  materialRequestId: string;
  status: MaterialRequestStatus;
}): Promise<JobMaterialRequest> {
  const { data, error } = await supabase.rpc('resolve_job_material', {
    p_material_request_id: input.materialRequestId,
    p_status: input.status,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Material request was not updated.');
  }

  return data;
}
