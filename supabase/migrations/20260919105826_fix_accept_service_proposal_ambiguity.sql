-- Fix ambiguous output-column reference in accept_service_proposal().
-- service_request_id is also an OUT column of RETURNS TABLE, so all
-- service_proposals column references are explicitly qualified.

create or replace function public.accept_service_proposal(
  p_proposal_id uuid
)
returns table (
  service_request_id uuid,
  accepted_proposal_id uuid
)
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_id uuid;
  v_request_id uuid;
  v_customer_id uuid;
  v_request_status public.service_request_status;
  v_proposal_status public.service_proposal_status;
begin

  v_actor_id := auth.uid();

  if v_actor_id is null then
    raise exception 'Authentication required.'
      using errcode = '42501';
  end if;


  select proposal.service_request_id
  into v_request_id
  from public.service_proposals as proposal
  where proposal.id = p_proposal_id;


  if not found then
    raise exception 'Proposal not found.'
      using errcode = 'P0002';
  end if;


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


  if v_customer_id <> v_actor_id then
    raise exception
      'Only the customer who created this request can accept a proposal.'
      using errcode = '42501';
  end if;


  if v_request_status <> 'open' then
    raise exception 'This service request is no longer open.'
      using errcode = 'P0001';
  end if;


  select proposal.status
  into v_proposal_status
  from public.service_proposals as proposal
  where proposal.id = p_proposal_id
    and proposal.service_request_id = v_request_id
  for update;


  if not found then
    raise exception
      'Proposal does not belong to this service request.'
      using errcode = 'P0002';
  end if;


  if v_proposal_status <> 'pending' then
    raise exception 'Only pending proposals can be accepted.'
      using errcode = 'P0001';
  end if;


  update public.service_proposals as proposal
  set status =
    case
      when proposal.id = p_proposal_id
        then 'accepted'::public.service_proposal_status
      when proposal.status = 'pending'
        then 'declined'::public.service_proposal_status
      else proposal.status
    end
  where proposal.service_request_id = v_request_id
    and (
      proposal.id = p_proposal_id
      or proposal.status = 'pending'
    );


  update public.service_requests as request
  set
    status = 'assigned',
    accepted_proposal_id = p_proposal_id,
    last_activity_at = clock_timestamp()
  where request.id = v_request_id;


  return query
  select
    v_request_id,
    p_proposal_id;

end;
$$;


revoke all
on function public.accept_service_proposal(uuid)
from public;


grant execute
on function public.accept_service_proposal(uuid)
to authenticated;