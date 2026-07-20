import { getLog } from './git.js'

export interface DayActivity {
  date: string
  commits: number
  authors: string[]
  additions: number
  deletions: number
}

export interface WeekSummary {
  week: string
  days: DayActivity[]
  totalCommits: number
}

export function analyzeActivity(cwd: string, maxCount = 1000): DayActivity[] {
  const commits = getLog(cwd, maxCount)
  const dayMap = new Map<string, DayActivity>()

  for (const commit of commits) {
    const day = commit.date.split('T')[0]
    if (!dayMap.has(day)) {
      dayMap.set(day, { date: day, commits: 0, authors: [], additions: 0, deletions: 0 })
    }
    const entry = dayMap.get(day)!
    entry.commits++
    if (!entry.authors.includes(commit.author)) entry.authors.push(commit.author)
  }

  return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export interface HourDistribution {
  hour: number
  commits: number
}

export function analyzeHourDistribution(cwd: string, maxCount = 1000): HourDistribution[] {
  const commits = getLog(cwd, maxCount)
  const hours = new Array(24).fill(0)

  for (const commit of commits) {
    const hour = new Date(commit.date).getHours()
    hours[hour]++
  }

  return hours.map((commits, hour) => ({ hour, commits }))
}

export interface DayOfWeekDistribution {
  day: number
  name: string
  commits: number
}

export function analyzeDayOfWeek(cwd: string, maxCount = 1000): DayOfWeekDistribution[] {
  const commits = getLog(cwd, maxCount)
  const days = new Array(7).fill(0)
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  for (const commit of commits) {
    const day = new Date(commit.date).getDay()
    days[day]++
  }

  return days.map((commits, day) => ({ day, name: names[day], commits }))
}
