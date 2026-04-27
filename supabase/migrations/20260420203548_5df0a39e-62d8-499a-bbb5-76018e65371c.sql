-- Audit log para ações administrativas
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_audit_log_user_id ON public.admin_audit_log(user_id);
CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Apenas admins veem o log
CREATE POLICY "Admins can view audit log"
ON public.admin_audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Qualquer admin autenticado pode inserir entradas, mas só com seu próprio user_id
CREATE POLICY "Admins can insert audit log entries"
ON public.admin_audit_log
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  AND auth.uid() = user_id
);

-- Ninguém pode editar/apagar (imutável)