-- ============================================================================
-- ThiKorben Marketplace: Strict Role Permissions & Proposal Integrity Migration
-- ============================================================================

-- 1. Tighten RLS Policy for Service Request Creation:
-- Only authenticated users whose active role is 'customer' can insert service requests.
drop policy if exists "users can create their own service requests" on public.service_requests;
drop policy if exists "customers can create their own service requests" on public.service_requests;

create policy "customers can create their own service requests"
on public.service_requests
for insert
to authenticated
with check (
  customer_id = auth.uid()
  and exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'customer'
  )
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and active_role = 'customer'
  )
);

-- 2. Tighten RLS Policy for Service Proposal Creation:
-- Only authenticated users whose active role is 'worker' can insert service proposals,
-- and they cannot submit proposals on their own requests or non-open requests.
drop policy if exists "users can submit proposals as themselves" on public.service_proposals;
drop policy if exists "workers can submit proposals as themselves" on public.service_proposals;

create policy "workers can submit proposals as themselves"
on public.service_proposals
for insert
to authenticated
with check (
  worker_id = auth.uid()
  and exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'worker'
  )
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and active_role = 'worker'
  )
  and exists (
    select 1
    from public.service_requests as request
    where request.id = service_proposals.service_request_id
      and request.status = 'open'
      and request.customer_id <> auth.uid()
  )
);

-- 3. Trigger to enforce proposal integrity on insert/update:
-- Prevents a worker from submitting proposals on their own request,
-- or submitting proposals on closed/assigned requests.
create or replace function public.check_proposal_integrity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_req record;
begin
  select customer_id, status
  into v_req
  from public.service_requests
  where id = new.service_request_id;

  if not found then
    raise exception 'Service request not found.'
      using errcode = 'P0002';
  end if;

  if v_req.customer_id = new.worker_id then
    raise exception 'Customers cannot submit proposals for their own service requests.'
      using errcode = '42501';
  end if;

  if TG_OP = 'INSERT' and v_req.status <> 'open' then
    raise exception 'Cannot submit proposals for a request that is not open.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trigger_validate_service_proposal on public.service_proposals;

create trigger trigger_validate_service_proposal
before insert or update of service_request_id, worker_id on public.service_proposals
for each row execute function public.check_proposal_integrity();

-- 4. Atomic Proposal Acceptance Function:
-- Enforces:
-- - Actor must be authenticated.
-- - Only the customer who owns the request can accept proposals.
-- - Worker cannot accept their own proposal.
-- - Request must be 'open'.
-- - Proposal must be 'pending'.
-- - Atomically assigns request, accepts winning proposal, declines all other pending proposals.
create or replace function public.accept_service_proposal(
  p_proposal_id uuid
)
returns table (
  service_request_id uuid,
  accepted_proposal_id uuid
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_actor_id uuid;
  v_request_id uuid;
  v_customer_id uuid;
  v_worker_id uuid;
  v_request_status public.service_request_status;
  v_proposal_status public.service_proposal_status;
begin
  v_actor_id := auth.uid();

  if v_actor_id is null then
    raise exception 'Authentication required.'
      using errcode = '42501';
  end if;

  select
    proposal.service_request_id,
    proposal.worker_id,
    proposal.status
  into
    v_request_id,
    v_worker_id,
    v_proposal_status
  from public.service_proposals as proposal
  where proposal.id = p_proposal_id;

  if not found then
    raise exception 'Proposal not found.'
      using errcode = 'P0002';
  end if;

  -- Worker cannot accept their own proposal
  if v_worker_id = v_actor_id then
    raise exception 'Workers cannot accept their own proposals.'
      using errcode = '42501';
  end if;

  -- Lock service request for update to prevent concurrent double-assignments
  select
    request.customer_id,
    request.status
  into
    v_customer_id,
    v_request_status
  from public.service_requests as request
  where request.id = v_request_id
  for update;

  if not found then
    raise exception 'Service request not found.'
      using errcode = 'P0002';
  end if;

  -- Only customer owner can accept
  if v_customer_id <> v_actor_id then
    raise exception 'Only the customer who created this request can accept a proposal.'
      using errcode = '42501';
  end if;

  if v_request_status <> 'open' then
    raise exception 'This service request is no longer open.'
      using errcode = 'P0001';
  end if;

  if v_proposal_status <> 'pending' then
    raise exception 'Only pending proposals can be accepted.'
      using errcode = 'P0001';
  end if;

  -- Atomically accept winning proposal and decline competing proposals
  update public.service_proposals as proposal
  set
    status = case
      when proposal.id = p_proposal_id then 'accepted'::public.service_proposal_status
      when proposal.status = 'pending' then 'declined'::public.service_proposal_status
      else proposal.status
    end,
    updated_at = clock_timestamp()
  where proposal.service_request_id = v_request_id
    and (
      proposal.id = p_proposal_id
      or proposal.status = 'pending'
    );

  -- Update request status to assigned
  update public.service_requests as request
  set
    status = 'assigned',
    accepted_proposal_id = p_proposal_id,
    last_activity_at = clock_timestamp(),
    updated_at = clock_timestamp()
  where request.id = v_request_id;

  return query
  select
    v_request_id,
    p_proposal_id;
end;
$$;

revoke all on function public.accept_service_proposal(uuid) from public;
grant execute on function public.accept_service_proposal(uuid) to authenticated;
