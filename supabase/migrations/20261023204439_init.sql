-- biyuya-business — MVP schema + RLS (multi-tenant por memberships)
-- Convención: skill supabase-rls-migrations.
-- Toda tabla nueva: RLS habilitado + policies basadas en memberships vía función security definer.

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------
create table public.businesses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  owner_id    uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table public.memberships (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        text not null check (role in ('owner', 'employee')),
  created_at  timestamptz not null default now(),
  unique (business_id, user_id)
);

create table public.products (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  sku         text not null,
  name        text not null,
  cost_price  numeric(12,2) not null default 0 check (cost_price >= 0),
  sale_price  numeric(12,2) not null default 0 check (sale_price >= 0),
  stock       integer not null default 0,
  created_at  timestamptz not null default now(),
  unique (business_id, sku)
);

create table public.sales (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id     uuid not null references auth.users (id),
  total       numeric(12,2) not null default 0 check (total >= 0),
  created_at  timestamptz not null default now()
);

create table public.sale_items (
  id          uuid primary key default gen_random_uuid(),
  sale_id     uuid not null references public.sales (id) on delete cascade,
  product_id  uuid not null references public.products (id),
  qty         integer not null check (qty > 0),
  unit_price  numeric(12,2) not null check (unit_price >= 0)
);

create table public.stock_movements (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  qty_delta   integer not null,
  reason      text not null,
  sale_id     uuid references public.sales (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Índices (FKs y consultas frecuentes)
-- ---------------------------------------------------------------------------
create index on public.memberships (user_id);
create index on public.memberships (business_id);
create index on public.products (business_id);
create index on public.sales (business_id);
create index on public.sales (created_at);
create index on public.sale_items (sale_id);
create index on public.stock_movements (product_id);

-- ---------------------------------------------------------------------------
-- Helper: ¿el usuario actual pertenece al negocio?
-- SECURITY DEFINER para evitar recursión de RLS al consultar memberships.
-- (Definida DESPUÉS de las tablas: Postgres valida el cuerpo al crear la función.)
-- ---------------------------------------------------------------------------
create or replace function public.is_member(biz uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.business_id = biz
      and m.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.businesses      enable row level security;
alter table public.memberships     enable row level security;
alter table public.products        enable row level security;
alter table public.sales           enable row level security;
alter table public.sale_items      enable row level security;
alter table public.stock_movements enable row level security;

-- businesses -----------------------------------------------------------------
create policy "members can read businesses" on public.businesses
  for select using (public.is_member(id));

create policy "users can create their business" on public.businesses
  for insert with check (owner_id = auth.uid());

create policy "members can update businesses" on public.businesses
  for update using (public.is_member(id)) with check (public.is_member(id));

create policy "owner can delete business" on public.businesses
  for delete using (owner_id = auth.uid());

-- memberships ----------------------------------------------------------------
create policy "users can read their memberships" on public.memberships
  for select using (user_id = auth.uid() or public.is_member(business_id));

create policy "members or owner can add memberships" on public.memberships
  for insert with check (
    public.is_member(business_id)
    or exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );

create policy "members can update memberships" on public.memberships
  for update using (public.is_member(business_id))
  with check (public.is_member(business_id));

create policy "members can delete memberships" on public.memberships
  for delete using (public.is_member(business_id));

-- products -------------------------------------------------------------------
create policy "members manage products" on public.products
  for all using (public.is_member(business_id))
  with check (public.is_member(business_id));

-- sales ----------------------------------------------------------------------
create policy "members manage sales" on public.sales
  for all using (public.is_member(business_id))
  with check (public.is_member(business_id));

-- sale_items (via la venta) --------------------------------------------------
create policy "members manage sale items" on public.sale_items
  for all using (
    exists (
      select 1 from public.sales s
      where s.id = sale_id and public.is_member(s.business_id)
    )
  )
  with check (
    exists (
      select 1 from public.sales s
      where s.id = sale_id and public.is_member(s.business_id)
    )
  );

-- stock_movements (via el producto) ------------------------------------------
create policy "members manage stock movements" on public.stock_movements
  for all using (
    exists (
      select 1 from public.products p
      where p.id = product_id and public.is_member(p.business_id)
    )
  )
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_id and public.is_member(p.business_id)
    )
  );