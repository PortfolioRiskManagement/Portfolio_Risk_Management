import { useMemo, useState } from "react"

interface ProviderLogoProps {
  provider: string
  className?: string
}

const PROVIDER_META: Record<string, { domain: string; bgClass: string }> = {
  Wealthsimple: { domain: "wealthsimple.com", bgClass: "bg-black" },
  Robinhood: { domain: "robinhood.com", bgClass: "bg-emerald-600" },
  Coinbase: { domain: "coinbase.com", bgClass: "bg-blue-600" },
  Binance: { domain: "binance.com", bgClass: "bg-amber-500" },
}

export default function ProviderLogo({ provider, className = "" }: ProviderLogoProps) {
  const [imgError, setImgError] = useState(false)
  const meta = PROVIDER_META[provider]

  const logoUrl = useMemo(() => {
    if (!meta) return ""
    return `https://www.google.com/s2/favicons?sz=64&domain=${meta.domain}`
  }, [meta])

  if (!meta || imgError) {
    return (
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 ${className}`}
        aria-label={provider}
      >
        {provider.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 p-1 dark:border-zinc-700 ${meta.bgClass} ${className}`}
      aria-label={provider}
    >
      <img
        src={logoUrl}
        alt={`${provider} logo`}
        className="h-6 w-6 rounded-md bg-white object-contain"
        loading="lazy"
        onError={() => setImgError(true)}
      />
    </div>
  )
}
