/**
 * SpinnerLoader — reusable circular dot-ring loading indicator.
 * Drop it anywhere you need a loading state; pass a `label` and `size` to customise.
 */
interface SpinnerLoaderProps {
	/** Text shown in the centre of the spinner. Defaults to "LOADING". */
	label?: string
	/** Diameter of the spinner in px. Defaults to 160. */
	size?: number
	/** Extra Tailwind classes on the outer wrapper. */
	className?: string
}

export function SpinnerLoader({ label = 'LOADING', size = 160, className = '' }: SpinnerLoaderProps) {
	const N = 20
	const R = size * 0.37

	return (
		<div className={`flex items-center justify-center ${className}`}>
			<div className="relative" style={{ width: size, height: size }}>
				{/* Spinning ring of dots — grows brighter/larger clockwise */}
				<div
					className="absolute inset-0 animate-spin"
					style={{ animationDuration: '1.8s', animationTimingFunction: 'linear' }}
				>
					{Array.from({ length: N }).map((_, i) => {
						const progress = i / N
						const angle = progress * 360
						const rad = ((angle - 90) * Math.PI) / 180
						const dotSize = 3 + progress * 9
						const opacity = 0.08 + progress * 0.92
						const cx = size / 2 + R * Math.cos(rad) - dotSize / 2
						const cy = size / 2 + R * Math.sin(rad) - dotSize / 2
						return (
							<div
								key={i}
								style={{
									position: 'absolute',
									left: cx,
									top: cy,
									width: dotSize,
									height: dotSize,
									borderRadius: '50%',
									background: 'white',
									opacity,
									boxShadow:
										progress > 0.6
											? `0 0 ${Math.round(dotSize)}px rgba(255,255,255,0.6)`
											: 'none',
								}}
							/>
						)
					})}
				</div>

				{/* Static label in the centre */}
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					<span className="text-white font-semibold text-sm tracking-[0.2em] select-none">
						{label}
					</span>
				</div>
			</div>
		</div>
	)
}
