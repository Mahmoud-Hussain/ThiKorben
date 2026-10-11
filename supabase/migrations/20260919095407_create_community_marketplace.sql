-- ============================================================================
-- ThiKorben Community Marketplace
-- Production-oriented foundation for:
-- service requests, comments, reactions, proposals and captured media.
--
-- Authentication source:
--   auth.users
--
-- Role/profile-specific authorization will be tightened after the shared
-- authentication/profile contract is merged into dev.
-- ============================================================================


-- ============================================================================
-- ENUMS
-- ============================================================================

create type public.service_request_status as enum (
  'open',
  'assigned',
  'ordered',
  'completed',
  'cancelled'
);

create type public.service_proposal_status as enum (
  'pending',
  'accepted',
  'declined',
  'withdrawn'
);

create type public.service_media_type as enum (
  'image',
  'video'
);


-- ============================================================================
-- SERVICE REQUESTS
-- ============================================================================

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),

  customer_id uuid not null
    references auth.users(id)
    on delete cascade,

  title text not null
    check (
      char_length(btrim(title)) between 5 and 120
    ),

  category text not null
    check (
      category ~ '^[a-z0-9][a-z0-9_-]{1,49}$'
    ),

  description text not null
    check (
      char_length(btrim(description)) between 10 and 5000
    ),

  location_label text not null
    check (
      char_length(btrim(location_label)) between 2 and 200
    ),

  budget_amount numeric(12, 2) not null
    check (
      budget_amount >= 0
      and budget_amount <= 100000000
    ),

  currency text not null default 'BDT'
    check (
      currency ~ '^[A-Z]{3}$'
    ),

  requested_start_at timestamptz,

  schedule_note text
    check (
      schedule_note is null
      or char_length(btrim(schedule_note)) between 1 and 200
    ),

  status public.service_request_status
    not null
    default 'open',

  accepted_proposal_id uuid,

  reaction_count integer not null default 0
    check (reaction_count >= 0),

  comment_count integer not null default 0
    check (comment_count >= 0),

  proposal_count integer not null default 0
    check (proposal_count >= 0),

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  last_activity_at timestamptz not null default now()
);


-- ============================================================================
-- COMMENTS
-- ============================================================================

