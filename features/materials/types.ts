import type { Enums, Tables } from '@/types/database.types';

export type ServiceProduct = Tables<'service_products'>;
export type JobMaterialRequest = Tables<'job_material_requests'>;
export type MaterialRequestStatus = Enums<'material_request_status'>;
