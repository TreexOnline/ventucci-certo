
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS product_group text NOT NULL DEFAULT 'Bebidas';

UPDATE public.products SET product_group = 'Bebidas' WHERE product_group IS NULL OR product_group = '';

CREATE INDEX IF NOT EXISTS idx_products_group ON public.products (product_group);
