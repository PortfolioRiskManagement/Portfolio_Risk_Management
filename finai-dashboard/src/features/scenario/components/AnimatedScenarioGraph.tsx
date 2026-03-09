import { useEffect, useRef, useState } from 'react'
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
	scenarioName,
	scenarioIcon
}: AnimatedScenarioGraphProps) {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [showEventPopup, setShowEventPopup] = useState(false)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const animationFrameRef = useRef<number | undefined>(undefined)
	const pauseTimeoutRef = useRef<number | undefined>(undefined)
	const completionTimeoutRef = useRef<number | undefined>(undefined)
	const hasPausedRef = useRef(false)
	const frameCountRef = useRef(0)

	const currentData = timeline.slice(0, currentIndex + 1)
	const currentValue = currentData[currentData.length - 1]?.portfolioValue || startValue
	const currentChange = currentData[currentData.length - 1]?.percentChange || 0
	const graphHeight = 500
	const padding = 40
	const scaleValues = currentData.length ? currentData.map(d => d.portfolioValue) : [startValue]
	const minScaleValue = Math.min(...scaleValues, startValue)
	const maxScaleValue = Math.max(...scaleValues, startValue)
	const scaleRange = maxScaleValue - minScaleValue || 1
	const currentXPercent = timeline.length > 1 ? (currentIndex / (timeline.length - 1)) * 100 : 0
	const currentY = padding + ((graphHeight - padding * 2) * (1 - (currentValue - minScaleValue) / scaleRange))
	const currentYPercent = (currentY / graphHeight) * 100
	const popupLeftPercent = Math.min(Math.max(currentXPercent + 5, 18), 82)
	const popupTopPercent = Math.min(Math.max(currentYPercent - 8, 16), 84)

	useEffect(() => {
		if (!isAnimating) {
			setCurrentIndex(0)
			setShowEventPopup(false)
			hasPausedRef.current = false
			frameCountRef.current = 0
			return
		}

		if (!timeline.length) return

		frameCountRef.current = 0
		hasPausedRef.current = false
		const fps = 20
		const frameDuration = 1000 / fps
		const finalChange = timeline[timeline.length - 1]?.percentChange ?? 0
		const dramaticPoint = finalChange < 0 ? 0.6 : 0.8
		const dramaticIndex = Math.max(1, Math.floor((timeline.length - 1) * dramaticPoint))

		const animate = () => {
			const newIndex = Math.min(frameCountRef.current + 1, timeline.length - 1)
			frameCountRef.current = newIndex
			setCurrentIndex(newIndex)

			if (newIndex === dramaticIndex && !hasPausedRef.current) {
				hasPausedRef.current = true
				setShowEventPopup(true)
				pauseTimeoutRef.current = window.setTimeout(() => {
					setShowEventPopup(false)
					if (newIndex < timeline.length - 1) {
						animationFrameRef.current = window.setTimeout(animate, frameDuration)
					}
				}, 1500)
				return
			}

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
			if (pauseTimeoutRef.current) {
				clearTimeout(pauseTimeoutRef.current)
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

		// Draw current point
		const lastX = padding + ((width - padding * 2) * (currentData.length - 1)) / (timeline.length - 1)
		const lastY = padding + ((height - padding * 2) * (1 - (currentValue - minValue) / valueRange))
		
		ctx.beginPath()
		ctx.arc(lastX, lastY, 6, 0, Math.PI * 2)
		ctx.fillStyle = isLosing ? '#ef4444' : '#22c55e'
		ctx.fill()
		ctx.strokeStyle = 'white'
		ctx.lineWidth = 2
		ctx.stroke()

	}, [currentData, startValue, timeline.length, currentValue, currentChange])

	return (
		<div className="relative w-full h-full">
			{/* Graph Container */}
			<div className="relative w-full h-[500px] bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
				{/* Current Value Display */}
				<div className="absolute top-6 left-6 z-10">
					<div className="text-sm text-zinc-500 mb-1">Portfolio Value</div>
					<div className="text-3xl font-bold text-white">
						${currentValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
					</div>
					<div className={`text-lg font-semibold ${currentChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
						{currentChange >= 0 ? '+' : ''}{currentChange.toFixed(2)}%
					</div>
				</div>

				{/* Canvas */}
				<canvas
					ref={canvasRef}
					width={1200}
					height={500}
					className="w-full h-full"
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

			{/* Event Popup - appears during dramatic moment */}
			{showEventPopup && (
						<div
							className="absolute z-20 animate-fadeIn pointer-events-none"
							style={{
								left: `${popupLeftPercent}%`,
								top: `${popupTopPercent}%`,
								transform: 'translate(-50%, -100%)'
							}}
						>
							<div className="bg-black/90 backdrop-blur-xl border-2 border-purple-500 rounded-2xl p-5 shadow-2xl shadow-purple-500/50 w-[280px]">
						<div className="text-center">
									<div className="text-4xl mb-2">{scenarioIcon}</div>
									<h3 className="text-xl font-bold text-white mb-1">{scenarioName}</h3>
									<p className="text-zinc-400 mb-3 text-sm">
								{currentChange < 0 ? 'Your portfolio is experiencing losses...' : 'Your portfolio is growing...'}
							</p>
									<div className="flex items-center justify-center gap-2 text-sm">
										<div className="flex flex-col items-center p-2 bg-zinc-800/50 rounded-lg min-w-24">
									<div className="text-zinc-500 mb-1">Current Change</div>
											<div className={`text-xl font-bold ${currentChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
										{currentChange >= 0 ? '+' : ''}{currentChange.toFixed(1)}%
									</div>
								</div>
										<div className="flex flex-col items-center p-2 bg-zinc-800/50 rounded-lg min-w-20">
									<div className="text-zinc-500 mb-1">Value</div>
											<div className="text-xl font-bold text-white">
										${(currentValue / 1000).toFixed(0)}K
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

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
