import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { api, DayActivity } from '../lib/api'

type DayCount = { day: number; name: string; commits: number }

export default function ActivityTimeline() {
  const [activity, setActivity] = useState<DayActivity[]>([])
  const [days, setDays] = useState<DayCount[]>([])
  const [loading, setLoading] = useState(true)
  const calendar = useRef<SVGSVGElement>(null)

  useEffect(() => {
    Promise.all([api.activity(), api.activityDays()]).then(([activityData, dayData]) => {
      setActivity(activityData)
      setDays(dayData)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (activity.length && calendar.current) {
      drawCalendar(calendar.current, activity)
    }
  }, [activity])

  if (loading) return <Spinner text="Loading activity data..." />

  const totalCommits = activity.reduce((total, day) => total + day.commits, 0)
  const activeDays = activity.length
  const average = activeDays ? (totalCommits / activeDays).toFixed(1) : '0'
  const peak = activity.reduce(
    (best, day) => day.commits > best.commits ? day : best,
    activity[0] || { date: '-', commits: 0, authors: [] },
  )
  const biggestDay = Math.max(...days.map((day) => day.commits), 1)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-fg">Activity Timeline</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total commits" value={totalCommits} />
        <StatCard label="Active days" value={activeDays} />
        <StatCard label="Average per day" value={average} />
        <StatCard label="Busiest day" value={peak.commits} sub={peak.date} />
      </div>

      <div className="bg-surface-1 rounded-xl border border-surface-3 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-fg mb-3">Commit calendar</h3>
        <div className="overflow-x-auto">
          <svg ref={calendar} className="w-full" style={{ minWidth: 700, height: 140 }} />
        </div>
      </div>

      <div className="bg-surface-1 rounded-xl border border-surface-3 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-fg mb-3">Commits by day of week</h3>
        <div className="space-y-2.5 mt-2">
          {days.map((day) => (
            <div key={day.day} className="flex items-center gap-3">
              <span className="text-xs font-semibold text-fg-muted w-8">{day.name}</span>
              <div className="flex-1 h-5 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${(day.commits / biggestDay) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-fg-muted w-8 text-right tabular-nums">{day.commits}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function drawCalendar(svg: SVGSVGElement, data: DayActivity[]) {
  const chart = d3.select(svg)
  chart.selectAll('*').remove()

  const cellSize = 14
  const gap = 2
  const margin = { top: 20, left: 30 }
  const dateMap = new Map(data.map((day) => [day.date, day.commits]))
  const maxCommits = Math.max(...data.map((day) => day.commits), 1)
  const color = d3.scaleSequential()
    .domain([0, maxCommits])
    .interpolator(d3.interpolateRgbBasis(['#223244', '#315a86', '#93c5fd']))

  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setFullYear(startDate.getFullYear() - 1)

  const labels = ['', 'Mon', '', 'Wed', '', 'Fri', '']
  labels.forEach((label, index) => {
    if (!label) return

    chart.append('text')
      .attr('x', margin.left - 5)
      .attr('y', margin.top + index * (cellSize + gap) + cellSize - 2)
      .attr('text-anchor', 'end')
      .attr('fill', 'var(--fg-faint)')
      .attr('font-size', '9px')
      .text(label)
  })

  const current = new Date(startDate)
  while (current <= endDate) {
    const date = current.toISOString().split('T')[0]
    const week = Math.floor((current.getTime() - startDate.getTime()) / (7 * 86400000))
    const commits = dateMap.get(date) || 0

    chart.append('rect')
      .attr('x', margin.left + week * (cellSize + gap))
      .attr('y', margin.top + current.getDay() * (cellSize + gap))
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('rx', 3)
      .attr('fill', commits ? color(commits) : 'var(--calendar-empty)')
      .attr('stroke', 'var(--calendar-stroke)')
      .attr('stroke-width', 1)
      .append('title')
      .text(`${date}: ${commits} commit${commits === 1 ? '' : 's'}`)

    current.setDate(current.getDate() + 1)
  }
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
      <div className="text-fg-muted">{text}</div>
    </div>
  )
}
