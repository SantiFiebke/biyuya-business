-- Fix: la policy de INSERT en memberships consultaba `businesses`, pero esa
-- lectura queda sujeta a la RLS de businesses (visible solo si ya sos miembro),
-- así que fallaba justo después de crear el negocio.
-- Solución: chequear la propiedad con una función SECURITY DEFINER.

create or replace function public.is_business_owner(biz uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.businesses b
    where b.id = biz and b.owner_id = auth.uid()
  );
$$;

drop policy "members or owner can add memberships" on public.memberships;

create policy "members or owner can add memberships" on public.memberships
  for insert with check (
    public.is_member(business_id) or public.is_business_owner(business_id)
  );

-- El dueño puede leer su negocio aunque todavía no tenga membership.
create policy "owners can read their business" on public.businesses
  for select using (owner_id = auth.uid());