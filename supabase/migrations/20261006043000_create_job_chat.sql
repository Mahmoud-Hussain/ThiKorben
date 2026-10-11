-- ThiKorben private job conversation foundation.
-- One conversation per assigned service request.
-- Only the accepted customer/worker pair can access messages.

create table public.job_conversations (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null unique
    references public.service_requests(id)
    on delete cascade,
  customer_id uuid not null
    references auth.users(id)
    on delete cascade,
  worker_id uuid not null
    references auth.users(id)
    on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (customer_id <> worker_id)
);

create table public.job_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null
    references public.job_conversations(id)
    on delete cascade,
  sender_id uuid not null
    references auth.users(id)
    on delete cascade,
  body text not null
    check (char_length(btrim(body)) between 1 and 4000),
  message_type text not null default 'text'
    check (message_type in ('text', 'system')),
  created_at timestamptz not null default now()
);

create index job_conversations_customer_idx
on public.job_conversations (customer_id, updated_at desc);

create index job_conversations_worker_idx
on public.job_conversations (worker_id, updated_at desc);

create index job_messages_conversation_idx
on public.job_messages (conversation_id, created_at asc, id asc);

create trigger job_conversations_set_updated_at
before update on public.job_conversations
for each row
execute function public.auth_core_set_updated_at();

create or replace function public.open_job_conversation(
  p_service_request_id uuid
)
returns public.job_conversations
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid;
  v_request public.service_requests;
  v_proposal public.service_proposals;
  v_conversation public.job_conversations;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  select *
  into v_request
  from public.service_requests
  where id = p_service_request_id;

  if not found then
    raise exception 'Service request not found.';
  end if;

  if v_request.accepted_proposal_id is null then
    raise exception 'A worker must be accepted before private chat starts.';
  end if;

  select *
  into v_proposal
  from public.service_proposals
  where id = v_request.accepted_proposal_id
    and service_request_id = v_request.id
    and status = 'accepted';

  if not found then
    raise exception 'Accepted proposal not found.';
  end if;

  if v_user_id <> v_request.customer_id
    and v_user_id <> v_proposal.worker_id then
    raise exception 'You are not a participant in this job.';
  end if;

  insert into public.job_conversations (
    service_request_id,
    customer_id,
    worker_id
  )
  values (
    v_request.id,
    v_request.customer_id,
    v_proposal.worker_id
  )
  on conflict (service_request_id)
  do update set updated_at = public.job_conversations.updated_at
  returning *
  into v_conversation;

  return v_conversation;
end;
$$;

alter table public.job_conversations enable row level security;
alter table public.job_messages enable row level security;

create policy "job participants can read conversations"
on public.job_conversations
for select
to authenticated
using (
  customer_id = auth.uid()
  or worker_id = auth.uid()
);

create policy "job participants can read messages"
on public.job_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.job_conversations as conversation
    where conversation.id = job_messages.conversation_id
      and (
        conversation.customer_id = auth.uid()
        or conversation.worker_id = auth.uid()
      )
  )
);

create policy "job participants can send messages"
on public.job_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.job_conversations as conversation
    where conversation.id = job_messages.conversation_id
      and (
        conversation.customer_id = auth.uid()
        or conversation.worker_id = auth.uid()
      )
  )
);

revoke all on table public.job_conversations from anon, authenticated;
revoke all on table public.job_messages from anon, authenticated;

grant select on table public.job_conversations to authenticated;
grant select, insert (conversation_id, sender_id, body, message_type)
on public.job_messages to authenticated;

revoke all
on function public.open_job_conversation(uuid)
from public;

grant execute
on function public.open_job_conversation(uuid)
to authenticated;
