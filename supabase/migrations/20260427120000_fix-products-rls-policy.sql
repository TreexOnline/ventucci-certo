-- Corrigir política RLS para permitir que usuários anônimos vejam produtos ativos
-- A política anterior estava usando has_role() que não funciona para usuários não autenticados

DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = TRUE);

-- Manter políticas de admin para usuários autenticados
CREATE POLICY "Admins can view all products"
  ON public.products FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
