import PageShell from "../../../components/layout/PageShell"
import Card from "../../../components/ui/Card"
import { useConnections } from "../hooks/useConnections"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

export default function ConnectionsPage() {
  const { connections, connect, disconnect } = useConnections()
  const [searchParams] = useSearchParams()
  const pre = searchParams.get("provider") || undefined
  const [selected, setSelected] = useState<string | undefined>(pre)
  const [accountName, setAccountName] = useState("")

  useEffect(() => {
    if (pre) setSelected(pre)
  }, [pre])

  const items = useMemo(() => connections, [connections])

  return (
    <PageShell title="Connections">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card title="Manage Connections">
            <div className="space-y-3">
              {items.map((c) => (
                <div
                  key={c.provider}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 transition-colors dark:border-zinc-800"
                >
                  <div>
                    <div className="font-medium text-zinc-950 dark:text-white">{c.provider}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {c.connected ? `Connected • ${c.accountName ?? "Account"}` : "Not connected"}
                    </div>
                  </div>
                  <div className="space-x-2">
                    {c.connected ? (
                      <button
                        onClick={() => disconnect(c.provider)}
                        type="button"
                        className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1 text-sm text-zinc-800 transition-colors hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelected(c.provider)}
                        type="button"
                        className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card title={selected ? `Connect: ${selected}` : "Quick Connect"}>
            <div className="space-y-3">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Select a provider to start the connection flow. Once you submit, the provider stays marked as connected when you come back.
              </div>
              <div>
                <select
                  value={selected ?? ""}
                  onChange={(e) => setSelected(e.target.value || undefined)}
                  className="w-full rounded-lg border border-zinc-200 bg-white p-2 text-zinc-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                >
                  <option value="">-- choose provider --</option>
                  {items.map((c) => (
                    <option key={c.provider} value={c.provider}>{c.provider}</option>
                  ))}
                </select>
              </div>

              {selected && (
                <div>
                  <label className="text-xs text-zinc-500 dark:text-zinc-400">Account display name</label>
                  <input
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="My Fidelity Account"
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2 text-zinc-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => selected && connect(selected, accountName || undefined)}
                  disabled={!selected}
                  type="button"
                  className="w-full rounded-lg bg-blue-600 px-3 py-2 font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  {selected ? `Connect ${selected}` : "Select a provider"}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
