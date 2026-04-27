import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TrafficPoint {
  date: string;
  visits: number;
  clicks: number;
}

interface Props {
  data: TrafficPoint[];
}

export const TrafficChart = ({ data }: Props) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-sm font-bold uppercase tracking-wider text-foreground/80">
        Tráfego dos últimos 30 dias
      </h2>
      <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Visitas únicas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/60" /> Cliques
        </span>
      </div>
    </div>
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="visitsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.25} />
              <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 12,
              fontSize: 12,
              boxShadow: "0 10px 40px -10px hsl(0 0% 0% / 0.3)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 700, marginBottom: 4 }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Area
            type="monotone"
            dataKey="visits"
            name="Visitas únicas"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            fill="url(#visitsFill)"
          />
          <Area
            type="monotone"
            dataKey="clicks"
            name="Cliques"
            stroke="hsl(var(--foreground))"
            strokeOpacity={0.7}
            strokeWidth={2}
            fill="url(#clicksFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);