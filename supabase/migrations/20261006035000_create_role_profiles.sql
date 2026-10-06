-- ThiKorben production role-specific profile foundation

create type public.worker_verification_status as enum (
  'unverified',
  'pending',
  'verified'
);

create table public.customer_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  home_location text not null
    check (home_location = btrim(home_location) and char_length(home_location) between 2 and 160),
  emergency_contact text
    check (emergency_contact is null or emergency_contact ~ '^\\+8801[3-9][0-9]{8}$'),
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.worker_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  primary_trade text not null
    check (primary_trade in ('plumber','electrician','carpenter','cleaner','painter','ac_technician')),
  experience_years integer not null check (experience_years between 0 and 60),
  preferred_rate_bdt numeric(12, 2) not null check (preferred_rate_bdt > 0 and preferred_rate_bdt <= 10000000),
  service_radius_km integer not null check (service_radius_km between 1 and 50),
  verification_status public.worker_verification_status not null default 'unverified',
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index worker_profiles_trade_status_idx
on public.worker_profiles (primary_trade, verification_status, user_id);

create trigger customer_profiles_set_updated_at
before update on public.customer_profiles
for each row execute function public.auth_core_set_updated_at();

create trigger worker_profiles_set_updated_at
before update on public.worker_profiles
for each row execute function public.auth_core_set_updated_at();

alter table public.customer_profiles enable row level security;
alter table public.worker_profiles enable row level security;

create policy "customers can read their own private profile"
on public.customer_profiles
for select to authenticated
using (user_id = auth.uid());

create policy "authenticated users can read worker service profiles"
on public.worker_profiles
for select to authenticated
using (auth.uid() is not null);

revoke all on table public.customer_profiles from anon, authenticated;
revoke all on table public.worker_profiles from anon, authenticated;

grant select on table public.customer_profiles to authenticated;
grant select on table public.worker_profiles to authenticated;

create or replace function public.save_customer_profile(
  p_display_name text,
  p_home_location text,
  p_emergency_contact text default null
)
returns public.customer_profiles
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid;
  v_customer public.customer_profiles;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  update public.profiles
  set display_name = btrim(p_display_name), active_role = 'customer'
  where id = v_user_id;

  if not found then
    raise exception 'Application profile not found.';
  end if;

  insert into public.customer_profiles (user_id, home_location, emergency_contact)
  values (v_user_id, btrim(p_home_location), nullif(btrim(p_emergency_contact), ''))
  on conflict (user_id) do update
    set home_location = excluded.home_location,
        emergency_contact = excluded.emergency_contact
  returning * into v_customer;

  return v_customer;
end;
$$;

create or replace function public.save_worker_profile(
  p_display_name text,
  p_primary_trade text,
  p_experience_years integer,
  p_preferred_rate_bdt numeric,
  p_service_radius_km integer
)
returns public.worker_profiles
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid;
  v_worker public.worker_profiles;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if not exists (
    select 1 from public.user_roles
    where user_id = v_user_id and role = 'worker'
  ) then
    raise exception 'Worker capability required.';
  end if;

  update public.profiles
  set display_name = btrim(p_display_name), active_role = 'worker'
  where id = v_user_id;

  if not found then
    raise exception 'Application profile not found.';
  end if;

  insert into public.worker_profiles (
    user_id,
    primary_trade,
    experience_years,
    preferred_rate_bdt,
    service_radius_km
  )
  values (
    v_user_id,
    lower(btrim(p_primary_trade)),
    p_experience_years,
    p_preferred_rate_bdt,
    p_service_radius_km
  )
  on conflict (user_id) do update
    set primary_trade = excluded.primary_trade,
        experience_years = excluded.experience_years,
        preferred_rate_bdt = excluded.preferred_rate_bdt,
        service_radius_km = excluded.service_radius_km
  returning * into v_worker;

  return v_worker;
end;
$$;

revoke all on function public.save_customer_profile(text, text, text) from public;
revoke all on function public.save_worker_profile(text, text, integer, numeric, integer) from public;

grant execute on function public.save_customer_profile(text, text, text) to authenticated;
grant execute on function public.save_worker_profile(text, text, integer, numeric, integer) to authenticated;
