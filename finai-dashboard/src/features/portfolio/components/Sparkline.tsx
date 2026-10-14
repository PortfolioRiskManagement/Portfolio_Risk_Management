import React from 'react'
// lightweight sparkline svg

type Props = {
  data: number[]
  width?: number
  height?: number
  color?: string
  showLast?: boolean
  highlightIndex?: number
  onHover?: (i: number | null) => void
  times?: number[]
  /** Show date labels and gridlines along the bottom (requires `times`). */
  showAxis?: boolean
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Evenly spaced indices to label along the x-axis. */
function axisTickIndices(length: number, maxTicks = 6) {
  if (length <= maxTicks) return Array.from({ length }, (_, i) => i)
  const step = (length - 1) / (maxTicks - 1)
  return Array.from({ length: maxTicks }, (_, i) => Math.round(i * step))
}

function formatAxisDate(t: number, spanMs: number) {
  const d = new Date(t)
  // short ranges: "Oct 7"; long ranges: "Oct '25"
  if (spanMs <= 120 * DAY_MS) return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `${d.toLocaleDateString(undefined, { month: 'short' })} '${String(d.getFullYear()).slice(-2)}`
}

function formatFullDate(t: number) {
  return new Date(t).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function pathFromData(data: number[], w: number, h: number) {
  if (!data || data.length === 0) return ''
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = w / Math.max(1, data.length - 1)
  const points = data.map((v, i) => {
    const x = i * step
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  })
  return points.join(' ')
}

export default function Sparkline({ data, width = 820, height = 140, color = '#10b981', showLast = true, highlightIndex, onHover, times, showAxis = false }: Props) {
  // hover state within the component - must be defined before early return
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null)
  
  if (!data || data.length === 0) return <div />
  const d = pathFromData(data, width, height)
  const points = d.split(' ')
  const lastPoint = points[points.length - 1]
  const highlightedPoint = typeof highlightIndex === 'number' && points[highlightIndex] ? points[highlightIndex] : null
  // compute badge position (use times if provided for better accuracy)
  let badgeStyle: any = { display: 'none' }
  if (highlightedPoint) {
    const [xStr, yStr] = highlightedPoint.split(',')
    const x = Number(xStr)
    const y = Number(yStr)
    const left = (x / width) * 100
    const top = (y / height) * 100
    badgeStyle = { position: 'absolute', left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -120%)', pointerEvents: 'none' }
  }

  const spanMs = times && times.length > 1 ? times[times.length - 1] - times[0] : 0
  const axisTicks = showAxis && times && times.length === data.length ? axisTickIndices(data.length) : []
  const markerIdx = hoverIdx ?? (typeof highlightIndex === 'number' ? highlightIndex : null)

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = (e.target as Element).getBoundingClientRect()
    const x = e.clientX - rect.left
    const idx = Math.round((x / rect.width) * (data.length - 1))
    setHoverIdx(idx)
    onHover?.(idx)
  }

  function handlePointerLeave() {
    setHoverIdx(null)
    onHover?.(null)
  }

  return (
    <div className="relative">
      <svg onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="rounded">
      <defs>
        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {axisTicks.map(i => {
        const x = (i / Math.max(1, data.length - 1)) * width
        return <line key={i} x1={x} x2={x} y1={0} y2={height} stroke="currentColor" strokeOpacity={0.08} vectorEffect="non-scaling-stroke" className="text-zinc-500" />
      })}
      {markerIdx !== null && (
        <line x1={(markerIdx / Math.max(1, data.length - 1)) * width} x2={(markerIdx / Math.max(1, data.length - 1)) * width} y1={0} y2={height} stroke="currentColor" strokeOpacity={0.35} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" className="text-zinc-500" />
      )}
  <polyline points={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.98} />
      <polygon points={`${points.join(' ')} ${width},${height} 0,${height}`} fill="url(#g1)" opacity={0.9} />
      </svg>
      {axisTicks.length > 0 && times && (
        <div className="relative mt-2 h-5 border-t border-zinc-200 dark:border-zinc-800">
          {axisTicks.map((i, n) => {
            const left = (i / Math.max(1, data.length - 1)) * 100
            const align = n === 0 ? 'translateX(0)' : n === axisTicks.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)'
            return (
              <div key={i} style={{ position: 'absolute', left: `${left}%`, transform: align }} className="pt-1 text-xs whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                {formatAxisDate(times[i], spanMs)}
              </div>
            )
          })}
        </div>
      )}
      {showLast && lastPoint ? (<g />) : null}
      {highlightedPoint ? (
        (() => {
          const price = data[highlightIndex as number]
          let dateStr = ''
          if (typeof times !== 'undefined' && times && typeof highlightIndex === 'number') {
            dateStr = formatFullDate(times[highlightIndex])
          }
          return (
            <div style={badgeStyle} className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
              <div className="font-medium">{formatPrice(price)}</div>
              {dateStr ? <div className="text-xs text-zinc-500 dark:text-zinc-400">{dateStr}</div> : null}
            </div>
          )
        })()
      ) : null}

      {/* hover badge */}
      {hoverIdx !== null && data[hoverIdx] !== undefined ? (
        (() => {
          const p = points[hoverIdx]
          if (!p) return null
          const [, yStr] = p.split(',')
          const y = Number(yStr)
          const left = (hoverIdx / (data.length - 1)) * 100
          const top = (y / height) * 100
          let dateStr = ''
          if (times && times[hoverIdx]) dateStr = formatFullDate(times[hoverIdx])
          return <div style={{ position: 'absolute', left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -120%)', pointerEvents: 'none' }} className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"><div className="font-medium">{formatPrice(data[hoverIdx])}</div>{dateStr ? <div className="text-xs text-zinc-500 dark:text-zinc-400">{dateStr}</div> : null}</div>
        })()
      ) : null}
    </div>
  )
}

function formatPrice(v: string | number) {
  const n = typeof v === 'string' ? Number(v) : v
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}
