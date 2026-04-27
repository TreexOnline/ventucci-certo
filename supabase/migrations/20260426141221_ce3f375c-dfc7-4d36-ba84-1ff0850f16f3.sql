alter default privileges revoke execute on functions from public;

revoke usage on schema graphql from anon, authenticated;
revoke all on all tables in schema graphql from anon, authenticated;
revoke all on all functions in schema graphql from anon, authenticated;

create or replace function public.validate_product_payload()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.name := btrim(new.name);
  new.category := btrim(new.category);
  new.details := btrim(new.details);
  new.product_group := btrim(new.product_group);

  if char_length(new.name) < 1 or char_length(new.name) > 200 then
    raise exception 'Nome do produto inválido';
  end if;

  if char_length(new.category) < 1 or char_length(new.category) > 80 then
    raise exception 'Categoria inválida';
  end if;

  if char_length(new.details) < 1 or char_length(new.details) > 200 then
    raise exception 'Descrição inválida';
  end if;

  if new.product_group not in ('Bebidas', 'Mercearia', 'Limpeza') then
    raise exception 'Grupo inválido';
  end if;

  if new.price < 0 or new.price > 1000000 then
    raise exception 'Preço inválido';
  end if;

  if new.price_retail is not null and (new.price_retail < 0 or new.price_retail > 1000000) then
    raise exception 'Preço avulso inválido';
  end if;

  if new.sort_order < 0 or new.sort_order > 100000 then
    raise exception 'Ordem inválida';
  end if;

  if new.image_url is not null and char_length(new.image_url) > 1000 then
    raise exception 'URL da imagem inválida';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_product_payload_trigger on public.products;
create trigger validate_product_payload_trigger
before insert or update on public.products
for each row execute function public.validate_product_payload();

drop trigger if exists update_products_updated_at on public.products;
create trigger update_products_updated_at
before update on public.products
for each row execute function public.update_updated_at_column();

alter table public.page_views
  alter column visitor_id set not null,
  alter column path set default '/';

alter table public.page_views
  drop constraint if exists page_views_visitor_id_length,
  add constraint page_views_visitor_id_length check (char_length(visitor_id) between 8 and 100),
  drop constraint if exists page_views_path_length,
  add constraint page_views_path_length check (char_length(path) between 1 and 200),
  drop constraint if exists page_views_referrer_length,
  add constraint page_views_referrer_length check (referrer is null or char_length(referrer) <= 500),
  drop constraint if exists page_views_user_agent_length,
  add constraint page_views_user_agent_length check (user_agent is null or char_length(user_agent) <= 500);

alter table public.product_clicks
  drop constraint if exists product_clicks_visitor_id_length,
  add constraint product_clicks_visitor_id_length check (visitor_id is null or char_length(visitor_id) between 8 and 100),
  drop constraint if exists product_clicks_product_name_length,
  add constraint product_clicks_product_name_length check (char_length(product_name) between 1 and 200);

create unique index if not exists page_views_visitor_day_unique
on public.page_views (visitor_id, view_date);

create index if not exists idx_products_active_sort
on public.products (is_active, sort_order);

create index if not exists idx_product_clicks_created_at
on public.product_clicks (created_at desc);

create index if not exists idx_page_views_created_at
on public.page_views (created_at desc);

drop policy if exists "Public read product images" on storage.objects;
create policy "Public can read product images by known path"
on storage.objects
for select
using (bucket_id = 'product-images' and name <> '');