import { useEffect, useState } from "react"
import { ALERTS_EVENT, getAlerts, getSettings, type AlertSettings, type HoldingAlert } from "../services/holdingAlertsService"

/** Stored holding alerts and settings, kept in sync across the app. */
export function useHoldingAlerts() {
  const [alerts, setAlerts] = useState<HoldingAlert[]>(getAlerts)
  const [settings, setSettings] = useState<AlertSettings>(getSettings)

  useEffect(() => {
    const sync = () => {
      setAlerts(getAlerts())
      setSettings(getSettings())
    }
    window.addEventListener(ALERTS_EVENT, sync)
    // other tabs
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(ALERTS_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const unreadCount = alerts.filter(a => !a.read).length
  return { alerts, settings, unreadCount }
}
