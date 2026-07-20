import React, { useEffect, useState } from 'react'
import { api, FileRisk } from '../lib/api'

const RISK_COLOR = (score: number) =>
  score >= 70 ? 'text-red-500' : score >= 45 ? 'text-amber-500' : score >= 25 ? 'text-yellow-500' : 'text-emerald-500'

const RISK_BG = (score: number) =>
  score >= 70 ? 'bg-red-500' : score >= 45 ? 'bg-amber-500' : score >= 25 ? 'bg-yellow-500' : 'bg-emerald-500'

const RISK_LABEL = (score: number) =>
  score >= 70 ? 'Critical' : score >= 45 ? 'High' : score >= 25 ? 'Medium' : 'Low'

export default function RiskDashboard() {
  const [data, setData] = useState<FileRisk[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<FileRisk | null>(null)

  useEffect(() => {
    api.risk(100).then((d) => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <Spinner text="Calculating risk scores..." />

  const critical = data.filter((f) => f.score >= 70).length
  const high = data.filter((f) => f.score >= 45 && f.score < 70).length
  const medium = data.filter((f) => f.score >= 25 && f.score < 45).length

  return (
    <div className="h-full flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-fg">Risk Dashboard</h2>
        <p className="text-sm text-fg-muted mt-0.5">Files scored by churn, ownership concentration, and staleness</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Files Analyzed" value={data.length} />
        <StatCard label="Critical" value={critical} color="text-red-500" />
        <StatCard label="High Risk" value={high} color="text-amber-500" />
        <StatCard label="Medium" value={medium} color="text-yellow-500" />
      </div>

      <div className="flex-1 min-h-0 flex gap-4">
        <div className="flex-1 bg-surface-1 rounded-xl border border-surface-3 overflow-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface-1 z-10">
              <tr className="border-b border-surface-3 text-left">
                <th className="px-4 py-3 text-xs text-fg-faint font-medium w-16">Score</th>
                <th className="px-4 py-3 text-xs text-fg-faint font-medium">File</th>
                <th className="px-4 py-3 text-xs text-fg-faint font-medium text-right">Churn</th>
                <th className="px-4 py-3 text-xs text-fg-faint font-medium text-right">Ownership</th>
                <th className="px-4 py-3 text-xs text-fg-faint font-medium text-right">Age</th>
                <th className="px-4 py-3 text-xs text-fg-faint font-medium">Top Owner</th>
              </tr>
            </thead>
            <tbody>
              {data.map((f) => (
                <tr
                  key={f.path}
                  onClick={() => setSelected(f)}
                  className={`border-b border-surface-3/50 hover:bg-surface-2 cursor-pointer transition-colors ${
                    selected?.path === f.path ? 'bg-surface-2' : ''
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${RISK_BG(f.score)}`} />
                      <span className={`font-semibold tabular-nums ${RISK_COLOR(f.score)}`}>{f.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-fg truncate max-w-xs font-mono text-xs">{f.path}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Bar value={f.churnScore} color="bg-blue-500" />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Bar value={f.ownershipScore} color="bg-purple-500" />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Bar value={f.ageScore} color="bg-orange-500" />
                  </td>
                  <td className="px-4 py-2.5 text-fg-muted text-xs truncate max-w-[120px]">
                    {f.topOwner} ({f.topOwnerPct}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="w-72 bg-surface-1 rounded-xl border border-surface-3 p-5 overflow-auto shrink-0 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${RISK_BG(selected.score)} text-white`}>
                {RISK_LABEL(selected.score)}
              </span>
              <CloseBtn onClick={() => setSelected(null)} />
            </div>
            <h3 className="text-sm font-semibold text-fg mb-1 break-all font-mono">{selected.path}</h3>
            <p className={`text-3xl font-bold mb-5 ${RISK_COLOR(selected.score)} tabular-nums`}>{selected.score}</p>

            <div className="space-y-4">
              <ScoreBreakdown label="Churn" value={selected.churnScore} detail={`${selected.commits} commits`} color="bg-blue-500" />
              <ScoreBreakdown label="Ownership" value={selected.ownershipScore} detail={`${selected.authors} author${selected.authors > 1 ? 's' : ''}`} color="bg-purple-500" />
              <ScoreBreakdown label="Staleness" value={selected.ageScore} detail={`${selected.daysSinceLastChange}d ago`} color="bg-orange-500" />
            </div>

            <div className="mt-5 pt-5 border-t border-surface-3">
              <p className="text-xs text-fg-faint mb-1">Primary Owner</p>
              <p className="text-sm text-fg font-medium">{selected.topOwner}</p>
              <p className="text-xs text-fg-faint">{selected.topOwnerPct}% of lines</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 justify-end">
      <span className="text-xs text-fg-faint w-6 text-right tabular-nums">{value}</span>
      <div className="w-16 h-1.5 bg-surface-3 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function ScoreBreakdown({ label, value, detail, color }: { label: string; value: number; detail: string; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-fg-muted">{label}</span>
        <span className="text-fg tabular-nums">{value}/100</span>
      </div>
      <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
      <p className="text-xs text-fg-faint mt-0.5">{detail}</p>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-surface-1 rounded-xl border border-surface-3 p-4 shadow-sm">
      <p className="text-xs text-fg-faint">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${color || 'text-fg'}`}>{value}</p>
    </div>
  )
}

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-fg-faint hover:text-fg transition-colors">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
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
