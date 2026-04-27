import { MapPin } from "lucide-react";

export interface CityRow {
  city: string;
  country_code: string | null;
  visits: number;
  clicks: number;
}

const flag = (cc: string | null) => {
  if (!cc || cc.length !== 2) return "🌎";
  const A = 0x1f1e6;
  const code = cc.toUpperCase();
  return String.fromCodePoint(A + code.charCodeAt(0) - 65, A + code.charCodeAt(1) - 65);
};

interface Props {
  rows: CityRow[];
  selected: string | null;
  onSelect: (city: string | null) => void;
}

export const CityList = ({ rows, selected, onSelect }: Props) => {
  const max = Math.max(1, ...rows.map((r) => r.visits));
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground/80">
          <MapPin className="h-3.5 w-3.5 text-primary" /> Cidades
        </h2>
        {selected && (
          <button
            onClick={() => onSelect(null)}
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            Limpar filtro
          </button>
        )}
      </div>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-xs text-muted-foreground">
          Sem dados de localização ainda.
        </p>
      ) : (
        <ul className="space-y-1 max-h-[24rem] overflow-y-auto pr-1">
          {rows.map((r) => {
            const active = selected === r.city;
            const pct = (r.visits / max) * 100;
            return (
              <li key={r.city}>
                <button
                  onClick={() => onSelect(active ? null : r.city)}
                  className={`group relative w-full overflow-hidden rounded-lg border px-3 py-2 text-left transition-smooth ${
                    active
                      ? "border-primary/60 bg-primary/10"
                      : "border-transparent hover:border-border hover:bg-secondary"
                  }`}
                >
                  <span
                    className="absolute inset-y-0 left-0 bg-primary/10"
                    style={{ width: `${pct}%` }}
                  />
                  <span className="relative flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="text-base leading-none">{flag(r.country_code)}</span>
                      <span className="truncate text-sm font-semibold text-foreground">
                        {r.city}
                      </span>
                    </span>
                    <span className="flex items-center gap-3 text-xs font-bold tabular-nums">
                      <span className="text-foreground">{r.visits}</span>
                      <span className="text-muted-foreground">{r.clicks}c</span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};