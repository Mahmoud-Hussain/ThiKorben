import { supabase } from '@/lib/supabase';

import * as communityRepository from './community.repository';

import type {
  CommunityFeedPage,
  CommunityFeedQuery,
  CommunityProposal,
  CommunityProposalUpdate,
  CommunityRequest,
  CommunityRequestUpdate,
  CreateCommunityCommentInput,
  CreateCommunityProposalInput,
  CreateCommunityRequestInput,
  UpdateCommunityProposalInput,
  UpdateCommunityRequestInput,
} from './types';

const MAX_MONEY_AMOUNT = 100_000_000;

import { PRESENTATION_MODE } from '@/lib/presentation-mode';

export interface AuthenticatedActor {
  id: string;
  role: 'customer' | 'worker';
  roles: Array<'customer' | 'worker'>;
}

let activeActorOverride: AuthenticatedActor | null | undefined = undefined;

export function setActiveActor(actor: AuthenticatedActor | null) {
  activeActorOverride = actor;
}

export function resetActiveActor() {
  activeActorOverride = undefined;
}

export function getActiveActor(): AuthenticatedActor | null {
  return activeActorOverride ?? null;
}

export async function resolveAuthenticatedActor(): Promise<AuthenticatedActor | null> {
  if (activeActorOverride !== undefined) {
    return activeActorOverride;
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user?.id) {
      const [profileRes, rolesRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('active_role')
          .eq('id', user.id)
          .single(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id),
      ]);

      const activeRole = (profileRes.data?.active_role as 'customer' | 'worker') ?? 'customer';
      const userRoles = (rolesRes.data?.map(r => r.role as 'customer' | 'worker')) ?? [activeRole];

      return {
        id: user.id,
        role: activeRole,
        roles: userRoles,
      };
    }
  } catch {
    // Supabase auth is offline or unreachable
  }

  if (PRESENTATION_MODE) {
    return {
      id: '00000000-0000-4000-8000-000000000001',
      role: 'customer',
      roles: ['customer', 'worker'],
    };
  }

  return null;
}

export async function requireAuthenticatedActor(
  requiredRole?: 'customer' | 'worker',
): Promise<AuthenticatedActor> {
  const actor = await resolveAuthenticatedActor();

  if (!actor) {
    throw new Error('Authentication required.');
  }

  if (requiredRole) {
    if (requiredRole === 'customer') {
      if (actor.role !== 'customer') {
        throw new Error('Only customers can create and publish job requests.');
      }
    } else if (requiredRole === 'worker') {
      if (actor.role !== 'worker') {
        throw new Error('Only workers can submit proposals.');
      }
    }
  }

  return actor;
}

function requireText(
  value: string,
  fieldName: string,
  minLength: number,
  maxLength: number,
) {
  const normalized = value.trim();

  if (normalized.length < minLength) {
    throw new Error(
      `${fieldName} must contain at least ${minLength} characters.`,
    );
  }

  if (normalized.length > maxLength) {
    throw new Error(`${fieldName} cannot exceed ${maxLength} characters.`);
  }

  return normalized;
}

function optionalText(
  value: string | null | undefined,
  fieldName: string,
  maxLength: number,
) {
  if (value == null) {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length > maxLength) {
    throw new Error(`${fieldName} cannot exceed ${maxLength} characters.`);
  }

  return normalized;
}

function normalizeCurrency(currency?: string) {
  const normalized = (currency ?? 'BDT').trim().toUpperCase();

  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error('Currency must be a valid 3-letter code.');
  }

  return normalized;
}

function normalizeMoney(value: number, fieldName: string, allowZero: boolean) {
  if (!Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a valid number.`);
  }

  if (allowZero ? value < 0 : value <= 0) {
    throw new Error(
      allowZero
        ? `${fieldName} cannot be negative.`
        : `${fieldName} must be greater than zero.`,
    );
  }

  if (value > MAX_MONEY_AMOUNT) {
    throw new Error(`${fieldName} exceeds the supported limit.`);
  }

  return Math.round(value * 100) / 100;
}

function normalizeDateTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Requested start time is invalid.');
  }

  return parsed.toISOString();
}

function requireIdentifier(value: string, fieldName: string) {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${fieldName} is required.`);
  }

  return normalized;
}

export async function getCommunityFeed(
  input: CommunityFeedQuery = {},
): Promise<CommunityFeedPage> {
  return communityRepository.listCommunityRequests(input);
}

export async function getServiceRequest(
  serviceRequestId: string,
): Promise<CommunityRequest> {
  return communityRepository.getCommunityRequest(
    requireIdentifier(serviceRequestId, 'Service request ID'),
  );
}

export async function createServiceRequest(
  input: CreateCommunityRequestInput,
): Promise<CommunityRequest> {
  const actor = await requireAuthenticatedActor('customer');

  return communityRepository.createCommunityRequest({
    customer_id: actor.id,
    title: requireText(input.title, 'Title', 5, 120),
    category: input.category,
    description: requireText(input.description, 'Description', 10, 5000),
    location_label: requireText(input.locationLabel, 'Location', 2, 200),
    budget_amount: normalizeMoney(input.budgetAmount, 'Budget', false),
    currency: normalizeCurrency(input.currency),
    requested_start_at: normalizeDateTime(input.requestedStartAt),
    schedule_note: optionalText(input.scheduleNote, 'Schedule note', 200),
  });
}

