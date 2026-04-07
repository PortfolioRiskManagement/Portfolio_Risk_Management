interface Props {
label: string
value: string
subtext?: string
trend?: "up" | "down" | "neutral"
}


export default function Metric({ label, value, subtext, trend }: Props) {
const trendColor =
trend === "up"
? "text-green-600 dark:text-green-400"
: trend === "down"
? "text-red-600 dark:text-red-400"
: "text-zinc-500 dark:text-zinc-400"


return (
<div>
<div className="mb-1 text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</div>
<div className="mb-1 text-3xl font-bold text-zinc-950 dark:text-white">{value}</div>
{subtext && (
<div className={`text-sm ${trendColor}`}>{subtext}</div>
)}
</div>
)
}
