import { useNavigate } from "react-router-dom"
import Card from "../../../components/ui/Card"
import { useConnections } from "../hooks/useConnections"
import ProviderLogo from "./ProviderLogo"

export default function ConnectionsPanel() {
  const { connections } = useConnections()
  const navigate = useNavigate()

  const connectedCount = connections.filter((c) => c.connected).length

  return (
    <Card title={`Connections (${connectedCount} connected)`}>
      <div className="space-y-3">
        {connections.slice(0, 6).map((c) => (
          <div
            key={c.provider}
            className="flex items-center justify-between gap-4 rounded-xl px-2 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          >
            <div className="flex items-center gap-3">
              <ProviderLogo provider={c.provider} />
              <div>
                <div className="font-medium text-zinc-950 dark:text-white">{c.provider}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {c.connected ? `Connected • ${c.accountName ?? "Account"}` : "Not connected"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {c.connected ? (
                <div className="flex items-center gap-2">
                  <div className="connected-badge inline-flex items-center gap-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-900/60 dark:text-green-300">
                    <span className="h-2 w-2 rounded-full bg-green-400" />
                    <span>Synced</span>
                  </div>
                  <button
                    onClick={() => navigate(`/connections?provider=${encodeURIComponent(c.provider)}`)}
                    type="button"
                    className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1 text-sm text-zinc-800 transition-colors hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                  >
                    Manage
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/connections?provider=${encodeURIComponent(c.provider)}`)}
                  type="button"
                  className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between border-t border-zinc-200/80 pt-2 dark:border-zinc-800/60">
          <button
            onClick={() => navigate("/connections")}
            type="button"
            className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View all connections
          </button>
        </div>
      </div>
    </Card>
  )
}
