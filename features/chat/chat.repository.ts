import { PRESENTATION_MODE } from '@/lib/presentation-mode';
import { supabase } from '@/lib/supabase';
import type { JobConversation, JobMessage } from './types';

const isOfflineOrDemo =
  PRESENTATION_MODE ||
  !process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL.includes('example.supabase.co');

let mockConversations: JobConversation[] = [];
let mockJobMessages: JobMessage[] = [];

export async function openJobConversation(
  serviceRequestId: string,
): Promise<JobConversation> {
  if (!isOfflineOrDemo) {
    try {
      const { data, error } = await supabase.rpc('open_job_conversation', {
        p_service_request_id: serviceRequestId,
      });

      if (!error && data) {
        return data;
      }
    } catch {
      // Fallback
    }
  }

  let existing = mockConversations.find(
    c => c.service_request_id === serviceRequestId,
  );
  if (!existing) {
    existing = {
      id: `conv-${serviceRequestId}`,
      service_request_id: serviceRequestId,
      customer_id: '00000000-0000-4000-8000-000000000001',
      worker_id: 'worker-demo-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockConversations.push(existing);
  }

  return existing;
}

export async function listJobMessages(
  conversationId: string,
): Promise<JobMessage[]> {
  try {
    const { data, error } = await supabase
      .from('job_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });

    if (!error && data) {
      return data;
    }
  } catch {
    // Fallback
  }

  return mockJobMessages.filter(m => m.conversation_id === conversationId);
}

export async function insertJobMessage(input: {
  conversationId: string;
  senderId: string;
  body: string;
}): Promise<JobMessage> {
  try {
    const { data, error } = await supabase
      .from('job_messages')
      .insert({
        conversation_id: input.conversationId,
        sender_id: input.senderId,
        body: input.body,
        message_type: 'text',
      })
      .select()
      .single();

    if (!error && data) {
      return data;
    }
  } catch {
    // Fallback
  }

  const newMsg: JobMessage = {
    id: `msg-${Date.now()}`,
    conversation_id: input.conversationId,
    sender_id: input.senderId,
    body: input.body,
    message_type: 'text',
    created_at: new Date().toISOString(),
  };

  mockJobMessages.push(newMsg);
  return newMsg;
}