export async function updateServiceRequest(
  serviceRequestId: string,
  input: UpdateCommunityRequestInput,
): Promise<CommunityRequest> {
  const actor = await requireAuthenticatedActor('customer');
  const reqId = requireIdentifier(serviceRequestId, 'Service request ID');
  const existing = await communityRepository.getCommunityRequest(reqId);

  if (!existing) {
    throw new Error('Service request not found.');
  }

  if (existing.customer_id !== actor.id) {
    throw new Error('Only the customer who created this request can modify it.');
  }

  if (existing.status !== 'open') {
    throw new Error('Only open service requests can be modified.');
  }

  const changes: CommunityRequestUpdate = {};

  if (input.title !== undefined) {
    changes.title = requireText(input.title, 'Title', 5, 120);
  }

  if (input.category !== undefined) {
    changes.category = input.category;
  }

  if (input.description !== undefined) {
    changes.description = requireText(
      input.description,
      'Description',
      10,
      5000,
    );
  }

  if (input.locationLabel !== undefined) {
    changes.location_label = requireText(
      input.locationLabel,
      'Location',
      2,
      200,
    );
  }

  if (input.budgetAmount !== undefined) {
    changes.budget_amount = normalizeMoney(input.budgetAmount, 'Budget', false);
  }

  if (input.currency !== undefined) {
    changes.currency = normalizeCurrency(input.currency);
  }

  if (input.requestedStartAt !== undefined) {
    changes.requested_start_at = normalizeDateTime(input.requestedStartAt);
  }

  if (input.scheduleNote !== undefined) {
    changes.schedule_note = optionalText(
      input.scheduleNote,
      'Schedule note',
      200,
    );
  }

  if (Object.keys(changes).length === 0) {
    throw new Error('No service request changes were provided.');
  }

  return communityRepository.updateCommunityRequest(reqId, changes);
}

export async function cancelServiceRequest(serviceRequestId: string) {
  const actor = await requireAuthenticatedActor('customer');
  const reqId = requireIdentifier(serviceRequestId, 'Service request ID');
  const existing = await communityRepository.getCommunityRequest(reqId);

  if (!existing) {
    throw new Error('Service request not found.');
  }

  if (existing.customer_id !== actor.id) {
    throw new Error('Only the customer who created this request can cancel it.');
  }

  if (existing.status === 'completed' || existing.status === 'cancelled') {
    throw new Error('This request cannot be cancelled in its current state.');
  }

  return communityRepository.cancelCommunityRequest(reqId);
}

export async function getServiceRequestComments(serviceRequestId: string) {
  return communityRepository.listCommunityComments(
    requireIdentifier(serviceRequestId, 'Service request ID'),
  );
}

export async function addServiceRequestComment(
  input: CreateCommunityCommentInput,
) {
  const actor = await requireAuthenticatedActor();

  return communityRepository.createCommunityComment({
    service_request_id: requireIdentifier(
      input.serviceRequestId,
      'Service request ID',
    ),
    author_id: actor.id,
    body: requireText(input.body, 'Comment', 1, 2000),
  });
}

export async function updateServiceRequestComment(
  commentId: string,
  body: string,
) {
  const actor = await requireAuthenticatedActor();
  const id = requireIdentifier(commentId, 'Comment ID');

  return communityRepository.updateCommunityComment(id, {
    body: requireText(body, 'Comment', 1, 2000),
  });
}

export async function deleteServiceRequestComment(commentId: string) {
  const actor = await requireAuthenticatedActor();
  const id = requireIdentifier(commentId, 'Comment ID');

  return communityRepository.deleteCommunityComment(id);
}

export async function toggleServiceRequestReaction(
  serviceRequestId: string,
) {
  const actor = await requireAuthenticatedActor();
  const requestId = requireIdentifier(serviceRequestId, 'Service request ID');
  const userId = actor.id;

  const existing = await communityRepository.getCommunityReaction(
    requestId,
    userId,
  );

  if (existing) {
    await communityRepository.deleteCommunityReaction(requestId, userId);
    return { reacted: false };
  }

  try {
    await communityRepository.createCommunityReaction(requestId, userId);
  } catch (error) {
    const current = await communityRepository.getCommunityReaction(
      requestId,
      userId,
    );
    if (!current) {
      throw error;
    }
  }

  return { reacted: true };
}

export async function getServiceRequestProposals(
  serviceRequestId: string,
): Promise<CommunityProposal[]> {
  return communityRepository.listCommunityProposals(
    requireIdentifier(serviceRequestId, 'Service request ID'),
  );
}

