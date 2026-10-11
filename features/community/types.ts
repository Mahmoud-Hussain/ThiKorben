import type {
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database.types';

export type CommunityRequest = Tables<'service_requests'>;
export type CommunityComment = Tables<'service_request_comments'>;
export type CommunityReaction = Tables<'service_request_reactions'>;
export type CommunityProposal = Tables<'service_proposals'>;
export type CommunityMedia = Tables<'service_request_media'>;

export type CommunityRequestInsert = TablesInsert<'service_requests'>;
export type CommunityRequestUpdate = TablesUpdate<'service_requests'>;

export type CommunityCommentInsert = TablesInsert<'service_request_comments'>;

export type CommunityCommentUpdate = TablesUpdate<'service_request_comments'>;

export type CommunityProposalInsert = TablesInsert<'service_proposals'>;

export type CommunityProposalUpdate = TablesUpdate<'service_proposals'>;

export type CommunityRequestStatus = Enums<'service_request_status'>;

export type CommunityProposalStatus = Enums<'service_proposal_status'>;

export type CommunityMediaType = Enums<'service_media_type'>;

export type CommunityCategory =
  | 'plumbing'
  | 'electrical'
  | 'carpentry'
  | 'cleaning'
  | 'painting'
  | 'ac';

export interface CreateCommunityRequestInput {
  title: string;
  category: CommunityCategory;
  description: string;
  locationLabel: string;
  budgetAmount: number;
  currency?: string;
  requestedStartAt?: string | null;
  scheduleNote?: string | null;
}

export interface UpdateCommunityRequestInput {
  title?: string;
  category?: CommunityCategory;
  description?: string;
  locationLabel?: string;
  budgetAmount?: number;
  currency?: string;
  requestedStartAt?: string | null;
  scheduleNote?: string | null;
}

export interface CreateCommunityCommentInput {
  serviceRequestId: string;
  body: string;
}

export interface CreateCommunityProposalInput {
  serviceRequestId: string;
  priceAmount: number;
  currency?: string;
  availabilityNote: string;
  note?: string | null;
}

export interface UpdateCommunityProposalInput {
  priceAmount?: number;
  currency?: string;
  availabilityNote?: string;
  note?: string | null;
}

export interface CommunityFeedQuery {
  offset?: number;
  limit?: number;
  category?: CommunityCategory;
  status?: CommunityRequestStatus;
}

export interface CommunityFeedPage {
  items: CommunityRequest[];
  offset: number;
  nextOffset: number | null;
  hasMore: boolean;
}
