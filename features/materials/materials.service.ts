import * as repository from './materials.repository';
import type {
  JobMaterialRequest,
  MaterialRequestStatus,
  ServiceProduct,
} from './types';

function requireId(value: string, name: string) {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${name} is required.`);
  }

  return normalized;
}

function normalizeReason(value: string) {
  const normalized = value.trim();

  if (normalized.length < 5) {
    throw new Error('Explain why this material is required.');
  }

  if (normalized.length > 1000) {
    throw new Error('Material reason cannot exceed 1000 characters.');
  }

  return normalized;
}

function normalizeQuantity(value: number) {
  if (!Number.isInteger(value) || value < 1 || value > 99) {
    throw new Error('Quantity must be between 1 and 99.');
  }

  return value;
}

export async function getCatalog(category?: string): Promise<ServiceProduct[]> {
  return repository.listProducts(category);
}

export async function getJobMaterials(
  serviceRequestId: string,
): Promise<JobMaterialRequest[]> {
  return repository.listMaterialRequests(
    requireId(serviceRequestId, 'Service request ID'),
  );
}

export async function createMaterialRequest(input: {
  serviceRequestId: string;
  productId: string;
  quantity: number;
  reason: string;
}): Promise<JobMaterialRequest> {
  return repository.requestMaterial({
    serviceRequestId: requireId(input.serviceRequestId, 'Service request ID'),
    productId: requireId(input.productId, 'Product ID'),
    quantity: normalizeQuantity(input.quantity),
    reason: normalizeReason(input.reason),
  });
}

export async function decideMaterialRequest(input: {
  materialRequestId: string;
  status: Extract<MaterialRequestStatus, 'approved' | 'rejected'>;
}): Promise<JobMaterialRequest> {
  return repository.resolveMaterial({
    materialRequestId: requireId(input.materialRequestId, 'Material request ID'),
    status: input.status,
  });
}
