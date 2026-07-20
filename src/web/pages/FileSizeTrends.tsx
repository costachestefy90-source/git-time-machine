import React, { useEffect, useState, useRef } from 'react'
import * as d3 from 'd3'
import { api, FileSizePoint } from '../lib/api'

export default function FileSizeTrends() {
  const [files, setFiles] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [selectedFile, setSelectedFile] = useState('')
  const [trend, setTrend] = useState<FileSizePoint[]>([])
  const [loading, setLoading] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    api.files().then((f) => {
      setFiles(f.filter((p) => /\.(ts|tsx|js|jsx|py|java|cs|go|rs|rb|php|c|cpp|h|hpp)$/.test(p)))
    })
  }, [])

  useEffect(() => {
    if (!selectedFile) return
    setLoading(true)
    api.fileTrend(selectedFile).then((t) => { setTrend(t); setLoading(false) })
  }, [selectedFile])

  useEffect(() => {
    if (!trend.length || !svgRef.current) return
    drawTrend(svgRef.current, trend)
  }, [trend])

  const filteredFiles = search
    ? files.filter((f) => f.toLowerCase().includes(search.toLowerCase())).slice(0, 20)
    : []

  const growth = trend.length >= 2
    ? ((trend[trend.length - 1].lines - trend[0].lines) / Math.max(trend[0].lines, 1) * 100).toFixed(0)
    : null

  return (
    <div className="h-full flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-fg">File Size Trends</h2>
        <p className="text-sm text-fg-muted mt-0.5">Track how files grow over time — catch complexity creep early</p>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedFile('') }}
          className="w-full bg-surface-1 border border-surface-3 rounded-lg px-3 py-2 text-sm font-medium text-fg placeholder-fg-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
        />
        {filteredFiles.length > 0 && !selectedFile && (
          <div className="absolute mt-1 w-full bg-surface-1 border border-surface-3 rounded-lg max-h-48 overflow-auto z-10 shadow-lg">
            {filteredFiles.map((f) => (
              <button
                key={f}
                onClick={() => { setSelectedFile(f); setSearch(f) }}
                className="block w-full text-left px-3 py-2 text-sm text-fg-muted hover:bg-surface-2 hover:text-fg truncate font-mono transition-colors"
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-fg-muted">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Loading file history...
          </div>
        </div>
      )}

      {!loading && trend.length > 0 && (
        <>
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Current Lines" value={trend[trend.length - 1].lines} />
            <StatCard label="Data Points" value={trend.length} />
            <StatCard
              label="Growth"
              value={`${growth}%`}
              color={parseInt(growth!) > 50 ? 'text-red-500' : parseInt(growth!) > 0 ? 'text-amber-500' : 'text-emerald-500'}
            />
            <StatCard label="First Seen" value={new Date(trend[0].date).toLocaleDateString()} />
          </div>

          <div className="flex-1 min-h-0 bg-surface-1 rounded-xl border border-surface-3 p-5 shadow-sm">
            <svg ref={svgRef} className="w-full h-full" style={{ minHeight: 250 }} />
          </div>

          <div className="bg-surface-1 rounded-xl border border-surface-3 overflow-auto max-h-48 shadow-sm">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-surface-1">
                <tr className="border-b border-surface-3">
                  <th className="px-3 py-2 text-fg-faint font-bold text-left">Commit</th>
                  <th className="px-3 py-2 text-fg-faint font-bold text-left">Date</th>
                  <th className="px-3 py-2 text-fg-faint font-bold text-left">Author</th>
                  <th className="px-3 py-2 text-fg-faint font-bold text-right">Lines</th>
                  <th className="px-3 py-2 text-fg-faint font-bold text-right">Delta</th>
                  <th className="px-3 py-2 text-fg-faint font-bold text-left">Message</th>
                </tr>
              </thead>
              <tbody>
                {trend.map((p, i) => {
                  const delta = i > 0 ? p.lines - trend[i - 1].lines : 0
                  return (
                    <tr key={p.hash} className="border-b border-surface-3/50 hover:bg-surface-2 transition-colors">
                      <td className="px-3 py-1.5 font-mono font-bold text-accent-light">{p.hash.slice(0, 8)}</td>
                      <td className="px-3 py-1.5 text-fg-muted">{new Date(p.date).toLocaleDateString()}</td>
                      <td className="px-3 py-1.5 text-fg font-semibold">{p.author}</td>
                      <td className="px-3 py-1.5 text-right text-fg font-bold tabular-nums">{p.lines}</td>
                      <td className={`px-3 py-1.5 text-right font-bold tabular-nums ${delta > 0 ? 'text-red-500' : delta < 0 ? 'text-emerald-500' : 'text-fg-faint'}`}>
                        {delta > 0 ? `+${delta}` : delta || '—'}
                      </td>
                      <td className="px-3 py-1.5 text-fg-faint truncate max-w-xs">{p.message}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!selectedFile && !loading && (
        <div className="flex-1 flex items-center justify-center text-fg-faint font-medium">
          Search for a file to see how its size changed over time
        </div>
      )}
    </div>
  )
}

function drawTrend(svg: SVGSVGElement, data: FileSizePoint[]) {
  const d3svg = d3.select(svg)
  d3svg.selectAll('*').remove()

  const width = svg.clientWidth
  const height = svg.clientHeight
  const margin = { top: 20, right: 20, bottom: 30, left: 50 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const g = d3svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  const x = d3.scaleTime()
    .domain(d3.extent(data, (d) => new Date(d.date)) as [Date, Date])
    .range([0, innerW])

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, (d) => d.lines)! * 1.1])
    .range([innerH, 0])

  g.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(x).ticks(6))
    .selectAll('text').attr('fill', 'var(--chart-text)').attr('font-size', '10px').attr('font-weight', '600')
  g.append('g').call(d3.axisLeft(y).ticks(5))
    .selectAll('text').attr('fill', 'var(--chart-text)').attr('font-size', '10px').attr('font-weight', '600')
  g.selectAll('.domain, .tick line').attr('stroke', 'var(--chart-axis)')

  const area = d3.area<FileSizePoint>()
    .x((d) => x(new Date(d.date)))
    .y0(innerH)
    .y1((d) => y(d.lines))
    .curve(d3.curveMonotoneX)

  g.append('path')
    .datum(data)
    .attr('fill', 'url(#areaGrad)')
    .attr('d', area)

  const grad = d3svg.append('defs').append('linearGradient')
    .attr('id', 'areaGrad').attr('x1', '0').attr('y1', '0').attr('x2', '0').attr('y2', '1')
  grad.append('stop').attr('offset', '0%').attr('stop-color', '#6366f1').attr('stop-opacity', 0.3)
  grad.append('stop').attr('offset', '100%').attr('stop-color', '#6366f1').attr('stop-opacity', 0.02)

  const line = d3.line<FileSizePoint>()
    .x((d) => x(new Date(d.date)))
    .y((d) => y(d.lines))
    .curve(d3.curveMonotoneX)

  g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#6366f1')
    .attr('stroke-width', 2)
    .attr('d', line)

  g.selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', (d) => x(new Date(d.date)))
    .attr('cy', (d) => y(d.lines))
    .attr('r', 3)
    .attr('fill', '#6366f1')
    .attr('stroke', '#818cf8')
    .attr('stroke-width', 1)
    .append('title')
    .text((d) => `${d.lines} lines — ${d.author}: ${d.message}`)
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-surface-1 rounded-xl border border-surface-3 p-4 shadow-sm">
      <p className="text-xs text-fg-faint font-semibold">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${color || 'text-fg'}`}>{value}</p>
    </div>
  )
}
