import type { Tables } from '@/types/database.types';

export type ServiceOrderRecord = Tables<'service_orders'>;
export type PaymentMethod = 'bkash' | 'card' | 'cash';
