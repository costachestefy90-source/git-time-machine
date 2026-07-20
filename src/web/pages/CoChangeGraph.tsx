import React, { useEffect, useState, useRef } from 'react'
import * as d3 from 'd3'
import { api, CoChangePair } from '../lib/api'

export default function CoChangeGraph() {
  const [data, setData] = useState<CoChangePair[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<CoChangePair | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    api.cochange(3).then((d) => { setData(d); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!data.length || !svgRef.current) return
    drawGraph(svgRef.current, data, setSelected)
  }, [data])

  if (loading) return <Spinner text="Analyzing co-change patterns..." />

  return (
    <div className="h-full flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-fg">Co-Change Graph</h2>
        <p className="text-sm text-fg-muted mt-0.5">Files that always change together — hidden coupling that might need refactoring</p>
      </div>

      <div className="flex-1 min-h-0 flex gap-4">
        <div className="flex-1 bg-surface-1 rounded-xl border border-surface-3 overflow-hidden shadow-sm">
          <svg ref={svgRef} className="w-full h-full" />
        </div>

        <div className="w-80 bg-surface-1 rounded-xl border border-surface-3 overflow-auto shrink-0 shadow-sm">
          <div className="p-4 border-b border-surface-3">
            <h3 className="text-sm font-bold text-fg">Top Co-Changes</h3>
            <p className="text-xs text-fg-faint mt-1 font-medium">{data.length} pairs found</p>
          </div>
          <div className="divide-y divide-surface-3/50">
            {data.slice(0, 30).map((pair, i) => (
              <button
                key={i}
                onClick={() => setSelected(pair)}
                className={`w-full text-left px-4 py-3 hover:bg-surface-2 transition-colors ${
                  selected === pair ? 'bg-surface-2' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-accent-light tabular-nums">{pair.cochanges}x</span>
                  <span className="text-xs font-semibold text-fg-faint tabular-nums">{pair.confidence}% confidence</span>
                </div>
                <p className="text-xs text-fg font-medium truncate">{shortName(pair.fileA)}</p>
                <p className="text-xs text-fg-faint truncate">↔ {shortName(pair.fileB)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="bg-surface-1 rounded-xl border border-surface-3 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-fg">Coupling Detail</h3>
            <button onClick={() => setSelected(null)} className="text-fg-faint hover:text-fg transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-fg-faint mb-1 font-semibold">File A</p>
              <p className="text-fg text-xs break-all font-mono font-medium">{selected.fileA}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-fg-faint mb-1 font-semibold">Changed Together</p>
              <p className="text-2xl font-bold text-accent-light tabular-nums">{selected.cochanges}x</p>
              <p className="text-xs text-fg-faint font-semibold tabular-nums">{selected.confidence}% confidence</p>
            </div>
            <div>
              <p className="text-xs text-fg-faint mb-1 font-semibold">File B</p>
              <p className="text-fg text-xs break-all font-mono font-medium">{selected.fileB}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function shortName(path: string): string {
  const parts = path.split('/')
  return parts.length > 2 ? `.../${parts.slice(-2).join('/')}` : path
}

function drawGraph(svg: SVGSVGElement, data: CoChangePair[], onSelect: (p: CoChangePair) => void) {
  const d3svg = d3.select(svg)
  d3svg.selectAll('*').remove()

  const width = svg.clientWidth
  const height = svg.clientHeight

  const nodeSet = new Set<string>()
  for (const pair of data.slice(0, 40)) {
    nodeSet.add(pair.fileA)
    nodeSet.add(pair.fileB)
  }

  const nodes = Array.from(nodeSet).map((id) => ({ id, label: id.split('/').pop()! }))
  const links = data.slice(0, 40).map((p) => ({
    source: p.fileA,
    target: p.fileB,
    value: p.cochanges,
    pair: p,
  }))

  const maxVal = Math.max(...links.map((l) => l.value), 1)

  const sim = d3.forceSimulation(nodes as any)
    .force('link', d3.forceLink(links as any).id((d: any) => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide(30))

  const g = d3svg.append('g')

  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.3, 3])
    .on('zoom', (e) => g.attr('transform', e.transform))
  d3svg.call(zoom)

  const link = g.selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#6366f1')
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', (d) => Math.max(1, (d.value / maxVal) * 5))
    .style('cursor', 'pointer')
    .on('click', (_e, d) => onSelect(d.pair))

  const node = g.selectAll('g.node')
    .data(nodes)
    .join('g')
    .attr('class', 'node')
    .style('cursor', 'grab')
    .call(d3.drag<any, any>()
      .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
      .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
      .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null })
    )

  node.append('circle')
    .attr('r', 6)
    .attr('fill', '#6366f1')
    .attr('stroke', '#818cf8')
    .attr('stroke-width', 1.5)

  node.append('text')
    .attr('dx', 10)
    .attr('dy', 4)
    .attr('fill', 'var(--fg-muted)')
    .attr('font-size', '10px')
    .attr('font-weight', '600')
    .attr('font-family', 'Inter, system-ui, sans-serif')
    .text((d: any) => d.label)

  sim.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)

    node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
  })
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
