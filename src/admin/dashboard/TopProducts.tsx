export interface TopProduct {
  name: string;
  clicks: number;
}

interface Props {
  rows: TopProduct[];
  cityFilter: string | null;
}

export const TopProducts = ({ rows, cityFilter }: Props) => {
  const max = Math.max(1, ...rows.map((r) => r.clicks));
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground/80">
          Mais clicados
        </h2>
        {cityFilter && (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            {cityFilter}
          </span>
        )}
      </div>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-xs text-muted-foreground">
          {cityFilter
            ? "Sem cliques nessa cidade ainda."
            : "Sem cliques ainda."}
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((p, i) => {
            const pct = (p.clicks / max) * 100;
            return (
              <li key={p.name} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/15 text-[10px] font-extrabold text-primary">
                      {i + 1}
                    </span>
                    <span className="truncate text-sm font-semibold text-foreground">
                      {p.name}
                    </span>
                  </span>
                  <span className="text-sm font-extrabold tabular-nums text-foreground">
                    {p.clicks}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};