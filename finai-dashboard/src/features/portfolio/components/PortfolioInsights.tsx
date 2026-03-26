import type { PortfolioInsight } from '../types/portfolio.types'
import Card from '../../../components/ui/Card'

interface Props {
  insights: PortfolioInsight[]
}

export default function PortfolioInsights({ insights }: Props) {
  const opportunities = insights.filter((i) => i.type === 'opportunity')
  const frictions = insights.filter((i) => i.type === 'friction')

  const getSeverityStyle = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/30'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30'
      default:
        return 'bg-blue-500/10 border-blue-500/30'
    }
  }

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return '🚨'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-1">Portfolio Opportunities & Friction</h2>
        <p className="text-sm text-zinc-400">
          What's helping or hurting your portfolio structure
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Opportunities */}
        <div>
          <h3 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            Opportunities ({opportunities.length})
          </h3>
          <div className="space-y-3">
            {opportunities.map((insight, index) => (
              <Card
                key={index}
                className="border-emerald-900/30 hover:border-emerald-800/50 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✅</div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">{insight.title}</h4>
                    <p className="text-sm text-zinc-400 mb-2">{insight.description}</p>
                    {insight.metric && (
                      <div className="inline-block px-3 py-1 bg-emerald-950/30 border border-emerald-900/40 rounded-full text-xs text-emerald-400 font-medium">
                        {insight.metric}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {opportunities.length === 0 && (
              <Card className="text-center py-6">
                <div className="text-zinc-500 text-sm">No opportunities detected at this time</div>
              </Card>
            )}
          </div>
        </div>

        {/* Friction Points */}
        <div>
          <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
            <span className="text-xl">⚡</span>
            Friction Points ({frictions.length})
          </h3>
          <div className="space-y-3">
            {frictions.map((insight, index) => (
              <Card
                key={index}
                className={`border transition-all ${getSeverityStyle(insight.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getSeverityIcon(insight.severity)}</div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">{insight.title}</h4>
                    <p className="text-sm text-zinc-400 mb-2">{insight.description}</p>
                    {insight.metric && (
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        insight.severity === 'critical'
                          ? 'bg-red-950/30 border border-red-900/40 text-red-400'
                          : insight.severity === 'warning'
                          ? 'bg-yellow-950/30 border border-yellow-900/40 text-yellow-400'
                          : 'bg-blue-950/30 border border-blue-900/40 text-blue-400'
                      }`}>
                        {insight.metric}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {frictions.length === 0 && (
              <Card className="text-center py-6 border-emerald-900/30">
                <div className="text-emerald-400 text-sm font-medium mb-1">All Clear! ✓</div>
                <div className="text-zinc-500 text-xs">No friction points detected</div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
