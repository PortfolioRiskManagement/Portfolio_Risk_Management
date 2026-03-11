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

		const width = canvas.width
		const height = canvas.height
		const padding = 40

		// Clear canvas
		ctx.clearRect(0, 0, width, height)

		// Calculate bounds
		const allValues = currentData.map(d => d.portfolioValue)
		const minValue = Math.min(...allValues, startValue)
		const maxValue = Math.max(...allValues, startValue)
		const valueRange = maxValue - minValue || 1

		// Draw grid lines
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
		ctx.lineWidth = 1
		for (let i = 0; i <= 4; i++) {
			const y = padding + (height - padding * 2) * (i / 4)
			ctx.beginPath()
			ctx.moveTo(padding, y)
			ctx.lineTo(width - padding, y)
			ctx.stroke()
		}

		// Draw value labels
		ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
		ctx.font = '12px system-ui'
		ctx.textAlign = 'right'
		for (let i = 0; i <= 4; i++) {
			const value = maxValue - (valueRange * i / 4)
			const y = padding + (height - padding * 2) * (i / 4)
			ctx.fillText(`$${(value / 1000).toFixed(0)}K`, padding - 10, y + 4)
		}

		// Draw the line graph
		const isLosing = currentChange < 0
		const gradient = ctx.createLinearGradient(0, 0, width, 0)
		
		if (isLosing) {
			gradient.addColorStop(0, 'rgba(239, 68, 68, 1)') // red
			gradient.addColorStop(1, 'rgba(249, 115, 22, 1)') // orange
		} else {
			gradient.addColorStop(0, 'rgba(34, 197, 94, 1)') // green
			gradient.addColorStop(1, 'rgba(16, 185, 129, 1)') // emerald
		}

		ctx.strokeStyle = gradient
		ctx.lineWidth = 3
		ctx.lineCap = 'round'
		ctx.lineJoin = 'round'

		ctx.beginPath()
		currentData.forEach((point, index) => {
			const x = padding + ((width - padding * 2) * index) / (timeline.length - 1)
			const y = padding + ((height - padding * 2) * (1 - (point.portfolioValue - minValue) / valueRange))

			if (index === 0) {
				ctx.moveTo(x, y)
			} else {
				ctx.lineTo(x, y)
			}
		})
		ctx.stroke()

		// Draw fill area under line
		ctx.lineTo(
			padding + ((width - padding * 2) * (currentData.length - 1)) / (timeline.length - 1),
			height - padding
		)
		ctx.lineTo(padding, height - padding)
		ctx.closePath()
		
		const fillGradient = ctx.createLinearGradient(0, padding, 0, height - padding)
		if (isLosing) {
			fillGradient.addColorStop(0, 'rgba(239, 68, 68, 0.2)')
			fillGradient.addColorStop(1, 'rgba(239, 68, 68, 0)')
		} else {
			fillGradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)')
			fillGradient.addColorStop(1, 'rgba(34, 197, 94, 0)')
		}
		ctx.fillStyle = fillGradient
		ctx.fill()

		// Draw current/hover point
		const pointIndex = Math.max(0, Math.min(hoverIndex ?? (currentData.length - 1), currentData.length - 1))
		const pointValue = currentData[pointIndex]?.portfolioValue ?? currentValue
		const lastX = padding + ((width - padding * 2) * pointIndex) / Math.max(1, (timeline.length - 1))
		const lastY = padding + ((height - padding * 2) * (1 - (pointValue - minValue) / valueRange))
		
		ctx.beginPath()
		ctx.arc(lastX, lastY, 6, 0, Math.PI * 2)
		ctx.fillStyle = isLosing ? '#ef4444' : '#22c55e'
		ctx.fill()
		ctx.strokeStyle = 'white'
		ctx.lineWidth = 2
		ctx.stroke()

	}, [currentData, startValue, timeline.length, currentValue, currentChange, hoverIndex])

	const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
		if (!isComplete || !canvasRef.current || timeline.length <= 1) return
		const rect = canvasRef.current.getBoundingClientRect()
		const ratio = canvasRef.current.width / rect.width
		const x = (event.clientX - rect.left) * ratio
		const width = canvasRef.current.width
		const padding = 40
		const clampedX = Math.min(Math.max(x, padding), width - padding)
		const percent = (clampedX - padding) / (width - padding * 2)
		const index = Math.round(percent * (timeline.length - 1))
		setHoverIndex(index)
	}

	const handleMouseLeave = () => {
		if (!isComplete) return
		setHoverIndex(null)
	}

	const hoverLeftPercent = timeline.length > 1
		? ((Math.max(0, Math.min(inspectIndex, timeline.length - 1))) / (timeline.length - 1)) * 100
		: 0

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

				{isComplete && inspectPoint && (
					<div
						className="absolute top-6 z-10 -translate-x-1/2 rounded-lg border border-zinc-700 bg-zinc-900/95 px-3 py-2 text-xs text-zinc-200 pointer-events-none"
						style={{ left: `${Math.min(Math.max(hoverLeftPercent, 8), 92)}%` }}
					>
						<div className="font-semibold text-white">${inspectValue.toFixed(2)}</div>
						<div className="text-zinc-400">{new Date(inspectPoint.date).toLocaleDateString('en-US')}</div>
					</div>
				)}

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
