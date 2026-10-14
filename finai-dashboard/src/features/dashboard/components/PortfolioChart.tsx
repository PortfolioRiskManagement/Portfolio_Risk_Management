import { useState } from "react"

export type ChartPoint = { time: number; value: number }

const WIDTH = 900
const HEIGHT = 340
const PADDING = { top: 16, right: 16, bottom: 32, left: 56 }

function formatAxis(value: number) {
  if (Math.abs(value) >= 1000) return `$${Math.round(value / 1000).toLocaleString()}k`
  return `$${Math.round(value)}`
}

/** A round step (1, 2 or 5 × 10^n) that splits the range into about 3 intervals. */
function niceStep(range: number) {
  const raw = range / 3 || 1
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const normalized = raw / magnitude
  return (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude
}

const monthLabel = (t: number) => new Date(t).toLocaleDateString(undefined, { month: "short" })
const fullDate = (t: number) => new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })

/** Smooth curve through the points (Catmull-Rom converted to cubic Béziers). */
function smoothPath(points: { x: number; y: number }[]) {
  return points.reduce((path, p, i) => {
    if (i === 0) return `M ${p.x},${p.y}`
    const p0 = points[i - 2] ?? points[i - 1]
    const p1 = points[i - 1]
    const p2 = p
    const p3 = points[i + 1] ?? p
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    return `${path} C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`
  }, "")
}

/** Area chart of portfolio value; hover to see the value on a given date. */
export default function PortfolioChart({ data }: { data: ChartPoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  if (data.length < 2) return null

  const chartWidth = WIDTH - PADDING.left - PADDING.right
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom

  // Round the axis out to a clean step so the ticks land on round values.
  const step = niceStep(Math.max(...data.map((d) => d.value)) - Math.min(...data.map((d) => d.value)))
  const minValue = Math.floor(Math.min(...data.map((d) => d.value)) / step) * step
  const maxValue = Math.ceil(Math.max(...data.map((d) => d.value)) / step) * step
  const valueRange = maxValue - minValue || 1
  const ticks = Array.from({ length: 4 }, (_, i) => minValue + (valueRange / 3) * i)

  const toY = (value: number) => PADDING.top + chartHeight - ((value - minValue) / valueRange) * chartHeight
  const points = data.map((d, i) => ({ ...d, x: PADDING.left + (i / (data.length - 1)) * chartWidth, y: toY(d.value) }))

  const linePath = smoothPath(points)
  const baseline = PADDING.top + chartHeight
  const areaPath = `${linePath} L ${points[points.length - 1].x},${baseline} L ${points[0].x},${baseline} Z`
  const active = hovered === null ? points.length - 1 : hovered
  const activePoint = points[active]

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" onMouseLeave={() => setHovered(null)}>
        <defs>
          <linearGradient id="perfArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="perfLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="55%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={toY(tick)}
              y2={toY(tick)}
              stroke="currentColor"
              strokeDasharray="3 5"
              className="text-zinc-200 dark:text-white/[0.07]"
            />
            <text x={PADDING.left - 12} y={toY(tick)} textAnchor="end" dominantBaseline="middle" className="fill-zinc-400 text-[12px] dark:fill-zinc-500">
              {formatAxis(tick)}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#perfArea)" />
        <path d={linePath} fill="none" stroke="url(#perfLine)" strokeWidth="3" strokeLinecap="round" />

        {/* Hover guide and marker */}
        <line
          x1={activePoint.x}
          x2={activePoint.x}
          y1={PADDING.top}
          y2={baseline}
          stroke="currentColor"
          className="text-indigo-300/60 dark:text-indigo-400/30"
        />
        <circle cx={activePoint.x} cy={activePoint.y} r="10" className="fill-indigo-500/20" />
        <circle cx={activePoint.x} cy={activePoint.y} r="5" fill="#ffffff" stroke="#6366f1" strokeWidth="3" />

        {/* Month labels at the first point of each month */}
        {points.map((point, i) =>
          i > 0 && monthLabel(point.time) === monthLabel(points[i - 1].time) ? null : (
            <text
              key={`label-${point.time}`}
              x={point.x}
              y={baseline + 22}
              textAnchor={i === 0 ? "start" : "middle"}
              className="fill-zinc-400 text-[12px] dark:fill-zinc-500"
            >
              {monthLabel(point.time)}
            </text>
          )
        )}

        {/* Invisible hover targets, one column per point */}
        {points.map((point, i) => (
          <rect
            key={`hit-${point.time}`}
            x={point.x - chartWidth / (points.length - 1) / 2}
            y={PADDING.top}
            width={chartWidth / (points.length - 1)}
            height={chartHeight}
            fill="transparent"
            onMouseEnter={() => setHovered(i)}
          />
        ))}
      </svg>

      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs shadow-lg dark:border-white/10 dark:bg-zinc-900"
        style={{
          left: `${(Math.min(Math.max(activePoint.x, PADDING.left + 40), WIDTH - PADDING.right - 40) / WIDTH) * 100}%`,
          top: `${((activePoint.y - 16) / HEIGHT) * 100}%`,
        }}
      >
        <div className="font-semibold tabular-nums text-zinc-950 dark:text-white">${Math.round(activePoint.value).toLocaleString()}</div>
        <div className="text-zinc-500 dark:text-zinc-400">{fullDate(activePoint.time)}</div>
      </div>
    </div>
  )
}
