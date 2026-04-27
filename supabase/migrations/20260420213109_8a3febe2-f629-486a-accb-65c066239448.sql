-- Enable Realtime for products table so site updates instantly when admin changes
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;