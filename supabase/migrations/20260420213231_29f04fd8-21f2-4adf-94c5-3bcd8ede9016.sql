ALTER TABLE public.page_views REPLICA IDENTITY FULL;
ALTER TABLE public.product_clicks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.page_views;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_clicks;