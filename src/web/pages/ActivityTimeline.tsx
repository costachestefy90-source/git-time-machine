import React, { useEffect, useState, useRef } from 'react'
import * as d3 from 'd3'
import { api, DayActivity } from '../lib/api'

export default function ActivityTimeline() {
  const [activity, setActivity] = useState<DayActivity[]>([])
  const [hours, setHours] = useState<{ hour: number; commits: number }[]>([])
  const [days, setDays] = useState<{ day: number; name: string; commits: number }[]>([])
  const [loading, setLoading] = useState(true)
  const calRef = useRef<SVGSVGElement>(null)
  const hourRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    Promise.all([api.activity(), api.activityHours(), api.activityDays()]).then(([a, h, d]) => {
      setActivity(a); setHours(h); setDays(d); setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!activity.length || !calRef.current) return
    drawCalendar(calRef.current, activity)
  }, [activity])

  useEffect(() => {
    if (!hours.length || !hourRef.current) return
    drawHourChart(hourRef.current, hours)
  }, [hours])

  if (loading) return <Spinner text="Loading activity data..." />

  const totalCommits = activity.reduce((a, d) => a + d.commits, 0)
  const activeDays = activity.length
  const avgPerDay = activeDays ? (totalCommits / activeDays).toFixed(1) : '0'
  const peakDay = activity.reduce((a, b) => a.commits > b.commits ? a : b, activity[0])

  return (
    <div className="h-full flex flex-col gap-5 overflow-auto">
      <div>
        <h2 className="text-xl font-bold text-fg">Activity Timeline</h2>
        <p className="text-sm text-fg-muted mt-0.5">Commit patterns over time — contribution graph for any repo</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Commits" value={totalCommits} />
        <StatCard label="Active Days" value={activeDays} />
        <StatCard label="Avg/Day" value={avgPerDay} />
        <StatCard label="Peak Day" value={`${peakDay?.commits || 0}`} sub={peakDay?.date} />
      </div>

      <div className="bg-surface-1 rounded-xl border border-surface-3 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-fg mb-3">Commit Calendar</h3>
        <div className="overflow-x-auto">
          <svg ref={calRef} className="w-full" style={{ minWidth: 700, height: 140 }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-1 rounded-xl border border-surface-3 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-fg mb-3">Commits by Hour</h3>
          <svg ref={hourRef} className="w-full" style={{ height: 160 }} />
        </div>

        <div className="bg-surface-1 rounded-xl border border-surface-3 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-fg mb-3">Commits by Day of Week</h3>
          <div className="space-y-2.5 mt-2">
            {days.map((d) => {
              const max = Math.max(...days.map((x) => x.commits), 1)
              return (
                <div key={d.day} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-fg-muted w-8">{d.name}</span>
                  <div className="flex-1 h-5 bg-surface-3 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${(d.commits / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-fg-muted w-8 text-right tabular-nums">{d.commits}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function drawCalendar(svg: SVGSVGElement, data: DayActivity[]) {
  const d3svg = d3.select(svg)
  d3svg.selectAll('*').remove()

  const cellSize = 14
  const gap = 2
  const margin = { top: 20, left: 30 }

  const dateMap = new Map(data.map((d) => [d.date, d.commits]))
  const maxCommits = Math.max(...data.map((d) => d.commits), 1)

  const color = d3.scaleSequential()
    .domain([0, maxCommits])
    .interpolator(d3.interpolateRgbBasis(['var(--calendar-empty)', '#1e3a5f', '#6366f1', '#818cf8']))

  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setFullYear(startDate.getFullYear() - 1)

  const dayNames = ['', 'Mon', '', 'Wed', '', 'Fri', '']
  dayNames.forEach((name, i) => {
    if (name) {
      d3svg.append('text')
        .attr('x', margin.left - 5)
        .attr('y', margin.top + i * (cellSize + gap) + cellSize - 2)
        .attr('text-anchor', 'end')
        .attr('fill', 'var(--fg-faint)')
        .attr('font-size', '9px')
        .attr('font-weight', '600')
        .text(name)
    }
  })

  const current = new Date(startDate)
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0]
    const dayOfWeek = current.getDay()
    const weeksSinceStart = Math.floor((current.getTime() - startDate.getTime()) / (7 * 86400000))

    const commits = dateMap.get(dateStr) || 0

    d3svg.append('rect')
      .attr('x', margin.left + weeksSinceStart * (cellSize + gap))
      .attr('y', margin.top + dayOfWeek * (cellSize + gap))
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('rx', 3)
      .attr('fill', commits > 0 ? color(commits) : 'var(--calendar-empty)')
      .attr('stroke', 'var(--calendar-stroke)')
      .attr('stroke-width', 1)
      .append('title')
      .text(`${dateStr}: ${commits} commit${commits !== 1 ? 's' : ''}`)

    current.setDate(current.getDate() + 1)
  }
}

function drawHourChart(svg: SVGSVGElement, data: { hour: number; commits: number }[]) {
  const d3svg = d3.select(svg)
  d3svg.selectAll('*').remove()

  const width = svg.clientWidth
  const height = 160
  const margin = { top: 10, right: 10, bottom: 25, left: 35 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const g = d3svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  const x = d3.scaleBand().domain(data.map((d) => String(d.hour))).range([0, innerW]).padding(0.3)
  const y = d3.scaleLinear().domain([0, Math.max(...data.map((d) => d.commits))]).range([innerH, 0])

  g.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(x).tickValues(data.filter((_, i) => i % 3 === 0).map((d) => String(d.hour))))
    .selectAll('text').attr('fill', 'var(--chart-text)').attr('font-size', '9px').attr('font-weight', '600')

  g.selectAll('.domain, .tick line').attr('stroke', 'var(--chart-axis)')

  g.selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', (d) => x(String(d.hour))!)
    .attr('width', x.bandwidth())
    .attr('y', (d) => y(d.commits))
    .attr('height', (d) => innerH - y(d.commits))
    .attr('rx', 3)
    .attr('fill', '#6366f1')
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-surface-1 rounded-xl border border-surface-3 p-4 shadow-sm">
      <p className="text-xs text-fg-faint font-semibold">{label}</p>
      <p className="text-2xl font-bold text-fg tabular-nums">{value}</p>
      {sub && <p className="text-xs text-fg-faint mt-0.5">{sub}</p>}
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
