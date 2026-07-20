import React, { useEffect, useState } from 'react'
import { api, BusFactorEntry } from '../lib/api'

const RISK_STYLES = {
  critical: { border: 'border-red-500/30', badge: 'bg-red-500 text-white' },
  high: { border: 'border-amber-500/30', badge: 'bg-amber-500 text-white' },
  medium: { border: 'border-yellow-500/30', badge: 'bg-yellow-500 text-black' },
  low: { border: 'border-emerald-500/30', badge: 'bg-emerald-500 text-white' },
}

export default function BusFactorPage() {
  const [data, setData] = useState<BusFactorEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<BusFactorEntry | null>(null)
  const [depth, setDepth] = useState(2)

  useEffect(() => {
    setLoading(true)
    api.busFactor(depth).then((d) => { setData(d); setLoading(false) })
  }, [depth])

  if (loading) return <Spinner text="Calculating bus factor..." />

  const critical = data.filter((d) => d.risk === 'critical').length
  const high = data.filter((d) => d.risk === 'high').length

  return (
    <div className="h-full flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-fg">Bus Factor</h2>
          <p className="text-sm text-fg-muted mt-0.5">How many people need to leave before knowledge is lost?</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-fg-faint">Folder depth:</span>
          <select
            value={depth}
            onChange={(e) => setDepth(parseInt(e.target.value))}
            className="bg-surface-1 border border-surface-3 rounded-lg px-3 py-1.5 text-sm font-bold text-fg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
          >
            <option value={1}>1 level</option>
            <option value={2}>2 levels</option>
            <option value={3}>3 levels</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-1 rounded-xl border border-surface-3 p-4 shadow-sm">
          <p className="text-xs text-fg-faint font-semibold">Modules Analyzed</p>
          <p className="text-2xl font-bold text-fg tabular-nums">{data.length}</p>
        </div>
        <div className="bg-surface-1 rounded-xl border border-surface-3 p-4 shadow-sm">
          <p className="text-xs text-fg-faint font-semibold">Critical (1 person &gt;80%)</p>
          <p className="text-2xl font-bold text-red-500 tabular-nums">{critical}</p>
        </div>
        <div className="bg-surface-1 rounded-xl border border-surface-3 p-4 shadow-sm">
          <p className="text-xs text-fg-faint font-semibold">High Risk</p>
          <p className="text-2xl font-bold text-amber-500 tabular-nums">{high}</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex gap-4">
        <div className="flex-1 overflow-auto space-y-2">
          {data.map((entry) => {
            const style = RISK_STYLES[entry.risk as keyof typeof RISK_STYLES] || RISK_STYLES.low
            return (
              <div
                key={entry.folder}
                onClick={() => setSelected(entry)}
                className={`bg-surface-1 border rounded-xl p-4 cursor-pointer hover:bg-surface-2 transition-all shadow-sm ${
                  selected?.folder === entry.folder ? style.border : 'border-surface-3'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${style.badge}`}>
                      BF={entry.busFactor}
                    </span>
                    <span className="text-sm font-bold text-fg">{entry.folder}/</span>
                  </div>
                  <span className="text-xs font-semibold text-fg-faint tabular-nums">{entry.totalCommits} commits</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {entry.contributors.slice(0, 5).map((c) => (
                    <div
                      key={c.name}
                      className="h-2 rounded-full"
                      style={{
                        width: `${c.percentage}%`,
                        backgroundColor: c.percentage > 50 ? '#ef4444' : c.percentage > 25 ? '#f59e0b' : '#6366f1',
                        minWidth: '4px',
                      }}
                      title={`${c.name}: ${c.percentage}%`}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {selected && (
          <div className="w-80 bg-surface-1 rounded-xl border border-surface-3 p-5 overflow-auto shrink-0 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-fg">{selected.folder}/</h3>
              <button onClick={() => setSelected(null)} className="text-fg-faint hover:text-fg transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="mb-4">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${RISK_STYLES[selected.risk as keyof typeof RISK_STYLES]?.badge}`}>
                {selected.risk.toUpperCase()}
              </span>
              <p className="text-xs text-fg-faint mt-2 font-medium">
                Bus Factor: {selected.busFactor} — {selected.busFactor === 1
                  ? 'only 1 person has >50% of knowledge'
                  : `${selected.busFactor} people needed for 50% coverage`}
              </p>
            </div>

            <div className="space-y-3">
              {selected.contributors.map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-fg font-semibold">{c.name}</span>
                    <span className="text-fg-faint font-bold tabular-nums">{c.percentage}% ({c.commits})</span>
                  </div>
                  <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${c.percentage}%`,
                        backgroundColor: c.percentage > 50 ? '#ef4444' : c.percentage > 25 ? '#f59e0b' : '#6366f1',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Spinner({ text }: { text: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex items-center gap-3 text-fg-muted">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        {text}
      </div>
    </div>
  )
}
