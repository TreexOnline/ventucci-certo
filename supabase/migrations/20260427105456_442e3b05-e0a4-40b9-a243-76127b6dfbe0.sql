DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'site_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.site_settings;
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);