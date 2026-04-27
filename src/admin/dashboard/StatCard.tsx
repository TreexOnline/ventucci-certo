import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | null;
  icon: LucideIcon;
  hint?: string;
  loading?: boolean;
}

export const StatCard = ({ label, value, icon: Icon, hint, loading }: StatCardProps) => (
  <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-smooth hover:border-primary/40 hover:shadow-red">
    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="rounded-lg bg-primary/10 p-2">
        <Icon className="h-4 w-4 text-primary" strokeWidth={2.5} />
      </span>
    </div>
    <p className="mt-3 text-3xl font-extrabold text-foreground">
      {loading || value === null ? "—" : value.toLocaleString("pt-BR")}
    </p>
    {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);