export default function PortfolioChart() {
  // Mock data for 6-month portfolio performance
  const data = [
    { month: "Jan", value: 104000 },
    { month: "Feb", value: 108000 },
    { month: "Mar", value: 112000 },
    { month: "Apr", value: 118000 },
    { month: "May", value: 124000 },
    { month: "Jun", value: 132622 },
  ]

  const width = 900
  const height = 300
  const padding = { top: 20, right: 20, bottom: 40, left: 60 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const minValue = Math.min(...data.map((d) => d.value))
  const maxValue = Math.max(...data.map((d) => d.value))
  const valueRange = maxValue - minValue

  // Calculate points for the area chart
  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartWidth
    const y = padding.top + chartHeight - ((d.value - minValue) / valueRange) * chartHeight
    return { x, y, ...d }
  })

  // Create the path for the line
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ")

  // Create the path for the filled area
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x},${padding.top + chartHeight}` +
    ` L ${padding.left},${padding.top + chartHeight} Z`

  // Y-axis labels
  const yLabels = [35000, 70000, 105000, 140000]

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Portfolio Performance (6M)
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        style={{ maxHeight: "300px" }}
      >
        {/* Y-axis labels */}
        {yLabels.map((label) => {
          const y =
            padding.top +
            chartHeight -
            ((label - minValue) / valueRange) * chartHeight
          return (
            <text
              key={label}
              x={padding.left - 10}
              y={y}
              textAnchor="end"
              className="fill-zinc-500 text-xs dark:fill-zinc-600"
              dominantBaseline="middle"
            >
              {label.toLocaleString()}
            </text>
          )
        })}

        {/* Gradient definition for the area fill */}
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#3b82f6"
            className="hover:r-6 transition-all"
          />
        ))}

        {/* X-axis labels */}
        {points.map((point, i) => (
          <text
            key={i}
            x={point.x}
            y={padding.top + chartHeight + 20}
            textAnchor="middle"
            className="fill-zinc-500 text-xs dark:fill-zinc-600"
          >
            {point.month}
          </text>
        ))}
      </svg>
    </div>
  )
}
