import React, { useEffect, useState, useRef } from 'react'
import * as d3 from 'd3'
import { api, FileChurn } from '../lib/api'

export default function ChurnHeatmap() {
  const [data, setData] = useState<FileChurn[]>([])
  const [loading, setLoading] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)
  const [selected, setSelected] = useState<FileChurn | null>(null)

  useEffect(() => {
    api.churn().then((d) => { setData(d); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!data.length || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    const hierarchy = buildHierarchy(data)
    const root = d3.hierarchy(hierarchy)
      .sum((d: any) => d.commits || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0))

    d3.treemap<any>()
      .size([width, height])
      .padding(2)
      .round(true)(root)

    const maxCommits = d3.max(data, (d) => d.commits) || 1
    const color = d3.scaleSequential()
      .domain([0, maxCommits])
      .interpolator(d3.interpolateRgbBasis(['#315a86', '#4f81b5', '#93c5fd']))

    const leaves = root.leaves()

    const groups = svg.selectAll('g')
      .data(leaves)
      .join('g')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`)
      .style('cursor', 'pointer')
      .on('click', (_e: any, d: any) => {
        const match = data.find((f) => f.path === d.data.fullPath)
        if (match) setSelected(match)
      })

    const defs = svg.append('defs')
    leaves.forEach((d: any, i: number) => {
      defs.append('clipPath')
        .attr('id', `clip-${i}`)
        .append('rect')
        .attr('width', Math.max(0, d.x1 - d.x0))
        .attr('height', Math.max(0, d.y1 - d.y0))
    })

    groups.append('rect')
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
      .attr('rx', 4)
      .attr('fill', (d: any) => color(d.data.commits || 0))
      .attr('stroke', 'var(--surface-0)')
      .attr('stroke-width', 1)
      .style('opacity', 0)
      .transition()
      .duration(600)
      .style('opacity', 1)

    groups.attr('clip-path', (_: any, i: number) => `url(#clip-${i})`)

    groups.append('text')
      .attr('x', 6)
      .attr('y', 16)
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .text((d: any) => {
        const w = d.x1 - d.x0
        const h = d.y1 - d.y0
        if (w < 24 || h < 18) return ''
        const name = d.data.name
        const maxChars = Math.floor((w - 12) / 6.5)
        return name.length <= maxChars ? name : name.slice(0, Math.max(0, maxChars - 1)) + '…'
      })

    groups.append('text')
      .attr('x', 6)
      .attr('y', 28)
      .attr('fill', 'rgba(255,255,255,0.6)')
      .attr('font-size', '9px')
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .text((d: any) => {
        const w = d.x1 - d.x0
        const h = d.y1 - d.y0
        return w > 50 && h > 32 ? `${d.data.commits} commits` : ''
      })

  }, [data])

  if (loading) return <Loading />

  return (
    <div className="h-full flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-fg">Code Churn Heatmap</h2>
          <p className="text-sm text-fg-muted mt-0.5">Brighter files have changed more often.</p>
        </div>
        <span className="text-sm text-fg-faint tabular-nums">{data.length} files</span>
      </div>

      <div className="flex-1 min-h-0 flex gap-4">
        <div className="flex-1 bg-surface-1 rounded-xl border border-surface-3 overflow-hidden shadow-sm">
          <svg ref={svgRef} className="w-full h-full" />
        </div>

        {selected && (
          <div className="w-72 bg-surface-1 rounded-xl border border-surface-3 p-5 overflow-auto shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-fg truncate">{selected.path.split('/').pop()}</h3>
              <button onClick={() => setSelected(null)} className="text-fg-faint hover:text-fg transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p className="text-xs text-fg-faint mb-5 break-all font-mono">{selected.path}</p>
            <div className="space-y-3">
              <Stat label="Commits" value={selected.commits} />
              <Stat label="Additions" value={`+${selected.additions}`} color="text-emerald-500" />
              <Stat label="Deletions" value={`-${selected.deletions}`} color="text-red-500" />
              <Stat label="Last Modified" value={new Date(selected.lastModified).toLocaleDateString()} />
              <div>
                <p className="text-xs text-fg-faint mb-1.5">Contributors</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.authors.map((a) => (
                    <span key={a} className="text-xs bg-surface-2 px-2 py-0.5 rounded-full text-fg-muted">{a}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-fg-faint">{label}</span>
      <span className={`text-sm font-medium ${color || 'text-fg'}`}>{value}</span>
    </div>
  )
}

function Loading() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex items-center gap-3 text-fg-muted">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        Analyzing repository...
      </div>
    </div>
  )
}

function buildHierarchy(files: FileChurn[]) {
  const root: any = { name: 'root', children: [] }

  for (const file of files) {
    const parts = file.path.split('/')
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i]
      if (i === parts.length - 1) {
        current.children.push({ name, commits: file.commits, fullPath: file.path })
      } else {
        let child = current.children.find((c: any) => c.name === name && c.children)
        if (!child) {
          child = { name, children: [] }
          current.children.push(child)
        }
        current = child
      }
    }
  }

  return root
}
