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

export default function Sparkline({ data, width = 820, height = 140, color = '#10b981', showLast = true, highlightIndex, onHover, times }: Props) {
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
  <polyline points={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.98} />
      <polygon points={`${points.join(' ')} ${width},${height} 0,${height}`} fill="url(#g1)" opacity={0.9} />
      </svg>
      {showLast && lastPoint ? (<g />) : null}
      {highlightedPoint ? (
        (() => {
          const price = Number(highlightedPoint.split(',')[1]).toFixed(2)
          let dateStr = ''
          if (typeof times !== 'undefined' && times && typeof highlightIndex === 'number') {
            dateStr = new Date(times[highlightIndex]).toLocaleDateString()
          }
          return (
            <div style={badgeStyle} className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
              <div className="font-medium">{formatPrice(price)}</div>
              {dateStr ? <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{dateStr}</div> : null}
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
          if (times && times[hoverIdx]) dateStr = new Date(times[hoverIdx]).toLocaleDateString()
          return <div style={{ position: 'absolute', left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -120%)', pointerEvents: 'none' }} className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"><div className="font-medium">{Number(data[hoverIdx]).toFixed(2)}</div>{dateStr ? <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{dateStr}</div> : null}</div>
        })()
      ) : null}
    </div>
  )
}

function formatPrice(v: string | number) {
  const n = typeof v === 'string' ? Number(v) : v
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}
