import { useState } from "react"

// Mock data for 6-month portfolio performance
export const PERFORMANCE_DATA = [
  { month: "Jan", value: 104000 },
  { month: "Feb", value: 108000 },
  { month: "Mar", value: 112000 },
  { month: "Apr", value: 118000 },
  { month: "May", value: 124000 },
  { month: "Jun", value: 132622 },
]

const WIDTH = 900
const HEIGHT = 340
const PADDING = { top: 16, right: 16, bottom: 32, left: 56 }

function formatAxis(value: number) {
  return `$${Math.round(value / 1000)}k`
}

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

/** Area chart of portfolio value; hover a month to see its value. */
export default function PortfolioChart() {
  const [hovered, setHovered] = useState<number | null>(null)
  const data = PERFORMANCE_DATA

  const chartWidth = WIDTH - PADDING.left - PADDING.right
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom

  // Round the axis out to the nearest $10k so the ticks land on clean values.
  const step = 10000
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

        {points.map((point, i) => (
          <text
            key={point.month}
            x={point.x}
            y={baseline + 22}
            textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
            className={`text-[12px] ${i === active ? "fill-zinc-900 font-semibold dark:fill-white" : "fill-zinc-400 dark:fill-zinc-500"}`}
          >
            {point.month}
          </text>
        ))}

        {/* Invisible hover targets, one column per month */}
        {points.map((point, i) => (
          <rect
            key={`hit-${point.month}`}
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
        <div className="font-semibold tabular-nums text-zinc-950 dark:text-white">${activePoint.value.toLocaleString()}</div>
        <div className="text-zinc-500 dark:text-zinc-400">{activePoint.month}</div>
      </div>
    </div>
  )
}
