import { supabase } from '@/lib/supabase';

import * as chatRepository from './chat.repository';
import type { JobConversation, JobMessage } from './types';

function requireId(value: string, name: string) {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${name} is required.`);
  }

  return normalized;
}

function normalizeMessage(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error('Message cannot be empty.');
  }

  if (normalized.length > 4000) {
    throw new Error('Message cannot exceed 4000 characters.');
  }

  return normalized;
}

export async function openConversation(
  serviceRequestId: string,
): Promise<JobConversation> {
  return chatRepository.openJobConversation(
    requireId(serviceRequestId, 'Service request ID'),
  );
}

export async function getMessages(
  conversationId: string,
): Promise<JobMessage[]> {
  return chatRepository.listJobMessages(
    requireId(conversationId, 'Conversation ID'),
  );
}

export async function sendMessage(input: {
  conversationId: string;
  body: string;
}): Promise<JobMessage> {
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

  return chatRepository.insertJobMessage({
    conversationId: requireId(input.conversationId, 'Conversation ID'),
    senderId: user.id,
    body: normalizeMessage(input.body),
  });
}
