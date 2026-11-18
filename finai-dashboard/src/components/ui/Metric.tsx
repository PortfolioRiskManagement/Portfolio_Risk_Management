interface Props {
  label: string
  value: string
  subtext?: string
  trend?: "up" | "down" | "neutral"
}

export default function Metric({ label, value, subtext, trend }: Props) {
  const trendColor =
    trend === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend === "down"
        ? "text-rose-600 dark:text-rose-400"
        : "text-zinc-500 dark:text-zinc-400"

  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="mb-1 text-3xl font-bold tracking-tight text-zinc-950 tabular-nums dark:text-white">{value}</div>
      {subtext && <div className={`text-sm font-medium ${trendColor}`}>{subtext}</div>}
    </div>
  )
}
