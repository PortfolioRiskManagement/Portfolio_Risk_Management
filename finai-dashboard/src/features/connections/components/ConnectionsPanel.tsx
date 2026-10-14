import { useNavigate } from "react-router-dom"
import Card from "../../../components/ui/Card"
import { useConnections } from "../hooks/useConnections"
import ProviderLogo from "./ProviderLogo"

export default function ConnectionsPanel() {
  const { connections } = useConnections()
  const navigate = useNavigate()

  const connectedCount = connections.filter((c) => c.connected).length

  return (
    <Card
      title="Connections"
      className="h-full"
      action={
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
          {connectedCount} of {connections.length} linked
        </span>
      }
    >
      <div className="-mx-2 space-y-1">
        {connections.slice(0, 6).map((c) => (
          <div
            key={c.provider}
            className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-zinc-100/80 dark:hover:bg-white/[0.04]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <ProviderLogo provider={c.provider} />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-zinc-950 dark:text-white">{c.provider}</div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className={`h-1.5 w-1.5 rounded-full ${c.connected ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"}`} />
                  {c.connected ? `Synced · ${c.accountName ?? "Account"}` : "Not connected"}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/connections?provider=${encodeURIComponent(c.provider)}`)}
              type="button"
              className={
                c.connected
                  ? "shrink-0 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5"
                  : "shrink-0 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-400/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
              }
            >
              {c.connected ? "Manage" : "Connect"}
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/connections")}
        type="button"
        className="mt-3 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        View all connections →
      </button>
    </Card>
  )
}
