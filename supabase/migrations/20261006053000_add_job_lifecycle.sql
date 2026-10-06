-- Controlled service lifecycle transitions for assigned jobs.

create or replace function public.advance_service_request_status(
  p_service_request_id uuid,
  p_status public.service_request_status
)
returns public.service_request_status
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid;
  v_request public.service_requests;
  v_proposal public.service_proposals;
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
    raise exception 'Assigned worker required.';
  end if;

  select *
  into v_proposal
  from public.service_proposals
  where id = v_request.accepted_proposal_id
    and status = 'accepted';

  if not found or v_proposal.worker_id <> v_user_id then
    raise exception 'Only the assigned worker can update job progress.';
  end if;

  if v_request.status = 'assigned' and p_status = 'ordered' then
    update public.service_requests
    set status = 'ordered', last_activity_at = clock_timestamp()
    where id = v_request.id;

    return 'ordered';
  end if;

  if v_request.status = 'ordered' and p_status = 'completed' then
    update public.service_requests
    set status = 'completed', last_activity_at = clock_timestamp()
    where id = v_request.id;

    return 'completed';
  end if;

  raise exception 'Invalid job status transition.';
end;
$$;

revoke all
on function public.advance_service_request_status(uuid, public.service_request_status)
from public;

grant execute
on function public.advance_service_request_status(uuid, public.service_request_status)
to authenticated;
