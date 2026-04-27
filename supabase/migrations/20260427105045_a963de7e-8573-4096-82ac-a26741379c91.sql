CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site settings are publicly readable" ON public.site_settings;
CREATE POLICY "Site settings are publicly readable"
ON public.site_settings
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can create site settings" ON public.site_settings;
CREATE POLICY "Admins can create site settings"
ON public.site_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete site settings" ON public.site_settings;
CREATE POLICY "Admins can delete site settings"
ON public.site_settings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (key, value)
VALUES ('catalog_pricing', '{"prices_visible": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;