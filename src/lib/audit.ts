import { supabase } from "@/integrations/supabase/client";

export type AuditAction = "create" | "update" | "delete" | "login" | "logout";

interface LogParams {
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Registra uma ação administrativa no audit log.
 * Falhas silenciosas — log não deve quebrar a UX.
 */
export const logAdminAction = async ({
  action,
  entityType,
  entityId,
  metadata,
}: LogParams): Promise<void> => {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return;

    await supabase.from("admin_audit_log" as never).insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      metadata: (metadata ?? null) as never,
    } as never);
  } catch {
    // Silencioso — log não pode interromper o fluxo do admin
  }
};
