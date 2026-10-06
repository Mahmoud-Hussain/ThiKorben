-- ThiKorben service order confirmation.
-- Payment UI is presentation-only; this table records the customer-confirmed
-- service order and transparent cost snapshot without processing money.

create table public.service_orders (
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
  payment_method text not null
    check (payment_method in ('bkash', 'card', 'cash')),
  payment_status text not null default 'not_processed'
    check (payment_status in ('not_processed')),
  labor_cost numeric(12,2) not null
    check (labor_cost >= 0),
  material_subtotal numeric(12,2) not null
    check (material_subtotal >= 0),
  delivery_fee numeric(12,2) not null
    check (delivery_fee >= 0),
  shop_platform_fee numeric(12,2) not null
    check (shop_platform_fee >= 0),
  service_platform_fee numeric(12,2) not null
    check (service_platform_fee >= 0),
  grand_total numeric(12,2) not null
    check (grand_total >= 0),
  confirmed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index service_orders_customer_idx
on public.service_orders (customer_id, created_at desc);

create index service_orders_worker_idx
on public.service_orders (worker_id, created_at desc);

alter table public.service_orders enable row level security;

create policy "order participants can read service orders"
on public.service_orders
for select
to authenticated
using (
  customer_id = auth.uid()
  or worker_id = auth.uid()
);

revoke all on table public.service_orders from anon, authenticated;
grant select on table public.service_orders to authenticated;

create or replace function public.confirm_service_order(
  p_service_request_id uuid,
  p_payment_method text
)
returns public.service_orders
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid;
  v_request public.service_requests;
  v_proposal public.service_proposals;
  v_existing public.service_orders;
  v_order public.service_orders;
  v_material_subtotal numeric(12,2);
  v_delivery_fee numeric(12,2);
  v_shop_fee numeric(12,2);
  v_service_fee numeric(12,2);
  v_grand_total numeric(12,2);
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if p_payment_method not in ('bkash', 'card', 'cash') then
    raise exception 'Unsupported payment method.';
  end if;

  select *
  into v_existing
  from public.service_orders
  where service_request_id = p_service_request_id;

  if found then
    if v_existing.customer_id <> v_user_id then
      raise exception 'Only the customer can access this order.';
    end if;

    return v_existing;
  end if;

  select *
  into v_request
  from public.service_requests
  where id = p_service_request_id
  for update;

  if not found then
    raise exception 'Service request not found.';
  end if;

  if v_request.customer_id <> v_user_id then
    raise exception 'Only the customer can confirm the service order.';
  end if;

  if v_request.accepted_proposal_id is null then
    raise exception 'Accepted worker proposal required.';
  end if;

  if v_request.status not in ('assigned', 'ordered') then
    raise exception 'Service request is not ready for checkout.';
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

  select coalesce(
    sum(unit_price_snapshot * quantity),
    0
  )
  into v_material_subtotal
  from public.job_material_requests
  where service_request_id = v_request.id
    and status = 'approved';

  v_delivery_fee :=
    case
      when v_material_subtotal = 0 then 0
      when v_material_subtotal >= 1500 then 0
      else 80
    end;

  v_shop_fee :=
    case
      when v_material_subtotal > 0 then 20
      else 0
    end;

  v_service_fee := 35;

  v_grand_total :=
    v_proposal.price_amount
    + v_material_subtotal
    + v_delivery_fee
    + v_shop_fee
    + v_service_fee;

  insert into public.service_orders (
    service_request_id,
    customer_id,
    worker_id,
    payment_method,
    labor_cost,
    material_subtotal,
    delivery_fee,
    shop_platform_fee,
    service_platform_fee,
    grand_total
  )
  values (
    v_request.id,
    v_request.customer_id,
    v_proposal.worker_id,
    p_payment_method,
    v_proposal.price_amount,
    v_material_subtotal,
    v_delivery_fee,
    v_shop_fee,
    v_service_fee,
    v_grand_total
  )
  returning *
  into v_order;

  update public.service_requests
  set last_activity_at = clock_timestamp()
  where id = v_request.id;

  insert into public.app_notifications (
    user_id,
    notification_type,
    title,
    body,
    service_request_id
  )
  values (
    v_proposal.worker_id,
    'job_status',
    'Service order confirmed',
    'The customer confirmed the service order. You can coordinate arrival and start the work.',
    v_request.id
  );

  return v_order;
end;
$$;

revoke all
on function public.confirm_service_order(uuid, text)
from public;

grant execute
on function public.confirm_service_order(uuid, text)
to authenticated;

create or replace function public.notify_job_status_changed()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_worker_id uuid;
  v_customer_title text;
  v_worker_title text;
  v_body text;
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  if new.accepted_proposal_id is not null then
    select worker_id
    into v_worker_id
    from public.service_proposals
    where id = new.accepted_proposal_id;
  end if;

  if new.status = 'ordered' then
    v_customer_title := 'Worker started the job';
    v_worker_title := 'Job marked in progress';
    v_body := 'The assigned worker started work on "' || new.title || '".';
  elsif new.status = 'completed' then
    v_customer_title := 'Job completed';
    v_worker_title := 'Job completed';
    v_body := '"' || new.title || '" was marked completed.';
  else
    return new;
  end if;

  insert into public.app_notifications (
    user_id,
    notification_type,
    title,
    body,
    service_request_id
  )
  values (
    new.customer_id,
    'job_status',
    v_customer_title,
    v_body,
    new.id
  );

  if v_worker_id is not null then
    insert into public.app_notifications (
      user_id,
      notification_type,
      title,
      body,
      service_request_id
    )
    values (
      v_worker_id,
      'job_status',
      v_worker_title,
      v_body,
      new.id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists notify_job_status_changed
on public.service_requests;

create trigger notify_job_status_changed
after update of status
on public.service_requests
for each row
execute function public.notify_job_status_changed();
