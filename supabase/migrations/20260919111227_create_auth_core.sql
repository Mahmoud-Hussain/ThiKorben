-- ============================================================================
-- ThiKorben Auth Core
--
-- Purpose:
--   - Shared public profile for every Supabase Auth user
--   - Multi-role capability model: customer + worker
--   - Safe active-role switching
--   - Automatic provisioning for new auth.users
--   - Backfill existing auth users
--   - RLS + column-level privileges
--   - Worker-role enforcement for Community proposals
--
-- Important:
--   "worker" is an application capability, not a verification badge.
--   Worker identity verification should remain a separate future concern.
-- ============================================================================


-- ============================================================================
-- APPLICATION ROLE
-- ============================================================================

create type public.app_role as enum (
  'customer',
  'worker'
);


-- ============================================================================
-- PUBLIC PROFILE
--
-- This table intentionally contains only non-sensitive identity information
-- that authenticated users may need to render inside the app.
--
-- Phone/email remain owned by Supabase Auth and are not exposed here.
-- ============================================================================

create table public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  display_name text not null
    default 'ThiKorben User'
    check (
      display_name = btrim(display_name)
      and char_length(display_name) between 2 and 100
    ),

  avatar_path text
    check (
      avatar_path is null
      or (
        avatar_path = btrim(avatar_path)
        and char_length(avatar_path) between 1 and 512
      )
    ),

  active_role public.app_role not null
    default 'customer',

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now()
);


-- ============================================================================
-- USER ROLE MEMBERSHIP
--
-- A user may hold multiple product roles.
--
-- Example:
--   user A -> customer
--   user B -> customer + worker
--
-- This is intentionally different from profiles.active_role.
--
-- user_roles = what the user is allowed to act as
-- active_role = which mode the UI is currently using
-- ============================================================================

create table public.user_roles (
  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  role public.app_role not null,

  created_at timestamptz not null
    default now(),

  primary key (
    user_id,
    role
  )
);


create index user_roles_role_user_idx
on public.user_roles (
  role,
  user_id
);


-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

create or replace function public.auth_core_set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin

  new.updated_at := clock_timestamp();

  return new;

end;
$$;


create trigger profiles_set_updated_at
before update
on public.profiles
for each row
execute function public.auth_core_set_updated_at();


-- Trigger functions do not need to remain client-callable.

revoke all
on function public.auth_core_set_updated_at()
from public;


-- ============================================================================
-- AUTH USER PROVISIONING
--
-- Every new auth.users row automatically receives:
--
--   public.profiles row
--   customer capability
--
-- We DO NOT trust client metadata to assign privileged application roles.
-- Worker capability is enabled through a controlled RPC later.
-- ============================================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_display_name text;
begin

  v_display_name :=
    btrim(
      coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        ''
      )
    );


  if
    v_display_name is null
    or char_length(v_display_name) < 2
  then

    v_display_name := 'ThiKorben User';

  else

    v_display_name := left(
      v_display_name,
      100
    );

  end if;


  insert into public.profiles (
    id,
    display_name,
    active_role
  )
  values (
    new.id,
    v_display_name,
    'customer'::public.app_role
  )
  on conflict (id)
  do nothing;


  insert into public.user_roles (
    user_id,
    role
  )
  values (
    new.id,
    'customer'::public.app_role
  )
  on conflict (
    user_id,
    role
  )
  do nothing;


  return new;

end;
$$;


revoke all
on function public.handle_new_auth_user()
from public;


drop trigger if exists
  thikorben_auth_user_created
on auth.users;


create trigger thikorben_auth_user_created
after insert
on auth.users
for each row
execute function public.handle_new_auth_user();


-- ============================================================================
-- BACKFILL EXISTING AUTH USERS
--
-- The project may already contain test/development auth users.
-- Provision them safely without requiring account recreation.
-- ============================================================================

