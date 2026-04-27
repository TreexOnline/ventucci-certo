drop policy if exists "Anyone can record a page view" on public.page_views;
create policy "Visitors can record valid page views"
on public.page_views
for insert
to public
with check (
  char_length(visitor_id) between 8 and 100
  and char_length(path) between 1 and 200
  and path like '/%'
  and (referrer is null or char_length(referrer) <= 500)
  and (user_agent is null or char_length(user_agent) <= 500)
);

drop policy if exists "Anyone can record a product click" on public.product_clicks;
create policy "Visitors can record valid product clicks"
on public.product_clicks
for insert
to public
with check (
  char_length(product_name) between 1 and 200
  and (visitor_id is null or char_length(visitor_id) between 8 and 100)
);