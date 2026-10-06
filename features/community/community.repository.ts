import { supabase } from '@/lib/supabase';

import type {
  CommunityComment,
  CommunityCommentInsert,
  CommunityCommentUpdate,
  CommunityFeedPage,
  CommunityFeedQuery,
  CommunityProposal,
  CommunityProposalInsert,
  CommunityProposalUpdate,
  CommunityReaction,
  CommunityRequest,
  CommunityRequestInsert,
  CommunityRequestUpdate,
} from './types';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

function normalizePageSize(limit?: number) {
  if (!limit) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(Math.max(Math.trunc(limit), 1), MAX_PAGE_SIZE);
}

function normalizeOffset(offset?: number) {
  if (!offset || offset < 0) {
    return 0;
  }

  return Math.trunc(offset);
}

export async function listCommunityRequests(
  input: CommunityFeedQuery = {},
): Promise<CommunityFeedPage> {
  const offset = normalizeOffset(input.offset);
  const limit = normalizePageSize(input.limit);

  let query = supabase
    .from('service_requests')
    .select('*')
    .order('last_activity_at', {
      ascending: false,
    })
    .order('id', {
      ascending: false,
    })
    .range(offset, offset + limit);

  if (input.category) {
    query = query.eq('category', input.category);
  }

  if (input.status) {
    query = query.eq('status', input.status);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows = data ?? [];

  const hasMore = rows.length > limit;

  return {
    items: hasMore ? rows.slice(0, limit) : rows,
    offset,
    nextOffset: hasMore ? offset + limit : null,
    hasMore,
  };
}

export async function getCommunityRequest(
  serviceRequestId: string,
): Promise<CommunityRequest> {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .eq('id', serviceRequestId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createCommunityRequest(
  input: CommunityRequestInsert,
): Promise<CommunityRequest> {
  const { data, error } = await supabase
    .from('service_requests')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateCommunityRequest(
  serviceRequestId: string,
  input: CommunityRequestUpdate,
): Promise<CommunityRequest> {
  const { data, error } = await supabase
    .from('service_requests')
    .update(input)
    .eq('id', serviceRequestId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function cancelCommunityRequest(
  serviceRequestId: string,
): Promise<string> {
  const { data, error } = await supabase.rpc('cancel_service_request', {
    p_service_request_id: serviceRequestId,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function listCommunityComments(
  serviceRequestId: string,
): Promise<CommunityComment[]> {
  const { data, error } = await supabase
    .from('service_request_comments')
    .select('*')
    .eq('service_request_id', serviceRequestId)
    .order('created_at', {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createCommunityComment(
  input: CommunityCommentInsert,
): Promise<CommunityComment> {
  const { data, error } = await supabase
    .from('service_request_comments')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateCommunityComment(
  commentId: string,
  input: CommunityCommentUpdate,
): Promise<CommunityComment> {
  const { data, error } = await supabase
    .from('service_request_comments')
    .update(input)
    .eq('id', commentId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteCommunityComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('service_request_comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    throw error;
  }
}

export async function getCommunityReaction(
  serviceRequestId: string,
  userId: string,
): Promise<CommunityReaction | null> {
  const { data, error } = await supabase
    .from('service_request_reactions')
    .select('*')
    .eq('service_request_id', serviceRequestId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function createCommunityReaction(
  serviceRequestId: string,
  userId: string,
): Promise<CommunityReaction> {
  const { data, error } = await supabase
    .from('service_request_reactions')
    .insert({
      service_request_id: serviceRequestId,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteCommunityReaction(
  serviceRequestId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('service_request_reactions')
    .delete()
    .eq('service_request_id', serviceRequestId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}

export async function listCommunityProposals(
  serviceRequestId: string,
): Promise<CommunityProposal[]> {
  const { data, error } = await supabase
    .from('service_proposals')
    .select('*')
    .eq('service_request_id', serviceRequestId)
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createCommunityProposal(
  input: CommunityProposalInsert,
): Promise<CommunityProposal> {
  const { data, error } = await supabase
    .from('service_proposals')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateCommunityProposal(
  proposalId: string,
  input: CommunityProposalUpdate,
): Promise<CommunityProposal> {
  const { data, error } = await supabase
    .from('service_proposals')
    .update(input)
    .eq('id', proposalId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function withdrawCommunityProposal(
  proposalId: string,
): Promise<string> {
  const { data, error } = await supabase.rpc('withdraw_service_proposal', {
    p_proposal_id: proposalId,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function acceptCommunityProposal(proposalId: string) {
  const { data, error } = await supabase.rpc('accept_service_proposal', {
    p_proposal_id: proposalId,
  });

  if (error) {
    throw error;
  }

  return data;
}


export async function advanceCommunityRequestStatus(
  serviceRequestId: string,
  status: 'ordered' | 'completed',
) {
  const { data, error } = await supabase.rpc('advance_service_request_status', {
    p_service_request_id: serviceRequestId,
    p_status: status,
  });

  if (error) {
    throw error;
  }

  return data;
}