export async function submitServiceProposal(
  input: CreateCommunityProposalInput,
): Promise<CommunityProposal> {
  const actor = await requireAuthenticatedActor('worker');

  const requestId = requireIdentifier(
    input.serviceRequestId,
    'Service request ID',
  );

  const request = await communityRepository.getCommunityRequest(requestId);
  if (!request) {
    throw new Error('Service request not found.');
  }

  if (request.status !== 'open') {
    throw new Error('Cannot submit proposals for a request that is no longer open.');
  }

  if (request.customer_id === actor.id) {
    throw new Error('Customers cannot submit proposals for their own service requests.');
  }

  const existingProposals = await communityRepository.listCommunityProposals(requestId);
  const alreadyProposed = existingProposals.some(
    p => p.worker_id === actor.id && p.status !== 'withdrawn' && p.status !== 'declined',
  );

  if (alreadyProposed) {
    throw new Error('You have already submitted an active proposal for this request.');
  }

  return communityRepository.createCommunityProposal({
    service_request_id: requestId,
    worker_id: actor.id,
    price_amount: normalizeMoney(input.priceAmount, 'Proposal price', false),
    currency: normalizeCurrency(input.currency),
    availability_note: requireText(
      input.availabilityNote,
      'Availability',
      1,
      300,
    ),
    note: optionalText(input.note, 'Proposal note', 2000),
  });
}

export async function updateServiceProposal(
  proposalId: string,
  input: UpdateCommunityProposalInput,
): Promise<CommunityProposal> {
  const actor = await requireAuthenticatedActor('worker');
  const propId = requireIdentifier(proposalId, 'Proposal ID');
  const proposal = await communityRepository.getCommunityProposal(propId);

  if (!proposal) {
    throw new Error('Proposal not found.');
  }

  if (proposal.worker_id !== actor.id) {
    throw new Error('You can only modify your own proposals.');
  }

  if (proposal.status !== 'pending') {
    throw new Error('Only pending proposals can be modified.');
  }

  const changes: CommunityProposalUpdate = {};

  if (input.priceAmount !== undefined) {
    changes.price_amount = normalizeMoney(
      input.priceAmount,
      'Proposal price',
      false,
    );
  }

  if (input.currency !== undefined) {
    changes.currency = normalizeCurrency(input.currency);
  }

  if (input.availabilityNote !== undefined) {
    changes.availability_note = requireText(
      input.availabilityNote,
      'Availability',
      1,
      300,
    );
  }

  if (input.note !== undefined) {
    changes.note = optionalText(input.note, 'Proposal note', 2000);
  }

  if (Object.keys(changes).length === 0) {
    throw new Error('No proposal changes were provided.');
  }

  return communityRepository.updateCommunityProposal(propId, changes);
}

export async function withdrawServiceProposal(proposalId: string) {
  const actor = await requireAuthenticatedActor('worker');
  const propId = requireIdentifier(proposalId, 'Proposal ID');
  const proposal = await communityRepository.getCommunityProposal(propId);

  if (!proposal) {
    throw new Error('Proposal not found.');
  }

  if (proposal.worker_id !== actor.id) {
    throw new Error('You can only withdraw your own proposals.');
  }

  return communityRepository.withdrawCommunityProposal(propId);
}

export async function acceptServiceProposal(proposalId: string) {
  const actor = await requireAuthenticatedActor('customer');
  const propId = requireIdentifier(proposalId, 'Proposal ID');
  const proposal = await communityRepository.getCommunityProposal(propId);

  if (!proposal) {
    throw new Error('Proposal not found.');
  }

  // Prevent worker self-acceptance
  if (proposal.worker_id === actor.id) {
    throw new Error('Workers cannot accept their own proposals.');
  }

  const request = await communityRepository.getCommunityRequest(
    proposal.service_request_id,
  );

  if (!request) {
    throw new Error('Service request not found.');
  }

  // Only the customer who created this request can accept a proposal
  if (request.customer_id !== actor.id) {
    throw new Error('Only the customer who created this request can accept a proposal.');
  }

  if (request.status !== 'open') {
    throw new Error('This service request is no longer open.');
  }

  if (proposal.status !== 'pending') {
    throw new Error('Only pending proposals can be accepted.');
  }

  return communityRepository.acceptCommunityProposal(propId, actor.id);
}

export async function advanceServiceRequestStatus(
  serviceRequestId: string,
  status: 'ordered' | 'completed',
) {
  const actor = await requireAuthenticatedActor();
  const reqId = requireIdentifier(serviceRequestId, 'Service request ID');
  const request = await communityRepository.getCommunityRequest(reqId);

  if (!request) {
    throw new Error('Service request not found.');
  }

  if (request.status === 'cancelled' || request.status === 'completed') {
    throw new Error('This request cannot be transitioned from its current status.');
  }

  if (status === 'ordered') {
    if (request.status !== 'assigned') {
      throw new Error('Only assigned requests can be advanced to ordered.');
    }
  }

  if (status === 'completed') {
    if (request.status !== 'ordered' && request.status !== 'assigned') {
      throw new Error('Only in-progress requests can be completed.');
    }
    if (request.customer_id !== actor.id) {
      throw new Error('Only the customer who created this request can complete it.');
    }
  }

  return communityRepository.advanceCommunityRequestStatus(reqId, status);
}
