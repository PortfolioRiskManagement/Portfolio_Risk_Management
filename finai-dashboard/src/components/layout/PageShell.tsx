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
<div className="min-h-screen bg-black">
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
<main className="p-6 text-white flex-1">{children}</main>
</div>
</div>
)
}