create table public.service_request_comments (
  id uuid primary key default gen_random_uuid(),

  service_request_id uuid not null
    references public.service_requests(id)
    on delete cascade,

  author_id uuid not null
    references auth.users(id)
    on delete cascade,

  body text not null
    check (
      char_length(btrim(body)) between 1 and 2000
    ),

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- ============================================================================
-- REACTIONS
-- One reaction per user per service request.
-- ============================================================================

create table public.service_request_reactions (
  service_request_id uuid not null
    references public.service_requests(id)
    on delete cascade,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  created_at timestamptz not null default now(),

  primary key (
    service_request_id,
    user_id
  )
);


-- ============================================================================
-- WORKER PROPOSALS
-- ============================================================================

create table public.service_proposals (
  id uuid primary key default gen_random_uuid(),

  service_request_id uuid not null
    references public.service_requests(id)
    on delete cascade,

  worker_id uuid not null
    references auth.users(id)
    on delete cascade,

  price_amount numeric(12, 2) not null
    check (
      price_amount > 0
      and price_amount <= 100000000
    ),

  currency text not null default 'BDT'
    check (
      currency ~ '^[A-Z]{3}$'
    ),

  availability_note text not null
    check (
      char_length(btrim(availability_note)) between 1 and 300
    ),

  note text
    check (
      note is null
      or char_length(btrim(note)) between 1 and 2000
    ),

  status public.service_proposal_status
    not null
    default 'pending',

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint service_proposals_one_per_worker
    unique (
      service_request_id,
      worker_id
    )
);


-- A service request may have only one accepted proposal.
create unique index service_proposals_one_accepted_per_request_idx
  on public.service_proposals(service_request_id)
  where status = 'accepted';


-- Link accepted proposal after service_proposals exists.
alter table public.service_requests
  add constraint service_requests_accepted_proposal_fk
  foreign key (accepted_proposal_id)
  references public.service_proposals(id)
  on delete set null;


-- ============================================================================
-- CAPTURED MEDIA METADATA
--
-- Actual file storage and Storage policies will be introduced with the
-- camera/media integration.
--
-- capture_source is intentionally database-controlled as "camera".
-- Authenticated clients are not granted permission to override it.
-- ============================================================================

create table public.service_request_media (
  id uuid primary key default gen_random_uuid(),

  service_request_id uuid not null
    references public.service_requests(id)
    on delete cascade,

  uploaded_by uuid not null
    references auth.users(id)
    on delete cascade,

  storage_bucket text not null
    default 'community-media',

  storage_path text not null
    unique,

  media_type public.service_media_type not null,

  capture_source text not null
    default 'camera'
    check (
      capture_source = 'camera'
    ),

  mime_type text not null
    check (
      char_length(btrim(mime_type)) between 3 and 100
    ),

  size_bytes bigint
    check (
      size_bytes is null
      or size_bytes >= 0
    ),

  width integer
    check (
      width is null
      or width > 0
    ),

  height integer
    check (
      height is null
      or height > 0
    ),

  duration_ms integer
    check (
      duration_ms is null
      or duration_ms >= 0
    ),

  sort_order smallint not null default 0
    check (
      sort_order >= 0
    ),

  created_at timestamptz not null default now()
);


-- ============================================================================
-- INDEXES
-- ============================================================================

create index service_requests_feed_idx
  on public.service_requests (
    status,
    last_activity_at desc,
    id desc
  );

create index service_requests_customer_idx
  on public.service_requests (
    customer_id,
    created_at desc
  );

create index service_requests_category_idx
  on public.service_requests (
    category,
    last_activity_at desc
  );

create index service_request_comments_request_idx
  on public.service_request_comments (
    service_request_id,
    created_at asc
  );

create index service_request_comments_author_idx
  on public.service_request_comments (
    author_id,
    created_at desc
  );

create index service_request_reactions_user_idx
  on public.service_request_reactions (
    user_id,
    created_at desc
  );

create index service_proposals_request_idx
  on public.service_proposals (
    service_request_id,
    status,
    created_at desc
  );

create index service_proposals_worker_idx
  on public.service_proposals (
    worker_id,
    created_at desc
  );

create index service_request_media_request_idx
  on public.service_request_media (
    service_request_id,
    sort_order,
    created_at
  );


-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

create or replace function public.community_set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at := clock_timestamp();

  return new;
end;
$$;


create trigger service_requests_set_updated_at
before update on public.service_requests
for each row
execute function public.community_set_updated_at();


create trigger service_request_comments_set_updated_at
before update on public.service_request_comments
for each row
execute function public.community_set_updated_at();


create trigger service_proposals_set_updated_at
before update on public.service_proposals
for each row
execute function public.community_set_updated_at();


-- ============================================================================
-- DENORMALIZED COUNTERS
--
-- Feed counters are stored on service_requests to avoid expensive aggregate
-- queries for every community feed card.
-- ============================================================================

create or replace function public.community_sync_comment_count()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin

  if tg_op = 'INSERT' then

    update public.service_requests
    set
      comment_count = comment_count + 1,
      last_activity_at = clock_timestamp()
    where id = new.service_request_id;

    return new;

  elsif tg_op = 'DELETE' then

    update public.service_requests
    set
      comment_count = greatest(comment_count - 1, 0)
    where id = old.service_request_id;

    return old;

  end if;

  return null;

end;
$$;


create trigger service_request_comments_sync_count
after insert or delete
on public.service_request_comments
for each row
execute function public.community_sync_comment_count();


create or replace function public.community_sync_reaction_count()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin

  if tg_op = 'INSERT' then

    update public.service_requests
    set reaction_count = reaction_count + 1
    where id = new.service_request_id;

    return new;

  elsif tg_op = 'DELETE' then

    update public.service_requests
    set reaction_count = greatest(reaction_count - 1, 0)
    where id = old.service_request_id;

    return old;

  end if;

  return null;

end;
$$;


create trigger service_request_reactions_sync_count
after insert or delete
on public.service_request_reactions
for each row
execute function public.community_sync_reaction_count();


create or replace function public.community_sync_proposal_count()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin

  if tg_op = 'INSERT' then

    update public.service_requests
    set
      proposal_count = proposal_count + 1,
      last_activity_at = clock_timestamp()
    where id = new.service_request_id;

    return new;

  elsif tg_op = 'DELETE' then

    update public.service_requests
    set
      proposal_count = greatest(proposal_count - 1, 0)
    where id = old.service_request_id;

    return old;

  end if;

  return null;

end;
$$;


create trigger service_proposals_sync_count
after insert or delete
on public.service_proposals
for each row
execute function public.community_sync_proposal_count();


-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.service_requests
  enable row level security;

alter table public.service_request_comments
  enable row level security;

alter table public.service_request_reactions
  enable row level security;

alter table public.service_proposals
  enable row level security;

alter table public.service_request_media
  enable row level security;


-- ============================================================================
-- SERVICE REQUEST POLICIES
-- ============================================================================

create policy "authenticated users can read community requests"
on public.service_requests
for select
to authenticated
using (
  auth.uid() is not null
  and (
    status <> 'cancelled'
    or customer_id = auth.uid()
  )
);


create policy "users can create their own service requests"
on public.service_requests
for insert
to authenticated
with check (
  customer_id = auth.uid()
);


create policy "customers can edit their open service requests"
on public.service_requests
for update
to authenticated
using (
  customer_id = auth.uid()
  and status = 'open'
)
with check (
  customer_id = auth.uid()
  and status = 'open'
);


-- ============================================================================
-- COMMENT POLICIES
-- ============================================================================

create policy "authenticated users can read visible request comments"
on public.service_request_comments
for select
to authenticated
using (
  exists (
    select 1
    from public.service_requests as request
    where request.id = service_request_comments.service_request_id
      and (
        request.status <> 'cancelled'
        or request.customer_id = auth.uid()
      )
  )
);


create policy "authenticated users can create comments"
on public.service_request_comments
for insert
to authenticated
with check (
  author_id = auth.uid()
  and exists (
    select 1
    from public.service_requests as request
    where request.id = service_request_comments.service_request_id
      and request.status in ('open', 'assigned')
  )
);


create policy "users can edit their own comments"
on public.service_request_comments
for update
to authenticated
using (
  author_id = auth.uid()
)
with check (
  author_id = auth.uid()
);


create policy "users can delete their own comments"
on public.service_request_comments
for delete
to authenticated
using (
  author_id = auth.uid()
);


-- ============================================================================
-- REACTION POLICIES
-- ============================================================================

create policy "authenticated users can read reactions"
on public.service_request_reactions
for select
to authenticated
using (
  exists (
    select 1
    from public.service_requests as request
    where request.id = service_request_reactions.service_request_id
      and (
        request.status <> 'cancelled'
        or request.customer_id = auth.uid()
      )
  )
);


create policy "users can react as themselves"
on public.service_request_reactions
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.service_requests as request
    where request.id = service_request_reactions.service_request_id
      and request.status <> 'cancelled'
  )
);


