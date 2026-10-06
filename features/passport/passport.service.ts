import { supabase } from '@/lib/supabase';

export interface SkillPassportEntry {
  category: string;
  completedJobs: number;
}

export interface SkillPassportSummary {
  completedJobs: number;
  assignedJobs: number;
  skills: SkillPassportEntry[];
}

export async function getMySkillPassport(): Promise<SkillPassportSummary> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error('Authentication required.');
  }

  const { data: proposals, error: proposalError } = await supabase
    .from('service_proposals')
    .select('service_request_id')
    .eq('worker_id', user.id)
    .eq('status', 'accepted');

  if (proposalError) {
    throw proposalError;
  }

  const requestIds = Array.from(
    new Set((proposals ?? []).map(item => item.service_request_id)),
  );

  if (requestIds.length === 0) {
    return {
      completedJobs: 0,
      assignedJobs: 0,
      skills: [],
    };
  }

  const { data: requests, error: requestError } = await supabase
    .from('service_requests')
    .select('id, category, status')
    .in('id', requestIds);

  if (requestError) {
    throw requestError;
  }

  const rows = requests ?? [];
  const completed = rows.filter(item => item.status === 'completed');

  const skillCounts = new Map<string, number>();

  completed.forEach(item => {
    skillCounts.set(
      item.category,
      (skillCounts.get(item.category) ?? 0) + 1,
    );
  });

  return {
    completedJobs: completed.length,
    assignedJobs: rows.length,
    skills: Array.from(skillCounts.entries())
      .map(([category, completedJobs]) => ({
        category,
        completedJobs,
      }))
      .sort((a, b) => b.completedJobs - a.completedJobs),
  };
}
