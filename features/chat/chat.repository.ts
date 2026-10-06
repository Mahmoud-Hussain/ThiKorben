import { supabase } from '@/lib/supabase';
import type { JobConversation, JobMessage } from './types';

export async function openJobConversation(
  serviceRequestId: string,
): Promise<JobConversation> {
  const { data, error } = await supabase.rpc('open_job_conversation', {
    p_service_request_id: serviceRequestId,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Conversation was not created.');
  }

  return data;
}

export async function listJobMessages(
  conversationId: string,
): Promise<JobMessage[]> {
  const { data, error } = await supabase
    .from('job_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function insertJobMessage(input: {
  conversationId: string;
  senderId: string;
  body: string;
}): Promise<JobMessage> {
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

  if (error) {
    throw error;
  }

  return data;
}
