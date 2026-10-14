interface Props {
  title?: string
  /** Optional control shown at the right of the title row, such as a link or button. */
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export default function Card({ title, action, children, className = "" }: Props) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 bg-white/80 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-sm transition-colors dark:border-white/[0.07] dark:bg-zinc-900/50 dark:shadow-none ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && (
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{title}</div>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