create policy "users can remove their own reactions"
on public.service_request_reactions
for delete
to authenticated
using (
  user_id = auth.uid()
);


-- ============================================================================
-- PROPOSAL POLICIES
--
-- Proposal details are private:
-- - worker can see their own proposal
-- - customer who owns the request can see proposals for their request
-- ============================================================================

create policy "proposal participants can read proposals"
on public.service_proposals
for select
to authenticated
using (
  worker_id = auth.uid()
  or exists (
    select 1
    from public.service_requests as request
    where request.id = service_proposals.service_request_id
      and request.customer_id = auth.uid()
  )
);


create policy "users can submit proposals as themselves"
on public.service_proposals
for insert
to authenticated
with check (
  worker_id = auth.uid()
  and exists (
    select 1
    from public.service_requests as request
    where request.id = service_proposals.service_request_id
      and request.status = 'open'
      and request.customer_id <> auth.uid()
  )
);


create policy "workers can edit their pending proposals"
on public.service_proposals
for update
to authenticated
using (
  worker_id = auth.uid()
  and status = 'pending'
)
with check (
  worker_id = auth.uid()
  and status = 'pending'
);


-- ============================================================================
-- MEDIA POLICIES
-- ============================================================================

create policy "authenticated users can read visible request media"
on public.service_request_media
for select
to authenticated
using (
  exists (
    select 1
    from public.service_requests as request
    where request.id = service_request_media.service_request_id
      and (
        request.status <> 'cancelled'
        or request.customer_id = auth.uid()
      )
  )
);


