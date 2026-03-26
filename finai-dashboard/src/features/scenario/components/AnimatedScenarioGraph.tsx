import { useEffect, useRef, useState, type MouseEvent } from 'react'
import type { ScenarioDataPoint } from '../types/scenario.types'

interface AnimatedScenarioGraphProps {
	timeline: ScenarioDataPoint[]
	startValue: number
	isAnimating: boolean
	onAnimationComplete: () => void
	scenarioName: string
	scenarioIcon: string
}

export function AnimatedScenarioGraph({
	timeline,
	startValue,
	isAnimating,
	onAnimationComplete,
	scenarioName: _scenarioName,
	scenarioIcon: _scenarioIcon
}: AnimatedScenarioGraphProps) {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [hoverIndex, setHoverIndex] = useState<number | null>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const animationFrameRef = useRef<number | undefined>(undefined)
	const completionTimeoutRef = useRef<number | undefined>(undefined)
	const frameCountRef = useRef(0)

	const isComplete = !isAnimating && currentIndex >= timeline.length - 1
	const currentData = isComplete ? timeline : timeline.slice(0, currentIndex + 1)
	const currentValue = currentData[currentData.length - 1]?.portfolioValue || startValue
	const currentChange = currentData[currentData.length - 1]?.percentChange || 0
	const inspectIndex = hoverIndex ?? (currentData.length - 1)
	const inspectPoint = currentData[Math.max(0, Math.min(inspectIndex, currentData.length - 1))]
	const inspectValue = inspectPoint?.portfolioValue ?? currentValue
	const inspectChange = inspectPoint?.percentChange ?? currentChange
	useEffect(() => {
		if (!isAnimating) {
			if (timeline.length > 0) {
				setCurrentIndex((prev) => (prev === 0 ? timeline.length - 1 : prev))
			}
			frameCountRef.current = 0
			return
		}

		if (!timeline.length) return

		frameCountRef.current = 0
		setHoverIndex(null)
		setCurrentIndex(0)
		const fps = 20
		const frameDuration = 1000 / fps

		const animate = () => {
			const newIndex = Math.min(frameCountRef.current + 1, timeline.length - 1)
			frameCountRef.current = newIndex
			setCurrentIndex(newIndex)

			if (newIndex < timeline.length - 1) {
				animationFrameRef.current = window.setTimeout(animate, frameDuration)
			} else {
				completionTimeoutRef.current = window.setTimeout(() => {
					onAnimationComplete()
				}, 700)
			}
		}

		animationFrameRef.current = window.setTimeout(animate, frameDuration)

		return () => {
			if (animationFrameRef.current) {
				clearTimeout(animationFrameRef.current)
			}
			if (completionTimeoutRef.current) {
				clearTimeout(completionTimeoutRef.current)
			}
		}
	}, [isAnimating, timeline, onAnimationComplete])

	// Draw the graph on canvas
	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas || currentData.length === 0) return

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		const W = canvas.width
		const H = canvas.height
		const padL = 72, padT = 16, padR = 14, padB = 42
		const cW = W - padL - padR
		const cH = H - padT - padB

		ctx.clearRect(0, 0, W, H)

		const allValues = currentData.map(d => d.portfolioValue)
		const rawMin = Math.min(...allValues, startValue)
		const rawMax = Math.max(...allValues, startValue)
		const spread = rawMax - rawMin || rawMax * 0.02 || 1
		const minVal = rawMin - spread * 0.04
		const maxVal = rawMax + spread * 0.04
		const valRange = maxVal - minVal

		const xOf = (idx: number) => padL + (cW * idx) / Math.max(1, timeline.length - 1)
		const yOf = (val: number) => padT + cH * (1 - (val - minVal) / valRange)

		// Horizontal grid lines
		const ySteps = 5
		ctx.strokeStyle = 'rgba(255,255,255,0.06)'
		ctx.lineWidth = 1
		for (let i = 0; i <= ySteps; i++) {
			const y = padT + (cH * i) / ySteps
			ctx.beginPath()
			ctx.moveTo(padL, y)
			ctx.lineTo(W - padR, y)
			ctx.stroke()
		}

		// Y-axis labels (money)
		ctx.fillStyle = 'rgba(255,255,255,0.45)'
		ctx.font = '11px system-ui, -apple-system, sans-serif'
		ctx.textAlign = 'right'
		for (let i = 0; i <= ySteps; i++) {
			const val = maxVal - (valRange * i / ySteps)
			const y = padT + (cH * i) / ySteps
			const label = val >= 1_000_000
				? `$${(val / 1_000_000).toFixed(1)}M`
				: val >= 1000
				? `$${(val / 1000).toFixed(0)}K`
				: `$${val.toFixed(0)}`
			ctx.fillText(label, padL - 8, y + 4)
		}

		// X-axis date labels (6 evenly spaced from full timeline)
		const xLabelCount = 6
		ctx.fillStyle = 'rgba(255,255,255,0.38)'
		ctx.font = '11px system-ui, -apple-system, sans-serif'
		for (let i = 0; i <= xLabelCount; i++) {
			const idx = Math.round((i / xLabelCount) * (timeline.length - 1))
			const point = timeline[idx]
			if (!point) continue
			const x = xOf(idx)
			const label = new Date(point.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
			ctx.textAlign = i === 0 ? 'left' : i === xLabelCount ? 'right' : 'center'
			ctx.fillText(label, x, H - padB + 18)
		}

		// Draw line
		const isLosing = currentChange < 0
		const lineGrad = ctx.createLinearGradient(padL, 0, W - padR, 0)
		if (isLosing) {
			lineGrad.addColorStop(0, 'rgba(239,68,68,1)')
			lineGrad.addColorStop(1, 'rgba(249,115,22,1)')
		} else {
			lineGrad.addColorStop(0, 'rgba(34,197,94,1)')
			lineGrad.addColorStop(1, 'rgba(16,185,129,1)')
		}
		ctx.strokeStyle = lineGrad
		ctx.lineWidth = 2
		ctx.lineCap = 'round'
		ctx.lineJoin = 'round'
		ctx.beginPath()
		currentData.forEach((point, idx) => {
			const x = xOf(idx)
			const y = yOf(point.portfolioValue)
			if (idx === 0) ctx.moveTo(x, y)
			else ctx.lineTo(x, y)
		})
		ctx.stroke()

		// Fill under line
		ctx.lineTo(xOf(currentData.length - 1), padT + cH)
		ctx.lineTo(padL, padT + cH)
		ctx.closePath()
		const fillGrad = ctx.createLinearGradient(0, padT, 0, padT + cH)
		if (isLosing) {
			fillGrad.addColorStop(0, 'rgba(239,68,68,0.18)')
			fillGrad.addColorStop(1, 'rgba(239,68,68,0)')
		} else {
			fillGrad.addColorStop(0, 'rgba(34,197,94,0.18)')
			fillGrad.addColorStop(1, 'rgba(34,197,94,0)')
		}
		ctx.fillStyle = fillGrad
		ctx.fill()

		// Hover: dashed vertical crosshair + date label drawn on canvas
		if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < currentData.length) {
			const hx = xOf(hoverIndex)
			ctx.save()
			ctx.strokeStyle = 'rgba(255,255,255,0.22)'
			ctx.lineWidth = 1
			ctx.setLineDash([4, 5])
			ctx.beginPath()
			ctx.moveTo(hx, padT)
			ctx.lineTo(hx, padT + cH)
			ctx.stroke()
			ctx.setLineDash([])
			ctx.restore()
			const hDate = new Date(currentData[hoverIndex].date)
			const dateStr = hDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
			const labelX = Math.min(Math.max(hx, padL + 32), W - padR - 32)
			ctx.fillStyle = 'rgba(255,255,255,0.9)'
			ctx.font = 'bold 11px system-ui, -apple-system, sans-serif'
			ctx.textAlign = 'center'
			ctx.fillText(dateStr, labelX, H - padB + 18)
		}

		// Point circle — smaller (3.5 px)
		const ptIdx = Math.max(0, Math.min(hoverIndex ?? currentData.length - 1, currentData.length - 1))
		const ptVal = currentData[ptIdx]?.portfolioValue ?? currentValue
		ctx.beginPath()
		ctx.arc(xOf(ptIdx), yOf(ptVal), 3.5, 0, Math.PI * 2)
		ctx.fillStyle = isLosing ? '#ef4444' : '#22c55e'
		ctx.fill()
		ctx.strokeStyle = 'rgba(255,255,255,0.85)'
		ctx.lineWidth = 1.5
		ctx.stroke()

	}, [currentData, startValue, timeline.length, currentValue, currentChange, hoverIndex])

	const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
		if (!isComplete || !canvasRef.current || timeline.length <= 1) return
		const rect = canvasRef.current.getBoundingClientRect()
		const ratio = canvasRef.current.width / rect.width
		const x = (event.clientX - rect.left) * ratio
		const padL = 72, padR = 14
		const W = canvasRef.current.width
		const clampedX = Math.min(Math.max(x, padL), W - padR)
		const percent = (clampedX - padL) / (W - padL - padR)
		const index = Math.round(percent * (timeline.length - 1))
		setHoverIndex(index)
	}

	const handleMouseLeave = () => {
		if (!isComplete) return
		setHoverIndex(null)
	}

	return (
		<div className="relative w-full h-full">
			{/* Graph Container */}
			<div className="relative w-full h-[500px] bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
				{/* Current Value Display */}
				<div className="absolute top-6 left-6 z-10">
					<div className="text-sm text-zinc-500 mb-1">Portfolio Value</div>
					<div className="text-3xl font-bold text-white">
						${inspectValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
					</div>
					<div className={`text-lg font-semibold ${inspectChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
						{inspectChange >= 0 ? '+' : ''}{inspectChange.toFixed(2)}%
					</div>
				</div>

				{/* Canvas */}
				<canvas
					ref={canvasRef}
					width={1200}
					height={500}
					className="w-full h-full"
					onMouseMove={handleMouseMove}
					onMouseLeave={handleMouseLeave}
				/>

				{/* Animated moving indicator */}
				{isAnimating && (
					<div 
						className="absolute top-1/2 -translate-y-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-50"
						style={{
							left: `${(currentIndex / (timeline.length - 1)) * 100}%`,
							transition: 'left 0.05s linear'
						}}
					/>
				)}
			</div>

			{/* Animation progress bar */}
			{isAnimating && (
				<div className="mt-4">
					<div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
						<div 
							className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-75"
							style={{ width: `${(currentIndex / (timeline.length - 1)) * 100}%` }}
						/>
					</div>
				</div>
			)}
		</div>
	)
}
