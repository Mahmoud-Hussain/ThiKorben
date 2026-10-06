-- ThiKorben in-app notifications for shared customer/worker workflows.

create table public.app_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references auth.users(id)
    on delete cascade,
  notification_type text not null
    check (
      notification_type in (
        'proposal_received',
        'proposal_accepted',
        'material_requested',
        'material_resolved',
        'job_status'
      )
    ),
  title text not null
    check (char_length(btrim(title)) between 2 and 160),
  body text not null
    check (char_length(btrim(body)) between 2 and 500),
  service_request_id uuid
    references public.service_requests(id)
    on delete cascade,
  material_request_id uuid
    references public.job_material_requests(id)
    on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index app_notifications_user_created_idx
on public.app_notifications (user_id, created_at desc);

alter table public.app_notifications enable row level security;

create policy "users can read their notifications"
on public.app_notifications
for select
to authenticated
using (user_id = auth.uid());

create policy "users can mark their notifications read"
on public.app_notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

revoke all on table public.app_notifications from anon, authenticated;
grant select, update (read_at) on table public.app_notifications to authenticated;

create or replace function public.notify_service_proposal_created()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_customer_id uuid;
  v_title text;
begin
  select customer_id, title
  into v_customer_id, v_title
  from public.service_requests
  where id = new.service_request_id;

  if v_customer_id is not null then
    insert into public.app_notifications (
      user_id,
      notification_type,
      title,
      body,
      service_request_id
    )
    values (
      v_customer_id,
      'proposal_received',
      'New worker proposal',
      'A worker sent a proposal for "' || coalesce(v_title, 'your service request') || '".',
      new.service_request_id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists notify_service_proposal_created
on public.service_proposals;

create trigger notify_service_proposal_created
after insert
on public.service_proposals
for each row
execute function public.notify_service_proposal_created();

create or replace function public.notify_service_proposal_accepted()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_title text;
begin
  if old.status is distinct from new.status
    and new.status = 'accepted'
  then
    select title
    into v_title
    from public.service_requests
    where id = new.service_request_id;

    insert into public.app_notifications (
      user_id,
      notification_type,
      title,
      body,
      service_request_id
    )
    values (
      new.worker_id,
      'proposal_accepted',
      'Your proposal was accepted',
      'The customer selected you for "' || coalesce(v_title, 'a service request') || '".',
      new.service_request_id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists notify_service_proposal_accepted
on public.service_proposals;

create trigger notify_service_proposal_accepted
after update of status
on public.service_proposals
for each row
execute function public.notify_service_proposal_accepted();

create or replace function public.notify_material_requested()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_customer_id uuid;
  v_job_title text;
  v_product_name text;
begin
  select customer_id, title
  into v_customer_id, v_job_title
  from public.service_requests
  where id = new.service_request_id;

  select name
  into v_product_name
  from public.service_products
  where id = new.product_id;

  if v_customer_id is not null then
    insert into public.app_notifications (
      user_id,
      notification_type,
      title,
      body,
      service_request_id,
      material_request_id
    )
    values (
      v_customer_id,
      'material_requested',
      'Material approval needed',
      'The assigned worker requested ' || coalesce(v_product_name, 'a material') ||
        ' for "' || coalesce(v_job_title, 'your job') || '".',
      new.service_request_id,
      new.id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists notify_material_requested
on public.job_material_requests;

create trigger notify_material_requested
after insert
on public.job_material_requests
for each row
execute function public.notify_material_requested();

create or replace function public.notify_material_resolved()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_product_name text;
begin
  if old.status = 'pending'
    and new.status in ('approved', 'rejected')
  then
    select name
    into v_product_name
    from public.service_products
    where id = new.product_id;

    insert into public.app_notifications (
      user_id,
      notification_type,
      title,
      body,
      service_request_id,
      material_request_id
    )
    values (
      new.worker_id,
      'material_resolved',
      case
        when new.status = 'approved'
          then 'Material approved'
        else 'Material rejected'
      end,
      coalesce(v_product_name, 'Material') || ' was ' || new.status || ' by the customer.',
      new.service_request_id,
      new.id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists notify_material_resolved
on public.job_material_requests;

create trigger notify_material_resolved
after update of status
on public.job_material_requests
for each row
execute function public.notify_material_resolved();