create policy "customers can attach captured media to own requests"
on public.service_request_media
for insert
to authenticated
with check (
  uploaded_by = auth.uid()
  and exists (
    select 1
    from public.service_requests as request
    where request.id = service_request_media.service_request_id
      and request.customer_id = auth.uid()
      and request.status = 'open'
  )
);


create policy "customers can delete own request media"
on public.service_request_media
for delete
to authenticated
using (
  uploaded_by = auth.uid()
  and exists (
    select 1
    from public.service_requests as request
    where request.id = service_request_media.service_request_id
      and request.customer_id = auth.uid()
  )
);


-- ============================================================================
-- TABLE PRIVILEGES
--
-- Protected columns such as status, counters, accepted_proposal_id,
-- created_at and capture_source cannot be directly modified by clients.
-- ============================================================================

revoke all
on table public.service_requests
from anon, authenticated;

revoke all
on table public.service_request_comments
from anon, authenticated;

revoke all
on table public.service_request_reactions
from anon, authenticated;

revoke all
on table public.service_proposals
from anon, authenticated;

revoke all
on table public.service_request_media
from anon, authenticated;


grant select
on table public.service_requests
to authenticated;

grant insert (
  customer_id,
  title,
  category,
  description,
  location_label,
  budget_amount,
  currency,
  requested_start_at,
  schedule_note
)
on public.service_requests
to authenticated;

grant update (
  title,
  category,
  description,
  location_label,
  budget_amount,
  currency,
  requested_start_at,
  schedule_note
)
on public.service_requests
to authenticated;


grant select
on table public.service_request_comments
to authenticated;

grant insert (
  service_request_id,
  author_id,
  body
)
on public.service_request_comments
to authenticated;

grant update (
  body
)
on public.service_request_comments
to authenticated;

grant delete
on table public.service_request_comments
to authenticated;


grant select
on table public.service_request_reactions
to authenticated;

grant insert (
  service_request_id,
  user_id
)
on public.service_request_reactions
to authenticated;

grant delete
on table public.service_request_reactions
to authenticated;


grant select
on table public.service_proposals
to authenticated;

grant insert (
  service_request_id,
  worker_id,
  price_amount,
  currency,
  availability_note,
  note
)
on public.service_proposals
to authenticated;

grant update (
  price_amount,
  currency,
  availability_note,
  note
)
on public.service_proposals
to authenticated;


grant select
on table public.service_request_media
to authenticated;

grant insert (
  service_request_id,
  uploaded_by,
  storage_path,
  media_type,
  mime_type,
  size_bytes,
  width,
  height,
  duration_ms,
  sort_order
)
on public.service_request_media
to authenticated;

