import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AuditEntry {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const actionLabel: Record<string, string> = {
  create: "Criou",
  update: "Editou",
  delete: "Removeu",
  login: "Login",
  logout: "Logout",
};

const actionColor: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  update: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  delete: "bg-destructive/10 text-destructive border-destructive/20",
  login: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  logout: "bg-muted text-muted-foreground border-border",
};

const AdminAuditLog = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("admin_audit_log" as never)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setEntries((data ?? []) as unknown as AuditEntry[]);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-primary" strokeWidth={2.5} />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            Audit Log
          </h1>
          <p className="text-sm text-muted-foreground">
            Histórico das ações realizadas no painel administrativo (últimas 200).
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhuma ação registrada ainda.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-secondary/50">
                <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Quando</th>
                  <th className="px-4 py-3">Ação</th>
                  <th className="px-4 py-3">Entidade</th>
                  <th className="px-4 py-3">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((e) => {
                  const meta = e.metadata ?? {};
                  const name = (meta as { name?: string }).name;
                  return (
                    <tr key={e.id} className="hover:bg-secondary/30">
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                        {new Date(e.created_at).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                            actionColor[e.action] ?? actionColor.logout
                          }`}
                        >
                          {actionLabel[e.action] ?? e.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {e.entity_type}
                      </td>
                      <td className="px-4 py-3 text-foreground/80">
                        {name ?? e.entity_id ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLog;
