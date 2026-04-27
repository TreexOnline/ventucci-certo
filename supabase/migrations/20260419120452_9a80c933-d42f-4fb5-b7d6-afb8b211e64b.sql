
-- ========== ROLES (separate table to prevent privilege escalation) ==========
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check role without RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ========== TIMESTAMP TRIGGER ==========
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ========== PRODUCTS ==========
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  category TEXT NOT NULL CHECK (char_length(category) BETWEEN 1 AND 80),
  details TEXT NOT NULL CHECK (char_length(details) BETWEEN 1 AND 200),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0 AND price <= 1000000),
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = TRUE OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_products_active_sort ON public.products(is_active, sort_order);

-- ========== PAGE VIEWS (analytics) ==========
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL CHECK (char_length(visitor_id) BETWEEN 1 AND 100),
  path TEXT NOT NULL DEFAULT '/' CHECK (char_length(path) <= 200),
  user_agent TEXT CHECK (user_agent IS NULL OR char_length(user_agent) <= 500),
  referrer TEXT CHECK (referrer IS NULL OR char_length(referrer) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a page view"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view page views"
  ON public.page_views FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_page_views_created ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_visitor ON public.page_views(visitor_id);

-- ========== PRODUCT CLICKS ==========
CREATE TABLE public.product_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL CHECK (char_length(product_name) <= 200),
  visitor_id TEXT CHECK (visitor_id IS NULL OR char_length(visitor_id) <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.product_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a product click"
  ON public.product_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view product clicks"
  ON public.product_clicks FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_product_clicks_created ON public.product_clicks(created_at DESC);
CREATE INDEX idx_product_clicks_product ON public.product_clicks(product_id);

-- ========== STORAGE BUCKET FOR PRODUCT IMAGES ==========
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND public.has_role(auth.uid(), 'admin')
  );
