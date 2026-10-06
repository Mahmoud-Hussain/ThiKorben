-- ThiKorben job material approval foundation.
-- Products are catalog records; workers request, customers decide.

create type public.material_request_status as enum (
  'pending',
  'approved',
  'rejected'
);

create table public.service_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  name text not null
    check (char_length(btrim(name)) between 2 and 160),
  category text not null
    check (category ~ '^[a-z0-9][a-z0-9_-]{1,49}$'),
  description text not null
    check (char_length(btrim(description)) between 5 and 1000),
  unit_price numeric(12,2) not null
    check (unit_price > 0 and unit_price <= 10000000),
  currency text not null default 'BDT'
    check (currency ~ '^[A-Z]{3}$'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.job_material_requests (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null
    references public.service_requests(id)
    on delete cascade,
  worker_id uuid not null
    references auth.users(id)
    on delete cascade,
  product_id uuid not null
    references public.service_products(id),
  quantity integer not null
    check (quantity between 1 and 99),
  reason text not null
    check (char_length(btrim(reason)) between 5 and 1000),
  unit_price_snapshot numeric(12,2) not null
    check (unit_price_snapshot > 0 and unit_price_snapshot <= 10000000),
  currency text not null
    check (currency ~ '^[A-Z]{3}$'),
  status public.material_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create unique index job_material_requests_one_pending_product_idx
on public.job_material_requests (
  service_request_id,
  worker_id,
  product_id
)
where status = 'pending';

create index job_material_requests_job_idx
on public.job_material_requests (service_request_id, created_at desc);

create trigger service_products_set_updated_at
before update on public.service_products
for each row
execute function public.auth_core_set_updated_at();

alter table public.service_products enable row level security;
alter table public.job_material_requests enable row level security;

create policy "authenticated users can read active products"
on public.service_products
for select
to authenticated
using (active = true);

create policy "job participants can read material requests"
on public.job_material_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.service_requests as request
    join public.service_proposals as proposal
      on proposal.id = request.accepted_proposal_id
    where request.id = job_material_requests.service_request_id
      and proposal.status = 'accepted'
      and (
        request.customer_id = auth.uid()
        or proposal.worker_id = auth.uid()
      )
  )
);

create or replace function public.request_job_material(
  p_service_request_id uuid,
  p_product_id uuid,
  p_quantity integer,
  p_reason text
)
returns public.job_material_requests
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid;
  v_request public.service_requests;
  v_proposal public.service_proposals;
  v_product public.service_products;
  v_material public.job_material_requests;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  select *
  into v_request
  from public.service_requests
  where id = p_service_request_id;

  if not found or v_request.accepted_proposal_id is null then
    raise exception 'Assigned service request required.';
  end if;

  select *
  into v_proposal
  from public.service_proposals
  where id = v_request.accepted_proposal_id
    and status = 'accepted';

  if not found or v_proposal.worker_id <> v_user_id then
    raise exception 'Only the assigned worker can request materials.';
  end if;

  select *
  into v_product
  from public.service_products
  where id = p_product_id
    and active = true;

  if not found then
    raise exception 'Catalog product is unavailable.';
  end if;

  insert into public.job_material_requests (
    service_request_id,
    worker_id,
    product_id,
    quantity,
    reason,
    unit_price_snapshot,
    currency
  )
  values (
    p_service_request_id,
    v_user_id,
    v_product.id,
    p_quantity,
    btrim(p_reason),
    v_product.unit_price,
    v_product.currency
  )
  returning *
  into v_material;

  return v_material;
end;
$$;

create or replace function public.resolve_job_material(
  p_material_request_id uuid,
  p_status public.material_request_status
)
returns public.job_material_requests
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid;
  v_material public.job_material_requests;
  v_customer_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if p_status not in ('approved', 'rejected') then
    raise exception 'Material decision must be approved or rejected.';
  end if;

  select *
  into v_material
  from public.job_material_requests
  where id = p_material_request_id;

  if not found then
    raise exception 'Material request not found.';
  end if;

  select customer_id
  into v_customer_id
  from public.service_requests
  where id = v_material.service_request_id;

  if not found then
    raise exception 'Service request not found.';
  end if;

  if v_customer_id <> v_user_id then
    raise exception 'Only the customer can approve or reject materials.';
  end if;

  if v_material.status <> 'pending' then
    raise exception 'Material request is already resolved.';
  end if;

  update public.job_material_requests
  set
    status = p_status,
    resolved_at = clock_timestamp()
  where id = p_material_request_id
  returning *
  into v_material;

  return v_material;
end;
$$;

revoke all on table public.service_products from anon, authenticated;
revoke all on table public.job_material_requests from anon, authenticated;

grant select on table public.service_products to authenticated;
grant select on table public.job_material_requests to authenticated;

revoke all
on function public.request_job_material(uuid, uuid, integer, text)
from public;

revoke all
on function public.resolve_job_material(uuid, public.material_request_status)
from public;

grant execute
on function public.request_job_material(uuid, uuid, integer, text)
to authenticated;

grant execute
on function public.resolve_job_material(uuid, public.material_request_status)
to authenticated;

insert into public.service_products (
  slug,
  name,
  category,
  description,
  unit_price,
  currency
)
values
  (
    'pvc-connector-half',
    'PVC Connector 1/2 Inch',
    'plumbing',
    'Durable half-inch PVC connector for household water-line and sink repair.',
    120,
    'BDT'
  ),
  (
    'teflon-tape',
    'Professional Teflon Tape',
    'plumbing',
    'Thread sealing tape for household plumbing connections and leak prevention.',
    45,
    'BDT'
  ),
  (
    'rubber-washer-set',
    'Rubber Washer Repair Set',
    'plumbing',
    'Multi-size rubber washer set for taps, faucets, and common plumbing repairs.',
    80,
    'BDT'
  ),
  (
    'pvc-pipe-half',
    'PVC Water Pipe 1/2 Inch - 3ft',
    'plumbing',
    'Three-foot household PVC water pipe for repair and replacement work.',
    180,
    'BDT'
  ),
  (
    'brass-angle-valve',
    'Premium Brass Angle Valve',
    'plumbing',
    'Heavy-duty brass water control valve for sinks and household plumbing systems.',
    650,
    'BDT'
  ),
  (
    'basin-faucet',
    'Stainless Steel Basin Faucet',
    'plumbing',
    'Stainless-steel basin faucet with corrosion-resistant finish for household use.',
    1450,
    'BDT'
  ),
  (
    'electrical-wire',
    'Copper Electrical Wire 2.5mm',
    'electrical',
    'Insulated copper electrical wire for residential repair and installation.',
    950,
    'BDT'
  ),
  (
    'modular-switch',
    '16A Premium Modular Switch',
    'electrical',
    'Residential 16A modular wall switch for repair and replacement.',
    220,
    'BDT'
  ),
  (
    'adjustable-wrench',
    'Professional Adjustable Wrench',
    'tools',
    'Heavy-duty adjustable wrench for plumbing and household maintenance work.',
    780,
    'BDT'
  ),
  (
    'cleaning-kit',
    'Home Repair Cleaning Kit',
    'cleaning',
    'Compact cleaning kit for use after plumbing, electrical, and repair work.',
    390,
    'BDT'
  );
