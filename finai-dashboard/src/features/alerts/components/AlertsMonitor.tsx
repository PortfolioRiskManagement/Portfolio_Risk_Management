import { useEffect } from "react"
import { useAuth } from "../../../contexts/AuthContext"
import { checkForAlerts } from "../services/holdingAlertsService"

const CHECK_INTERVAL_MS = 5 * 60 * 1000

/** Runs in the background while signed in, checking holdings for big moves and news. */
export default function AlertsMonitor() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    checkForAlerts().catch(() => {})
    const t = setInterval(() => checkForAlerts().catch(() => {}), CHECK_INTERVAL_MS)
    return () => clearInterval(t)
  }, [user])

  return null
}
