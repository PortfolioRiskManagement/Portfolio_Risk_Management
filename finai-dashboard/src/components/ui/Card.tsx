interface Props {
title?: string
children: React.ReactNode
className?: string
}


export default function Card({ title, children, className = "" }: Props) {
return (
<div className={`rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
{title && (
<div className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
{title}
</div>
)}
{children}
</div>
)
}
