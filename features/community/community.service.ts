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

async function getAuthenticatedUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error('Authentication required.');
  }

  return user.id;
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
  const customerId = await getAuthenticatedUserId();

  return communityRepository.createCommunityRequest({
    customer_id: customerId,

    title: requireText(input.title, 'Title', 5, 120),

    category: input.category,

    description: requireText(input.description, 'Description', 10, 5000),

    location_label: requireText(input.locationLabel, 'Location', 2, 200),

    budget_amount: normalizeMoney(input.budgetAmount, 'Budget', true),

    currency: normalizeCurrency(input.currency),

    requested_start_at: normalizeDateTime(input.requestedStartAt),

    schedule_note: optionalText(input.scheduleNote, 'Schedule note', 200),
  });
}

export async function updateServiceRequest(
  serviceRequestId: string,
  input: UpdateCommunityRequestInput,
): Promise<CommunityRequest> {
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
    changes.budget_amount = normalizeMoney(input.budgetAmount, 'Budget', true);
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

  return communityRepository.updateCommunityRequest(
    requireIdentifier(serviceRequestId, 'Service request ID'),
    changes,
  );
}

export async function cancelServiceRequest(serviceRequestId: string) {
  return communityRepository.cancelCommunityRequest(
    requireIdentifier(serviceRequestId, 'Service request ID'),
  );
}

export async function getServiceRequestComments(serviceRequestId: string) {
  return communityRepository.listCommunityComments(
    requireIdentifier(serviceRequestId, 'Service request ID'),
  );
}

export async function addServiceRequestComment(
  input: CreateCommunityCommentInput,
) {
  const authorId = await getAuthenticatedUserId();

  return communityRepository.createCommunityComment({
    service_request_id: requireIdentifier(
      input.serviceRequestId,
      'Service request ID',
    ),

    author_id: authorId,

    body: requireText(input.body, 'Comment', 1, 2000),
  });
}

export async function updateServiceRequestComment(
  commentId: string,
  body: string,
) {
  return communityRepository.updateCommunityComment(
    requireIdentifier(commentId, 'Comment ID'),
    {
      body: requireText(body, 'Comment', 1, 2000),
    },
  );
}

export async function deleteServiceRequestComment(commentId: string) {
  return communityRepository.deleteCommunityComment(
    requireIdentifier(commentId, 'Comment ID'),
  );
}

export async function toggleServiceRequestReaction(serviceRequestId: string) {
  const requestId = requireIdentifier(serviceRequestId, 'Service request ID');

  const userId = await getAuthenticatedUserId();

  const existing = await communityRepository.getCommunityReaction(
    requestId,
    userId,
  );

  if (existing) {
    await communityRepository.deleteCommunityReaction(requestId, userId);

    return {
      reacted: false,
    };
  }

  try {
    await communityRepository.createCommunityReaction(requestId, userId);
  } catch (error) {
    /*
     * The database primary key prevents duplicate reactions.
     * A concurrent second tap may therefore race with the first
     * request. Re-read state before surfacing an error.
     */
    const current = await communityRepository.getCommunityReaction(
      requestId,
      userId,
    );

    if (!current) {
      throw error;
    }
  }

  return {
    reacted: true,
  };
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
  const workerId = await getAuthenticatedUserId();

  return communityRepository.createCommunityProposal({
    service_request_id: requireIdentifier(
      input.serviceRequestId,
      'Service request ID',
    ),

    worker_id: workerId,

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

  return communityRepository.updateCommunityProposal(
    requireIdentifier(proposalId, 'Proposal ID'),
    changes,
  );
}

export async function withdrawServiceProposal(proposalId: string) {
  return communityRepository.withdrawCommunityProposal(
    requireIdentifier(proposalId, 'Proposal ID'),
  );
}

export async function acceptServiceProposal(proposalId: string) {
  return communityRepository.acceptCommunityProposal(
    requireIdentifier(proposalId, 'Proposal ID'),
  );
}