grant delete
on table public.service_request_media
to authenticated;


grant usage
on type
  public.service_request_status,
  public.service_proposal_status,
  public.service_media_type
to authenticated;


-- ============================================================================
-- ATOMIC SERVICE REQUEST CANCELLATION
-- ============================================================================

create or replace function public.cancel_service_request(
  p_service_request_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_id uuid;
  v_status public.service_request_status;
begin

  v_actor_id := auth.uid();

  if v_actor_id is null then
    raise exception 'Authentication required.'
      using errcode = '42501';
  end if;


  select request.status
  into v_status
  from public.service_requests as request
  where request.id = p_service_request_id
    and request.customer_id = v_actor_id
  for update;


  if not found then
    raise exception 'Service request not found or access denied.'
      using errcode = 'P0002';
  end if;


  if v_status <> 'open' then
    raise exception 'Only open service requests can be cancelled.'
      using errcode = 'P0001';
  end if;


  update public.service_proposals
  set status = 'declined'
  where service_request_id = p_service_request_id
    and status = 'pending';


  update public.service_requests
  set
    status = 'cancelled',
    last_activity_at = clock_timestamp()
  where id = p_service_request_id;


  return p_service_request_id;

end;
$$;


-- ============================================================================
-- ATOMIC PROPOSAL WITHDRAWAL
-- ============================================================================

create or replace function public.withdraw_service_proposal(
  p_proposal_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_id uuid;
  v_status public.service_proposal_status;
begin

  v_actor_id := auth.uid();

  if v_actor_id is null then
    raise exception 'Authentication required.'
      using errcode = '42501';
  end if;


  select proposal.status
  into v_status
  from public.service_proposals as proposal
  where proposal.id = p_proposal_id
    and proposal.worker_id = v_actor_id
  for update;


  if not found then
    raise exception 'Proposal not found or access denied.'
      using errcode = 'P0002';
  end if;


  if v_status <> 'pending' then
    raise exception 'Only pending proposals can be withdrawn.'
      using errcode = 'P0001';
  end if;


  update public.service_proposals
  set status = 'withdrawn'
  where id = p_proposal_id;


  return p_proposal_id;

end;
$$;


-- ============================================================================
-- ATOMIC PROPOSAL ACCEPTANCE
--
-- Lock order:
--   1. discover request id
--   2. lock service request
--   3. lock target proposal
--
-- This prevents two simultaneous proposal acceptances from succeeding.
-- ============================================================================

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
    raise exception 'Only the customer who created this request can accept a proposal.'
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
    raise exception 'Proposal does not belong to this service request.'
      using errcode = 'P0002';
  end if;


  if v_proposal_status <> 'pending' then
    raise exception 'Only pending proposals can be accepted.'
      using errcode = 'P0001';
  end if;


  update public.service_proposals
  set status =
    case
      when id = p_proposal_id
        then 'accepted'::public.service_proposal_status
      when status = 'pending'
        then 'declined'::public.service_proposal_status
      else status
    end
  where service_request_id = v_request_id
    and (
      id = p_proposal_id
      or status = 'pending'
    );


  update public.service_requests
  set
    status = 'assigned',
    accepted_proposal_id = p_proposal_id,
    last_activity_at = clock_timestamp()
  where id = v_request_id;


  return query
  select
    v_request_id,
    p_proposal_id;

end;
$$;


-- ============================================================================
-- RPC PRIVILEGES
-- ============================================================================

revoke all
on function public.cancel_service_request(uuid)
from public;

revoke all
on function public.withdraw_service_proposal(uuid)
from public;

revoke all
on function public.accept_service_proposal(uuid)
from public;


grant execute
on function public.cancel_service_request(uuid)
to authenticated;

grant execute
on function public.withdraw_service_proposal(uuid)
to authenticated;

grant execute
on function public.accept_service_proposal(uuid)
to authenticated;