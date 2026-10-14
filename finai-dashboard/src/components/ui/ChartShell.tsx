interface Props {
title: string
height?: number
}


export default function ChartShell({ title, height = 300 }: Props) {
return (
<div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900">
<div className="mb-2 text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
{title}
</div>
<div
className="flex items-center justify-center text-zinc-500 dark:text-zinc-600"
style={{ height }}
>
Chart will render here
</div>
</div>
)
}
