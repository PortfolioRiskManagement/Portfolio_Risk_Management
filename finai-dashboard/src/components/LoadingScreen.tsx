import { useEffect, useState } from "react"

// Non-linear progress curve that mimics real async work
function getNonLinearProgress(step: number, totalSteps: number): number {
	const t = step / totalSteps
	const eased = 1 - Math.pow(1 - t, 3)
	return Math.min(100, eased * 100)
}

interface LoadingScreenProps {
	isVisible: boolean
}

export default function LoadingScreen({ isVisible }: LoadingScreenProps) {
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		if (!isVisible) {
			setProgress(0)
			return
		}

		let step = 0
		const totalSteps = 20
		const stepInterval = 2000 / totalSteps // ~2 seconds total

		const interval = setInterval(() => {
			step++
			const newProgress = getNonLinearProgress(step, totalSteps)
			setProgress(newProgress)

			if (step >= totalSteps) {
				clearInterval(interval)
				setProgress(100)
			}
		}, stepInterval)

		return () => clearInterval(interval)
	}, [isVisible])

	if (!isVisible) return null

	return (
		<div className="fixed inset-0 bg-black flex items-center justify-center z-50">
			<style>{`
				@keyframes spinCoin {
					from {
						transform: rotateY(0deg);
					}
					to {
						transform: rotateY(360deg);
					}
				}

				@keyframes glowPulse {
					0%, 100% {
						opacity: 0.6;
						filter: blur(8px);
					}
					50% {
						opacity: 1;
						filter: blur(12px);
					}
				}

				@keyframes shimmer {
					0% {
						left: -100%;
					}
					100% {
						left: 100%;
					}
				}

				.coin {
					perspective: 1000px;
					width: 120px;
					height: 120px;
					position: relative;
					margin: 0 auto 40px;
				}

				.coin-inner {
					width: 100%;
					height: 100%;
					position: relative;
					transform-style: preserve-3d;
					animation: spinCoin 3s linear infinite;
				}

				.coin-face {
					width: 100%;
					height: 100%;
					position: absolute;
					backface-visibility: hidden;
					display: flex;
					align-items: center;
					justify-content: center;
					border-radius: 50%;
					background: radial-gradient(circle at 30% 30%, #ffd700, #ffed4e 15%, #daa520 60%, #b8860b);
					box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), inset -2px -2px 8px rgba(0, 0, 0, 0.4), inset 2px 2px 8px rgba(255, 255, 255, 0.3);
				}

				.coin-face-back {
					transform: rotateY(180deg);
				}

				.coin-f {
					font-size: 60px;
					font-weight: 900;
					color: #2d2d2d;
					text-shadow: -2px -2px 4px rgba(255, 255, 255, 0.5), inset 1px 1px 2px rgba(0, 0, 0, 0.5);
					font-family: serif;
				}

				.glow-ring {
					position: absolute;
					inset: -20px;
					border-radius: 50%;
					background: radial-gradient(circle, rgba(255, 215, 0, 0.3), transparent);
					animation: glowPulse 2s ease-in-out infinite;
					pointer-events: none;
				}

				.progress-container {
					width: 100%;
					max-width: 400px;
					margin: 0 auto 30px;
				}

				.progress-bar {
					width: 100%;
					height: 6px;
					background: rgba(255, 255, 255, 0.1);
					border-radius: 3px;
					overflow: hidden;
					border: 1px solid rgba(255, 215, 0, 0.3);
				}

				.progress-fill {
					height: 100%;
					background: linear-gradient(90deg, #3b82f6, #6366f1, #a855f7);
					border-radius: 3px;
					position: relative;
					transition: width 0.3s ease-out;
				}

				.progress-fill::after {
					content: '';
					position: absolute;
					top: 0;
					left: 0;
					bottom: 0;
					right: 0;
					background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
					animation: shimmer 2s infinite;
				}

				.progress-text {
					display: flex;
					justify-content: center;
					align-items: center;
					margin-top: 12px;
					font-size: 12px;
				}

				.progress-number {
					color: #9ca3af;
					min-width: 40px;
					text-align: center;
				}
			`}</style>

			<div className="text-center">
				<div className="coin mb-8">
					<div className="glow-ring"></div>
					<div className="coin-inner">
						<div className="coin-face">
							<div className="coin-f">F</div>
						</div>
						<div className="coin-face coin-face-back">
							<div className="coin-f">F</div>
						</div>
					</div>
				</div>

				<h2 className="text-2xl font-bold text-white mb-2">FIN/AI</h2>
				<p className="text-xs text-zinc-500 mb-8">Intelligence Overlay</p>

				<div className="progress-container">
					<div className="progress-bar">
						<div
							className="progress-fill"
							style={{ width: `${progress}%` }}
						></div>
					</div>
					<div className="progress-text">
						<div className="progress-number">{Math.round(progress)}%</div>
					</div>
				</div>
			</div>
		</div>
	)
}
