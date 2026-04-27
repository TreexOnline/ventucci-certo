ALTER TABLE public.products
ADD COLUMN price_retail numeric NULL;

COMMENT ON COLUMN public.products.price IS 'Preço principal — para revendedores (atacado)';
COMMENT ON COLUMN public.products.price_retail IS 'Preço opcional para venda avulsa (varejo)';