insert into public.profiles (
  id,
  display_name,
  active_role
)
select
  auth_user.id,

  case
    when char_length(
      btrim(
        coalesce(
          auth_user.raw_user_meta_data ->> 'full_name',
          auth_user.raw_user_meta_data ->> 'name',
          ''
        )
      )
    ) >= 2
      then left(
        btrim(
          coalesce(
            auth_user.raw_user_meta_data ->> 'full_name',
            auth_user.raw_user_meta_data ->> 'name',
            ''
          )
        ),
        100
      )

    else 'ThiKorben User'
  end,

  'customer'::public.app_role

from auth.users as auth_user

on conflict (id)
do nothing;


insert into public.user_roles (
  user_id,
  role
)
select
  auth_user.id,
  'customer'::public.app_role

from auth.users as auth_user

on conflict (
  user_id,
  role
)
do nothing;


-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles
  enable row level security;

alter table public.user_roles
  enable row level security;


-- ============================================================================
-- PROFILE POLICIES
--
-- Public profile data is visible only to authenticated app users.
-- Sensitive Auth data such as phone/email is NOT stored here.
-- ============================================================================

create policy "authenticated users can read profiles"
on public.profiles
for select
to authenticated
using (
  auth.uid() is not null
);


create policy "users can update their own public profile"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
)
with check (
  id = auth.uid()
);


-- ============================================================================
-- ROLE POLICIES
--
-- Users may inspect only their own capability memberships.
--
-- Direct role insertion/deletion is intentionally not granted.
-- ============================================================================

create policy "users can read their own roles"
on public.user_roles
for select
to authenticated
using (
  user_id = auth.uid()
);


-- ============================================================================
-- TABLE PRIVILEGES
--
-- profiles.active_role is protected.
-- It can only be changed by set_active_role().
--
-- user_roles is read-only from the client.
-- Role changes happen through controlled RPCs.
-- ============================================================================

revoke all
on table public.profiles
from anon, authenticated;


revoke all
on table public.user_roles
from anon, authenticated;


grant select
on table public.profiles
to authenticated;


grant update (
  display_name,
  avatar_path
)
on public.profiles
to authenticated;


grant select
on table public.user_roles
to authenticated;


grant usage
on type public.app_role
to authenticated;


-- ============================================================================
-- ROLE AUTHORIZATION HELPER
--
-- Used by RLS policies and future feature authorization.
--
-- It always checks the CURRENT authenticated user.
-- Callers cannot supply another user's UUID.
-- ============================================================================

