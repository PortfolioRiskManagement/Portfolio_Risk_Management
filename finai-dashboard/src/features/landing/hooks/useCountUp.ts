import { useEffect, useState } from "react"

/** Animates a number from 0 to `target` once `start` becomes true. */
export function useCountUp(target: number, start: boolean, duration = 1600) {
	const [value, setValue] = useState(0)

	useEffect(() => {
		if (!start) return

		const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
		if (reduceMotion) {
			setValue(target)
			return
		}

		let frame = 0
		const startedAt = performance.now()

		function tick(now: number) {
			const progress = Math.min((now - startedAt) / duration, 1)
			const eased = 1 - Math.pow(1 - progress, 3)
			setValue(target * eased)
			if (progress < 1) frame = requestAnimationFrame(tick)
		}

		frame = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(frame)
	}, [target, start, duration])

	return value
}
