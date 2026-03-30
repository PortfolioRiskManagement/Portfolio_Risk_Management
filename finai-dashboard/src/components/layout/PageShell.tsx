import { useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"


interface Props {
title: string
children: React.ReactNode
}


export default function PageShell({ title, children }: Props) {
const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

return (
<div className="min-h-screen bg-zinc-50 transition-colors dark:bg-black">
<Sidebar
isCollapsed={isSidebarCollapsed}
onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
/>
<div
className={`min-h-screen flex flex-col transition-[padding-left] duration-300 ${
isSidebarCollapsed ? "pl-16" : "pl-64"
}`}
>
<Header title={title} />
<main className="flex-1 p-6 text-zinc-900 transition-colors dark:text-white">{children}</main>
</div>
</div>
)
}