create or replace function public.has_app_role(
  p_role public.app_role
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select
    auth.uid() is not null
    and exists (
      select 1
      from public.user_roles as user_role
      where user_role.user_id = auth.uid()
        and user_role.role = p_role
    );
$$;


revoke all
on function public.has_app_role(public.app_role)
from public;


grant execute
on function public.has_app_role(public.app_role)
to authenticated;


-- ============================================================================
-- WORKER REGISTRATION
--
-- Worker registration is intentionally explicit.
--
-- This grants the product capability "worker".
-- It DOES NOT mean the worker has completed future identity/trade verification.
--
-- Idempotent:
-- calling it more than once remains safe.
-- ============================================================================

create or replace function public.register_worker_role()
returns public.app_role
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_user_id uuid;
begin

  v_user_id := auth.uid();


  if v_user_id is null then
    raise exception 'Authentication required.'
      using errcode = '42501';
  end if;


  perform 1
  from public.profiles as profile
  where profile.id = v_user_id;


  if not found then
    raise exception 'User profile not found.'
      using errcode = 'P0002';
  end if;


  insert into public.user_roles (
    user_id,
    role
  )
  values (
    v_user_id,
    'worker'::public.app_role
  )
  on conflict (
    user_id,
    role
  )
  do nothing;


  update public.profiles as profile
  set active_role = 'worker'::public.app_role
  where profile.id = v_user_id;


  return 'worker'::public.app_role;

end;
$$;


revoke all
on function public.register_worker_role()
from public;


grant execute
on function public.register_worker_role()
to authenticated;


-- ============================================================================
-- ACTIVE ROLE SWITCHING
--
-- A user may switch only to a role they actually own.
--
-- Example:
--
-- customer-only account:
--   customer -> allowed
--   worker   -> rejected
--
-- customer + worker account:
--   either mode -> allowed
-- ============================================================================

create or replace function public.set_active_role(
  p_role public.app_role
)
returns public.app_role
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_user_id uuid;
begin

  v_user_id := auth.uid();


  if v_user_id is null then
    raise exception 'Authentication required.'
      using errcode = '42501';
  end if;


  if not exists (
    select 1
    from public.user_roles as user_role
    where user_role.user_id = v_user_id
      and user_role.role = p_role
  ) then

    raise exception 'Requested role is not available for this user.'
      using errcode = '42501';

  end if;


  update public.profiles as profile
  set active_role = p_role
  where profile.id = v_user_id;


  if not found then
    raise exception 'User profile not found.'
      using errcode = 'P0002';
  end if;


  return p_role;

end;
$$;


revoke all
on function public.set_active_role(public.app_role)
from public;


grant execute
on function public.set_active_role(public.app_role)
to authenticated;


-- ============================================================================
-- COMMUNITY ROLE ENFORCEMENT
--
-- Community already performs identity / ownership checks.
--
-- Auth Core now adds capability authorization:
--
-- customer -> create/manage service requests and their media
-- worker   -> create/manage proposals
--
-- Comments/reactions remain available to authenticated users.
-- ============================================================================


-- SERVICE REQUEST CREATION

drop policy if exists
  "users can create their own service requests"
on public.service_requests;


create policy "customers can create their own service requests"
on public.service_requests
for insert
to authenticated
with check (
  public.has_app_role(
    'customer'::public.app_role
  )
  and customer_id = auth.uid()
);


-- SERVICE REQUEST EDITING

drop policy if exists
  "customers can edit their open service requests"
on public.service_requests;


create policy "customers can edit their open service requests"
on public.service_requests
for update
to authenticated
using (
  public.has_app_role(
    'customer'::public.app_role
  )
  and customer_id = auth.uid()
  and status = 'open'
)
with check (
  public.has_app_role(
    'customer'::public.app_role
  )
  and customer_id = auth.uid()
  and status = 'open'
);


-- PROPOSAL CREATION

drop policy if exists
  "users can submit proposals as themselves"
on public.service_proposals;


create policy "workers can submit proposals as themselves"
on public.service_proposals
for insert
to authenticated
with check (
  public.has_app_role(
    'worker'::public.app_role
  )
  and worker_id = auth.uid()
  and exists (
    select 1
    from public.service_requests as request
    where request.id = service_proposals.service_request_id
      and request.status = 'open'
      and request.customer_id <> auth.uid()
  )
);


-- PROPOSAL EDITING

drop policy if exists
  "workers can edit their pending proposals"
on public.service_proposals;


create policy "workers can edit their pending proposals"
on public.service_proposals
for update
to authenticated
using (
  public.has_app_role(
    'worker'::public.app_role
  )
  and worker_id = auth.uid()
  and status = 'pending'
)
with check (
  public.has_app_role(
    'worker'::public.app_role
  )
  and worker_id = auth.uid()
  and status = 'pending'
);


-- CAPTURED COMMUNITY MEDIA INSERT

drop policy if exists
  "customers can attach captured media to own requests"
on public.service_request_media;


create policy "customers can attach captured media to own requests"
on public.service_request_media
for insert
to authenticated
with check (
  public.has_app_role(
    'customer'::public.app_role
  )
  and uploaded_by = auth.uid()
  and exists (
    select 1
    from public.service_requests as request
    where request.id = service_request_media.service_request_id
      and request.customer_id = auth.uid()
      and request.status = 'open'
  )
);


-- COMMUNITY MEDIA DELETE

drop policy if exists
  "customers can delete own request media"
on public.service_request_media;


create policy "customers can delete own request media"
on public.service_request_media
for delete
to authenticated
using (
  public.has_app_role(
    'customer'::public.app_role
  )
  and uploaded_by = auth.uid()
  and exists (
    select 1
    from public.service_requests as request
    where request.id = service_request_media.service_request_id
      and request.customer_id = auth.uid()
  )
);