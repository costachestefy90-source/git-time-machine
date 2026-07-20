import React, { useEffect, useState, useRef } from 'react'
import * as d3 from 'd3'
import { api, ContributorStats } from '../lib/api'

export default function ContributorDNA() {
  const [contributors, setContributors] = useState<ContributorStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ContributorStats | null>(null)
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    api.contributors().then((c) => { setContributors(c); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!contributors.length || !svgRef.current || view !== 'chart') return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const margin = { top: 20, right: 30, bottom: 60, left: 60 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleBand()
      .domain(contributors.slice(0, 20).map((c) => c.name))
      .range([0, innerW])
      .padding(0.3)

    const maxCommits = d3.max(contributors.slice(0, 20), (c) => c.commits) || 1
    const y = d3.scaleLinear().domain([0, maxCommits]).range([innerH, 0])

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-40)')
      .attr('text-anchor', 'end')
      .attr('fill', 'var(--chart-text)')
      .attr('font-size', '11px')
      .attr('font-weight', '500')

    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', 'var(--chart-text)')
      .attr('font-size', '11px')

    g.selectAll('.domain, .tick line').attr('stroke', 'var(--chart-axis)')

    g.selectAll('rect.bar')
      .data(contributors.slice(0, 20))
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (c) => x(c.name)!)
      .attr('width', x.bandwidth())
      .attr('y', innerH)
      .attr('height', 0)
      .attr('rx', 4)
      .attr('fill', '#6366f1')
      .attr('cursor', 'pointer')
      .on('click', (_e, c) => setSelected(c))
      .on('mouseenter', function () { d3.select(this).attr('fill', '#818cf8') })
      .on('mouseleave', function () { d3.select(this).attr('fill', '#6366f1') })
      .transition()
      .duration(600)
      .delay((_, i) => i * 30)
      .attr('y', (c) => y(c.commits))
      .attr('height', (c) => innerH - y(c.commits))

    const addLine = contributors.slice(0, 20)
    const lineY = d3.scaleLinear()
      .domain([0, d3.max(addLine, (c) => c.additions) || 1])
      .range([innerH, 0])

    const line = d3.line<ContributorStats>()
      .x((c) => x(c.name)! + x.bandwidth() / 2)
      .y((c) => lineY(c.additions))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(addLine)
      .attr('fill', 'none')
      .attr('stroke', '#22c55e')
      .attr('stroke-width', 2)
      .attr('d', line)
      .attr('opacity', 0.6)

  }, [contributors, view])

  if (loading) return <Spinner text="Analyzing contributors..." />

  return (
    <div className="h-full flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-fg">Contributors</h2>
          <p className="text-sm text-fg-muted mt-0.5">Who owns what — expertise and activity mapping</p>
        </div>
        <div className="flex gap-0.5 bg-surface-1 rounded-lg p-1 border border-surface-3">
          <button
            onClick={() => setView('chart')}
            className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-all ${view === 'chart' ? 'bg-accent text-white shadow-sm' : 'text-fg-muted hover:text-fg'}`}
          >Chart</button>
          <button
            onClick={() => setView('table')}
            className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-all ${view === 'table' ? 'bg-accent text-white shadow-sm' : 'text-fg-muted hover:text-fg'}`}
          >Table</button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex gap-4">
        {view === 'chart' ? (
          <div className="flex-1 bg-surface-1 rounded-xl border border-surface-3 p-4 overflow-hidden shadow-sm">
            <svg ref={svgRef} className="w-full h-full" />
          </div>
        ) : (
          <div className="flex-1 bg-surface-1 rounded-xl border border-surface-3 overflow-auto shadow-sm">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-1">
                <tr className="border-b border-surface-3 text-left">
                  <th className="px-4 py-3 text-xs text-fg-faint font-semibold">Contributor</th>
                  <th className="px-4 py-3 text-xs text-fg-faint font-semibold text-right">Commits</th>
                  <th className="px-4 py-3 text-xs text-fg-faint font-semibold text-right">Additions</th>
                  <th className="px-4 py-3 text-xs text-fg-faint font-semibold text-right">Deletions</th>
                  <th className="px-4 py-3 text-xs text-fg-faint font-semibold text-right">Files</th>
                  <th className="px-4 py-3 text-xs text-fg-faint font-semibold">Active</th>
                </tr>
              </thead>
              <tbody>
                {contributors.map((c) => (
                  <tr
                    key={c.email}
                    onClick={() => setSelected(c)}
                    className="border-b border-surface-3/50 hover:bg-surface-2 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-fg">{c.name}</div>
                      <div className="text-xs text-fg-faint font-mono">{c.email}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-fg tabular-nums">{c.commits}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-emerald-500 tabular-nums">+{c.additions}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-red-500 tabular-nums">-{c.deletions}</td>
                    <td className="px-4 py-2.5 text-right text-fg-muted tabular-nums">{c.files.length}</td>
                    <td className="px-4 py-2.5 text-xs text-fg-faint">
                      {new Date(c.firstCommit).toLocaleDateString('en', { month: 'short', year: '2-digit' })}
                      {' → '}
                      {new Date(c.lastCommit).toLocaleDateString('en', { month: 'short', year: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selected && (
          <div className="w-80 bg-surface-1 rounded-xl border border-surface-3 p-5 overflow-auto shrink-0 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-fg">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="text-fg-faint hover:text-fg transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p className="text-xs text-fg-faint mb-4 font-mono">{selected.email}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatCard label="Commits" value={selected.commits} />
              <StatCard label="Files" value={selected.files.length} />
              <StatCard label="Added" value={`+${selected.additions}`} color="text-emerald-500" />
              <StatCard label="Deleted" value={`-${selected.deletions}`} color="text-red-500" />
            </div>

            <div>
              <p className="text-xs text-fg-faint font-semibold mb-2">Top files ({selected.files.length} total)</p>
              <div className="space-y-1 max-h-60 overflow-auto">
                {selected.files.slice(0, 30).map((f) => (
                  <div key={f} className="text-xs text-fg-muted truncate py-0.5 font-mono">{f}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-surface-2 rounded-lg p-3">
      <p className="text-xs text-fg-faint">{label}</p>
      <p className={`text-lg font-bold tabular-nums ${color || 'text-fg'}`}>{value}</p>
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
