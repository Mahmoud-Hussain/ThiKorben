import { PRESENTATION_MODE } from '@/lib/presentation-mode';
import { supabase } from '@/lib/supabase';

const isOfflineOrDemo =
  PRESENTATION_MODE ||
  !process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL.includes('example.supabase.co');

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

// Initial seed dataset for offline/presentation mode
const initialRequests: CommunityRequest[] = [
  {
    id: 'req-seed-1',
    customer_id: '00000000-0000-4000-8000-000000000001',
    title: 'Bathroom Tap Leaking & Basin Pipe Joint Repair',
    category: 'plumbing',
    description:
      'The bathroom basin tap drips constantly and water is pooling under the cabinet. Looking for an experienced plumber to inspect, replace washer/coupling, and seal connections.',
    location_label: 'Mirpur 10, Block C, Dhaka',
    budget_amount: 900,
    currency: 'BDT',
    requested_start_at: new Date(Date.now() + 3600000).toISOString(),
    schedule_note: 'Available anytime after 4:00 PM today',
    status: 'open',
    accepted_proposal_id: null,
    reaction_count: 7,
    comment_count: 2,
    proposal_count: 3,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
  },
  {
    id: 'req-seed-2',
    customer_id: 'cust-demo-2',
    title: 'Main Circuit Breaker Tripping Repeatedly',
    category: 'electrical',
    description:
      'Every time the microwave or water heater is switched on, the sub-meter breaker trips. Suspecting an overload or loose wire in the distribution box.',
    location_label: 'House 42, Road 11/A, Dhanmondi, Dhaka',
    budget_amount: 1200,
    currency: 'BDT',
    requested_start_at: new Date().toISOString(),
    schedule_note: 'Urgent — power cut in kitchen area',
    status: 'open',
    accepted_proposal_id: null,
    reaction_count: 12,
    comment_count: 4,
    proposal_count: 5,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
  },
  {
    id: 'req-seed-3',
    customer_id: 'cust-demo-3',
    title: 'Door Lock Replacement & Wooden Frame Realignment',
    category: 'carpentry',
    description:
      'Master bedroom door lock cylinder jammed and frame is slightly misaligned from monsoon dampness. Need cylinder replacement and edge planing.',
    location_label: 'Sector 4, Road 7, Uttara, Dhaka',
    budget_amount: 1500,
    currency: 'BDT',
    requested_start_at: new Date(Date.now() + 86400000).toISOString(),
    schedule_note: 'Tomorrow morning before 11 AM',
    status: 'open',
    accepted_proposal_id: null,
    reaction_count: 5,
    comment_count: 1,
    proposal_count: 2,
    created_at: new Date(Date.now() - 14400000).toISOString(),
    updated_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
  },
  {
    id: 'req-seed-4',
    customer_id: 'cust-demo-4',
    title: '3-Bedroom Apartment Deep Cleaning & Sanitization',
    category: 'cleaning',
    description:
      'Moving into a new flat, need complete deep cleaning of kitchen grease, bathroom tiles, balcony, and floor machine scrubbing.',
    location_label: 'Road 11, Block D, Banani, Dhaka',
    budget_amount: 3500,
    currency: 'BDT',
    requested_start_at: new Date(Date.now() + 172800000).toISOString(),
    schedule_note: 'Friday morning from 9:00 AM',
    status: 'open',
    accepted_proposal_id: null,
    reaction_count: 18,
    comment_count: 6,
    proposal_count: 4,
    created_at: new Date(Date.now() - 28800000).toISOString(),
    updated_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
  },
  {
    id: 'req-seed-5',
    customer_id: 'cust-demo-5',
    title: 'Living Room Accent Wall Repainting & Crack Patching',
    category: 'painting',
    description:
      'One wall has hairline plaster cracks. Need crack filling, primer coat, and 2 coats of luxury plastic emulsion paint.',
    location_label: 'Block C, Lalmatia, Dhaka',
    budget_amount: 2800,
    currency: 'BDT',
    requested_start_at: new Date(Date.now() + 259200000).toISOString(),
    schedule_note: 'This weekend',
    status: 'open',
    accepted_proposal_id: null,
    reaction_count: 9,
    comment_count: 3,
    proposal_count: 3,
    created_at: new Date(Date.now() - 43200000).toISOString(),
    updated_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
  },
  {
    id: 'req-seed-6',
    customer_id: 'cust-demo-6',
    title: '1.5 Ton Inverter AC Gas Refill & Water Leakage Fix',
    category: 'ac',
    description:
      'General 1.5 ton AC blowing room temperature air. Drainage pipe is also overflowing onto the bedroom floor. Need gas top-up and jet wash.',
    location_label: 'Gulshan 1, Avenue 3, Dhaka',
    budget_amount: 2200,
    currency: 'BDT',
    requested_start_at: new Date().toISOString(),
    schedule_note: 'Today evening after 6:00 PM',
    status: 'open',
    accepted_proposal_id: null,
    reaction_count: 14,
    comment_count: 5,
    proposal_count: 4,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
  },
];

