import { getLog } from './git.js'

export interface BusFactorEntry {
  folder: string
  busFactor: number
  contributors: { name: string; commits: number; percentage: number }[]
  totalCommits: number
  risk: 'critical' | 'high' | 'medium' | 'low'
}

export function analyzeBusFactor(cwd: string, maxCount = 500, depth = 2): BusFactorEntry[] {
  const commits = getLog(cwd, maxCount)
  const folderMap = new Map<string, Map<string, number>>()

  for (const commit of commits) {
    for (const file of commit.files) {
      const parts = file.split('/')
      for (let d = 1; d <= Math.min(depth, parts.length - 1); d++) {
        const folder = parts.slice(0, d).join('/')
        if (!folderMap.has(folder)) folderMap.set(folder, new Map())
        const authorMap = folderMap.get(folder)!
        authorMap.set(commit.author, (authorMap.get(commit.author) || 0) + 1)
      }
    }
  }

  const entries: BusFactorEntry[] = []

  for (const [folder, authorMap] of folderMap) {
    const totalCommits = Array.from(authorMap.values()).reduce((a, b) => a + b, 0)
    if (totalCommits < 3) continue

    const contributors = Array.from(authorMap.entries())
      .map(([name, commits]) => ({
        name,
        commits,
        percentage: Math.round((commits / totalCommits) * 100),
      }))
      .sort((a, b) => b.commits - a.commits)

    let busFactor = 0
    let cumulative = 0
    for (const c of contributors) {
      busFactor++
      cumulative += c.percentage
      if (cumulative >= 50) break
    }

    let risk: 'critical' | 'high' | 'medium' | 'low'
    if (busFactor === 1 && contributors[0].percentage > 80) risk = 'critical'
    else if (busFactor === 1) risk = 'high'
    else if (busFactor === 2) risk = 'medium'
    else risk = 'low'

    entries.push({ folder, busFactor, contributors, totalCommits, risk })
  }

  return entries.sort((a, b) => a.busFactor - b.busFactor || b.totalCommits - a.totalCommits)
}
