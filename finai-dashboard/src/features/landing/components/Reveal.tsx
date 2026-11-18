import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react"

type RevealProps = {
	children: ReactNode
	/** Delay before the entrance starts, in ms (useful for staggering cards). */
	delay?: number
	className?: string
	as?: ElementType
}

/** Hook that reports once an element has scrolled into view. */
export function useInView<T extends Element>(threshold = 0.2) {
	const ref = useRef<T | null>(null)
	const [inView, setInView] = useState(false)

	useEffect(() => {
		const node = ref.current
		if (!node) return
		if (typeof IntersectionObserver === "undefined") {
			setInView(true)
			return
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setInView(true)
					observer.disconnect()
				}
			},
			{ threshold, rootMargin: "0px 0px -8% 0px" },
		)
		observer.observe(node)
		return () => observer.disconnect()
	}, [threshold])

	return { ref, inView }
}

/** Fades and slides its children in the first time they scroll into view. */
export default function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: RevealProps) {
	const { ref, inView } = useInView<HTMLElement>()

	return (
		<Tag
			ref={ref}
			className={`lp-reveal ${inView ? "is-visible" : ""} ${className}`}
			style={{ "--lp-delay": `${delay}ms` } as CSSProperties}
		>
			{children}
		</Tag>
	)
}
