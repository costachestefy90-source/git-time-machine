import React, { useEffect, useState } from 'react'
import { api, StaleFile } from '../lib/api'

export default function StaleCodeFinder() {
  const [data, setData] = useState<StaleFile[]>([])
  const [loading, setLoading] = useState(true)
  const [threshold, setThreshold] = useState(180)

  useEffect(() => {
    setLoading(true)
    api.stale(threshold).then((d) => { setData(d); setLoading(false) })
  }, [threshold])

  const totalFiles = data.length
  const avgAge = totalFiles ? Math.round(data.reduce((a, f) => a + f.daysSinceChange, 0) / totalFiles) : 0
  const oldest = data[0]

  return (
    <div className="h-full flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-fg">Stale Code</h2>
          <p className="text-sm text-fg-muted mt-0.5">Files untouched for extended periods — potential dead code or tech debt</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-fg-faint">Threshold:</span>
          <select
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value))}
            className="bg-surface-1 border border-surface-3 rounded-lg px-3 py-1.5 text-sm font-bold text-fg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
          >
            <option value={90}>90 days</option>
            <option value={180}>6 months</option>
            <option value={365}>1 year</option>
            <option value={730}>2 years</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-fg-muted">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Scanning for stale files...
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface-1 rounded-xl border border-surface-3 p-4 shadow-sm">
              <p className="text-xs text-fg-faint font-semibold">Stale Files</p>
              <p className="text-2xl font-bold text-amber-500 tabular-nums">{totalFiles}</p>
            </div>
            <div className="bg-surface-1 rounded-xl border border-surface-3 p-4 shadow-sm">
              <p className="text-xs text-fg-faint font-semibold">Avg Age</p>
              <p className="text-2xl font-bold text-fg tabular-nums">{avgAge}d</p>
            </div>
            <div className="bg-surface-1 rounded-xl border border-surface-3 p-4 shadow-sm">
              <p className="text-xs text-fg-faint font-semibold">Oldest</p>
              <p className="text-2xl font-bold text-red-500 tabular-nums">{oldest?.daysSinceChange || 0}d</p>
              <p className="text-xs text-fg-faint truncate font-mono">{oldest?.path}</p>
            </div>
          </div>

          <div className="flex-1 min-h-0 bg-surface-1 rounded-xl border border-surface-3 overflow-auto shadow-sm">
            {data.length === 0 ? (
              <div className="flex items-center justify-center h-full text-fg-faint font-medium">
                No stale files found with threshold of {threshold} days
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-surface-1 z-10">
                  <tr className="border-b border-surface-3 text-left">
                    <th className="px-4 py-3 text-xs text-fg-faint font-bold">File</th>
                    <th className="px-4 py-3 text-xs text-fg-faint font-bold text-right">Days Stale</th>
                    <th className="px-4 py-3 text-xs text-fg-faint font-bold text-right">Commits</th>
                    <th className="px-4 py-3 text-xs text-fg-faint font-bold">Last Author</th>
                    <th className="px-4 py-3 text-xs text-fg-faint font-bold">Last Change</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((f) => (
                    <tr key={f.path} className="border-b border-surface-3/50 hover:bg-surface-2 transition-colors">
                      <td className="px-4 py-2.5 text-fg truncate max-w-sm font-mono text-xs font-medium">{f.path}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`font-bold tabular-nums ${
                          f.daysSinceChange > 730 ? 'text-red-500' :
                          f.daysSinceChange > 365 ? 'text-amber-500' : 'text-yellow-500'
                        }`}>
                          {f.daysSinceChange}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-fg-muted font-semibold tabular-nums">{f.totalCommits}</td>
                      <td className="px-4 py-2.5 text-fg-muted text-xs font-medium">{f.lastAuthor}</td>
                      <td className="px-4 py-2.5 text-fg-faint text-xs">{f.lastMessage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