const initialComments: CommunityComment[] = [
  {
    id: 'com-1',
    service_request_id: 'req-seed-1',
    author_id: 'cust-demo-1',
    body: 'Is the leakage coming from the faucet head or below the basin?',
    created_at: new Date(Date.now() - 3000000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'com-2',
    service_request_id: 'req-seed-1',
    author_id: 'cust-demo-1',
    body: 'Mostly from the faucet head, but some dripping under the basin joint.',
    created_at: new Date(Date.now() - 2500000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialProposals: CommunityProposal[] = [
  {
    id: 'prop-1',
    service_request_id: 'req-seed-1',
    worker_id: 'worker-demo-1',
    price_amount: 700,
    currency: 'BDT',
    availability_note: 'Today, after 5:00 PM',
    note: 'I can inspect the faucet washer and replace the flexible pipe if needed. Parts cost will be agreed before buying.',
    status: 'pending',
    created_at: new Date(Date.now() - 2000000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const STORAGE_REQUESTS = 'thikorben_mock_requests_store_v2';
const STORAGE_PROPOSALS = 'thikorben_mock_proposals_store_v2';
const STORAGE_COMMENTS = 'thikorben_mock_comments_store_v2';

function getStored<T>(key: string, fallback: T): T {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const data = window.localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch {}
  }
  return fallback;
}

function setStored<T>(key: string, value: T) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }
}

let mockRequests: CommunityRequest[] = getStored(STORAGE_REQUESTS, initialRequests);
let mockComments: CommunityComment[] = getStored(STORAGE_COMMENTS, initialComments);
let mockProposals: CommunityProposal[] = getStored(STORAGE_PROPOSALS, initialProposals);

export function resetMockCommunityState() {
  mockRequests = [...initialRequests];
  mockComments = [...initialComments];
  mockProposals = [...initialProposals];
  setStored(STORAGE_REQUESTS, mockRequests);
  setStored(STORAGE_COMMENTS, mockComments);
  setStored(STORAGE_PROPOSALS, mockProposals);
}

const mockReactions = new Set<string>();

export async function listCommunityRequests(
  input: CommunityFeedQuery = {},
): Promise<CommunityFeedPage> {
  const offset = normalizeOffset(input.offset);
  const limit = normalizePageSize(input.limit);

  if (!isOfflineOrDemo) {
    try {
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

      if (!error && data && data.length > 0) {
        const rows = data ?? [];
        const hasMore = rows.length > limit;

        return {
          items: hasMore ? rows.slice(0, limit) : rows,
          offset,
          nextOffset: hasMore ? offset + limit : null,
          hasMore,
        };
      }
    } catch (err) {
      // Graceful fallback to offline/presentation dataset
    }
  }

  mockRequests = getStored(STORAGE_REQUESTS, mockRequests);
  // Filter in-memory fallback dataset
  let filtered = [...mockRequests];

  if (input.category) {
    filtered = filtered.filter(item => item.category === input.category);
  }

  if (input.status) {
    filtered = filtered.filter(item => item.status === input.status);
  }

  const paged = filtered.slice(offset, offset + limit + 1);
  const hasMore = paged.length > limit;
  const items = hasMore ? paged.slice(0, limit) : paged;

  return {
    items,
    offset,
    nextOffset: hasMore ? offset + limit : null,
    hasMore,
  };
}

export async function getCommunityRequest(
  serviceRequestId: string,
): Promise<CommunityRequest> {
  if (!isOfflineOrDemo) {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', serviceRequestId)
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      // Fallback
    }
  }

  mockRequests = getStored(STORAGE_REQUESTS, mockRequests);
  const found = mockRequests.find(item => item.id === serviceRequestId);
  if (found) {
    return found;
  }

  throw new Error('Service request not found.');
}

export async function createCommunityRequest(
  input: CommunityRequestInsert,
): Promise<CommunityRequest> {
  if (!isOfflineOrDemo) {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .insert(input)
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      // Fallback
    }
  }

  mockRequests = getStored(STORAGE_REQUESTS, mockRequests);
  const newReq: CommunityRequest = {
    id: `req-created-${Date.now()}`,
    customer_id: input.customer_id,
    title: input.title,
    category: input.category,
    description: input.description,
    location_label: input.location_label,
    budget_amount: input.budget_amount,
    currency: input.currency ?? 'BDT',
    requested_start_at: input.requested_start_at ?? null,
    schedule_note: input.schedule_note ?? null,
    status: 'open',
    accepted_proposal_id: null,
    reaction_count: 0,
    comment_count: 0,
    proposal_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
  };

  mockRequests = [newReq, ...mockRequests];
  setStored(STORAGE_REQUESTS, mockRequests);
  return newReq;
}

export async function updateCommunityRequest(
  serviceRequestId: string,
  input: CommunityRequestUpdate,
): Promise<CommunityRequest> {
  if (!isOfflineOrDemo) {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .update(input)
        .eq('id', serviceRequestId)
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      // Fallback
    }
  }

  const index = mockRequests.findIndex(item => item.id === serviceRequestId);
  if (index !== -1) {
    const updated = {
      ...mockRequests[index],
      ...input,
      updated_at: new Date().toISOString(),
    } as CommunityRequest;
    mockRequests[index] = updated;
    setStored(STORAGE_REQUESTS, mockRequests);
    return updated;
  }

  throw new Error('Service request not found.');
}

export async function cancelCommunityRequest(
  serviceRequestId: string,
): Promise<string> {
  if (!isOfflineOrDemo) {
    try {
      const { data, error } = await supabase.rpc('cancel_service_request', {
        p_service_request_id: serviceRequestId,
      });

      if (!error && data) {
        return data;
      }
    } catch (err) {
      // Fallback
    }
  }

  const found = mockRequests.find(item => item.id === serviceRequestId);
  if (found) {
    found.status = 'cancelled';
    setStored(STORAGE_REQUESTS, mockRequests);
    return serviceRequestId;
  }

  return serviceRequestId;
}

export async function listCommunityComments(
  serviceRequestId: string,
): Promise<CommunityComment[]> {
  if (!isOfflineOrDemo) {
    try {
      const { data, error } = await supabase
        .from('service_request_comments')
        .select('*')
        .eq('service_request_id', serviceRequestId)
        .order('created_at', {
          ascending: true,
        });

      if (!error && data) {
        return data;
      }
    } catch (err) {
      // Fallback
    }
  }

  mockComments = getStored(STORAGE_COMMENTS, mockComments);
  return mockComments.filter(
    item => item.service_request_id === serviceRequestId,
  );
}

export async function createCommunityComment(
  input: CommunityCommentInsert,
): Promise<CommunityComment> {
  if (!isOfflineOrDemo) {
    try {
      const { data, error } = await supabase
        .from('service_request_comments')
        .insert(input)
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      // Fallback
    }
  }

  mockComments = getStored(STORAGE_COMMENTS, mockComments);
  mockRequests = getStored(STORAGE_REQUESTS, mockRequests);
  const newComment: CommunityComment = {
    id: `com-created-${Date.now()}`,
    service_request_id: input.service_request_id,
    author_id: input.author_id,
    body: input.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockComments.push(newComment);

  const req = mockRequests.find(item => item.id === input.service_request_id);
  if (req) {
    req.comment_count += 1;
    req.last_activity_at = new Date().toISOString();
  }

  setStored(STORAGE_COMMENTS, mockComments);
  setStored(STORAGE_REQUESTS, mockRequests);
  return newComment;
}

export async function updateCommunityComment(
  commentId: string,
  input: CommunityCommentUpdate,
): Promise<CommunityComment> {
  try {
    const { data, error } = await supabase
      .from('service_request_comments')
      .update(input)
      .eq('id', commentId)
      .select()
      .single();

    if (!error && data) {
      return data;
    }
  } catch (err) {
    // Fallback
  }

  mockComments = getStored(STORAGE_COMMENTS, mockComments);
  const comment = mockComments.find(item => item.id === commentId);
  if (comment) {
    if (input.body !== undefined) comment.body = input.body;
    comment.updated_at = new Date().toISOString();
    setStored(STORAGE_COMMENTS, mockComments);
    return comment;
  }

  throw new Error('Comment not found.');
}

export async function deleteCommunityComment(commentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('service_request_comments')
      .delete()
      .eq('id', commentId);

    if (!error) return;
  } catch (err) {
    // Fallback
  }

  mockComments = getStored(STORAGE_COMMENTS, mockComments).filter(
    item => item.id !== commentId,
  );
  setStored(STORAGE_COMMENTS, mockComments);
}

export async function getCommunityReaction(
  serviceRequestId: string,
  userId: string,
): Promise<CommunityReaction | null> {
  if (!isOfflineOrDemo) {
    try {
      const { data, error } = await supabase
        .from('service_request_reactions')
        .select('*')
        .eq('service_request_id', serviceRequestId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!error) {
        return data;
      }
    } catch (err) {
      // Fallback
    }
  }

  const key = `${serviceRequestId}:${userId}`;
  if (mockReactions.has(key)) {
    return {
      service_request_id: serviceRequestId,
      user_id: userId,
      created_at: new Date().toISOString(),
    };
  }

  return null;
}

export async function createCommunityReaction(
  serviceRequestId: string,
  userId: string,
): Promise<CommunityReaction> {
  if (!isOfflineOrDemo) {
    try {
      const { data, error } = await supabase
        .from('service_request_reactions')
        .insert({
          service_request_id: serviceRequestId,
          user_id: userId,
        })
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      // Fallback
    }
  }

  const key = `${serviceRequestId}:${userId}`;
  mockReactions.add(key);

  const req = mockRequests.find(item => item.id === serviceRequestId);
  if (req) {
    req.reaction_count += 1;
  }

  return {
    service_request_id: serviceRequestId,
    user_id: userId,
    created_at: new Date().toISOString(),
  };
}

export async function deleteCommunityReaction(
  serviceRequestId: string,
  userId: string,
): Promise<void> {
  if (!isOfflineOrDemo) {
    try {
      const { error } = await supabase
        .from('service_request_reactions')
        .delete()
        .eq('service_request_id', serviceRequestId)
        .eq('user_id', userId);

      if (!error) return;
    } catch (err) {
      // Fallback
    }
  }

  const key = `${serviceRequestId}:${userId}`;
  mockReactions.delete(key);

  const req = mockRequests.find(item => item.id === serviceRequestId);
  if (req) {
    req.reaction_count = Math.max(0, req.reaction_count - 1);
  }
}

export async function getCommunityProposal(
  proposalId: string,
): Promise<CommunityProposal> {
  if (!isOfflineOrDemo) {
    try {
      const { data, error } = await supabase
        .from('service_proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      // Fallback
    }
  }

  mockProposals = getStored(STORAGE_PROPOSALS, mockProposals);
  const found = mockProposals.find(item => item.id === proposalId);
  if (found) {
    return found;
  }

  throw new Error('Proposal not found.');
}

export async function listCommunityProposals(
  serviceRequestId: string,
): Promise<CommunityProposal[]> {
  if (!isOfflineOrDemo) {
    try {
      const { data, error } = await supabase
        .from('service_proposals')
        .select('*')
        .eq('service_request_id', serviceRequestId)
        .order('created_at', {
          ascending: false,
        });

      if (!error && data) {
        return data ?? [];
      }
    } catch (err) {
      // Fallback
    }
  }

  mockProposals = getStored(STORAGE_PROPOSALS, mockProposals);
  return mockProposals.filter(
    item => item.service_request_id === serviceRequestId,
  );
}

export async function createCommunityProposal(
  input: CommunityProposalInsert,
): Promise<CommunityProposal> {
  if (!isOfflineOrDemo) {
    try {
      const { data, error } = await supabase
        .from('service_proposals')
        .insert(input)
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      // Fallback
    }
  }

  mockRequests = getStored(STORAGE_REQUESTS, mockRequests);
  mockProposals = getStored(STORAGE_PROPOSALS, mockProposals);

  const req = mockRequests.find(item => item.id === input.service_request_id);
  if (!req) {
    throw new Error('Service request not found.');
  }

  if (req.status !== 'open') {
    throw new Error('Cannot submit proposals for a request that is not open.');
  }

  if (req.customer_id === input.worker_id) {
    throw new Error('Customers cannot submit proposals for their own service requests.');
  }

  const existingActive = mockProposals.find(
    p =>
      p.service_request_id === input.service_request_id &&
      p.worker_id === input.worker_id &&
      p.status !== 'withdrawn' &&
      p.status !== 'declined',
  );
  if (existingActive) {
    throw new Error('You have already submitted an active proposal for this request.');
  }

  const newProp: CommunityProposal = {
    id: `prop-created-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    service_request_id: input.service_request_id,
    worker_id: input.worker_id,
    price_amount: input.price_amount,
    currency: input.currency ?? 'BDT',
    availability_note: input.availability_note,
    note: input.note ?? null,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockProposals.push(newProp);

  req.proposal_count += 1;
  req.last_activity_at = new Date().toISOString();

  setStored(STORAGE_PROPOSALS, mockProposals);
  setStored(STORAGE_REQUESTS, mockRequests);

  return newProp;
}

export async function updateCommunityProposal(
  proposalId: string,
  input: CommunityProposalUpdate,
): Promise<CommunityProposal> {
  if (!isOfflineOrDemo) {
    try {
      const { data, error } = await supabase
        .from('service_proposals')
        .update(input)
        .eq('id', proposalId)
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      // Fallback
    }
  }

  mockProposals = getStored(STORAGE_PROPOSALS, mockProposals);
  const prop = mockProposals.find(item => item.id === proposalId);
  if (prop) {
    if (input.price_amount !== undefined) prop.price_amount = input.price_amount;
    if (input.availability_note !== undefined) prop.availability_note = input.availability_note;
    if (input.note !== undefined) prop.note = input.note;
    prop.updated_at = new Date().toISOString();
    setStored(STORAGE_PROPOSALS, mockProposals);
    return prop;
  }

  throw new Error('Proposal not found.');
}

export async function withdrawCommunityProposal(
  proposalId: string,
): Promise<string> {
  if (!isOfflineOrDemo) {
    try {
      const { data, error } = await supabase.rpc('withdraw_service_proposal', {
        p_proposal_id: proposalId,
      });

      if (!error && data) {
        return data;
      }
    } catch (err) {
      // Fallback
    }
  }

  mockProposals = getStored(STORAGE_PROPOSALS, mockProposals);
  const prop = mockProposals.find(item => item.id === proposalId);
  if (prop) {
    prop.status = 'declined';
    setStored(STORAGE_PROPOSALS, mockProposals);
  }

  return proposalId;
}

export async function acceptCommunityProposal(
  proposalId: string,
  actorId?: string,
) {
  if (!isOfflineOrDemo) {
    try {
      const { data, error } = await supabase.rpc('accept_service_proposal', {
        p_proposal_id: proposalId,
      });

      if (!error && data) {
        return data;
      }
    } catch (err) {
      // Fallback
    }
  }

  mockProposals = getStored(STORAGE_PROPOSALS, mockProposals);
  mockRequests = getStored(STORAGE_REQUESTS, mockRequests);

  const prop = mockProposals.find(item => item.id === proposalId);
  if (!prop) {
    throw new Error('Proposal not found.');
  }

  const req = mockRequests.find(item => item.id === prop.service_request_id);
  if (!req) {
    throw new Error('Service request not found.');
  }

  if (actorId) {
    if (prop.worker_id === actorId) {
      throw new Error('Workers cannot accept their own proposals.');
    }
    if (req.customer_id !== actorId) {
      throw new Error('Only the customer who created this request can accept a proposal.');
    }
  }

  if (req.status !== 'open') {
    throw new Error('This service request is no longer open.');
  }

  if (prop.status !== 'pending') {
    throw new Error('Only pending proposals can be accepted.');
  }

  // Atomically accept winning proposal and decline competing pending proposals
  prop.status = 'accepted';
  prop.updated_at = new Date().toISOString();

  mockProposals.forEach(otherProp => {
    if (
      otherProp.service_request_id === req.id &&
      otherProp.id !== prop.id &&
      otherProp.status === 'pending'
    ) {
      otherProp.status = 'declined';
      otherProp.updated_at = new Date().toISOString();
    }
  });

  req.status = 'assigned';
  req.accepted_proposal_id = proposalId;
  req.last_activity_at = new Date().toISOString();
  req.updated_at = new Date().toISOString();

  setStored(STORAGE_PROPOSALS, mockProposals);
  setStored(STORAGE_REQUESTS, mockRequests);

  return { success: true };
}

export async function advanceCommunityRequestStatus(
  serviceRequestId: string,
  status: 'ordered' | 'completed',
) {
  if (!isOfflineOrDemo) {
    try {
      const { data, error } = await supabase.rpc('advance_service_request_status', {
        p_service_request_id: serviceRequestId,
        p_status: status,
      });

      if (!error && data) {
        return data;
      }
    } catch (err) {
      // Fallback
    }
  }

  mockRequests = getStored(STORAGE_REQUESTS, mockRequests);
  const req = mockRequests.find(item => item.id === serviceRequestId);
  if (req) {
    req.status = status;
    setStored(STORAGE_REQUESTS, mockRequests);
  }

  return { success: true };
}
