import { useState } from 'react'
import type { Recommendation } from '../types/portfolio.types'
import Card from '../../../components/ui/Card'

interface Props {
  recommendations: Recommendation[]
}

export default function BestNextMoves({ recommendations }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      case 'medium':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400'
      case 'low':
        return 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400'
      default:
        return 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high':
        return '⚡'
      case 'medium':
        return '📊'
      case 'low':
        return '💡'
      default:
        return '💡'
    }
  }

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="mb-1 text-2xl font-bold text-zinc-950 dark:text-white">Best Next Moves</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Strategic actions to optimize your portfolio structure and maximize tax efficiency
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {recommendations.map((rec) => {
          const isExpanded = expandedId === rec.id
          const impactColor = getImpactColor(rec.impact)

          return (
            <div
              key={rec.id}
              className="cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : rec.id)}
            >
              <Card className="transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getImpactIcon(rec.impact)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full border uppercase tracking-wide font-semibold ${impactColor}`}>
                    {rec.impact} impact
                  </span>
                </div>
              </div>

              <h3 className="mb-2 leading-tight font-semibold text-zinc-950 dark:text-white">{rec.title}</h3>
              
              <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">{rec.description}</p>

              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'max-h-40 opacity-100 mb-3' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/50">
                  <div className="mb-1 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-500">Recommended Action</div>
                  <div className="text-sm text-zinc-700 dark:text-zinc-300">{rec.action}</div>
                </div>
              </div>

              <button className="w-full mt-2 py-2 px-4 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 rounded-lg text-sm text-blue-400 font-medium transition-colors">
                {isExpanded ? 'Show less' : 'Show details'}
              </button>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
