-- RPC atómica para registrar una venta: sale + sale_items + stock_movements
-- + descuento de stock, todo en una transacción. SECURITY INVOKER para que
-- la RLS del usuario aplique en cada INSERT/UPDATE.
create or replace function public.create_sale(p_items jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_business_id uuid;
  v_sale_id     uuid;
  v_total       numeric(12,2) := 0;
  v_item        jsonb;
  v_product_id  uuid;
  v_qty         integer;
  v_price       numeric(12,2);
begin
  select business_id into v_business_id
  from public.memberships
  where user_id = auth.uid()
  limit 1;

  if v_business_id is null then
    raise exception 'no pertenecés a ningún negocio';
  end if;

  insert into public.sales (business_id, user_id, total)
  values (v_business_id, auth.uid(), 0)
  returning id into v_sale_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty        := (v_item->>'qty')::integer;
    v_price      := (v_item->>'unit_price')::numeric(12,2);

    if v_qty is null or v_qty <= 0 then
      raise exception 'cantidad inválida';
    end if;

    insert into public.sale_items (sale_id, product_id, qty, unit_price)
    values (v_sale_id, v_product_id, v_qty, v_price);

    insert into public.stock_movements (product_id, qty_delta, reason, sale_id)
    values (v_product_id, -v_qty, 'sale', v_sale_id);

    -- descuenta solo si hay stock suficiente; si no, no actualiza la fila
    update public.products
    set stock = stock - v_qty
    where id = v_product_id and business_id = v_business_id and stock >= v_qty;

    if not found then
      raise exception 'stock insuficiente o producto inexistente';
    end if;

    v_total := v_total + (v_qty * v_price);
  end loop;

  update public.sales set total = v_total where id = v_sale_id;

  return v_sale_id;
end;
$$;
