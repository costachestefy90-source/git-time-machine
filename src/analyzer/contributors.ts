import { getLog, getNumStat, getBlame, getTrackedFiles } from './git.js'
import type { ContributorStats, FileOwnership } from './types.js'

export function analyzeContributors(cwd: string, maxCount = 500): ContributorStats[] {
  const commits = getLog(cwd, maxCount)
  const stats = getNumStat(cwd, maxCount)

  const contribMap = new Map<string, ContributorStats>()

  for (const commit of commits) {
    const key = commit.email
    if (!contribMap.has(key)) {
      contribMap.set(key, {
        name: commit.author,
        email: commit.email,
        commits: 0,
        additions: 0,
        deletions: 0,
        files: [],
        firstCommit: commit.date,
        lastCommit: commit.date,
      })
    }
    const entry = contribMap.get(key)!
    entry.commits++
    for (const file of commit.files) {
      if (!entry.files.includes(file)) entry.files.push(file)
    }
    if (commit.date < entry.firstCommit) entry.firstCommit = commit.date
    if (commit.date > entry.lastCommit) entry.lastCommit = commit.date
  }

  const commitHashToEmail = new Map<string, string>()
  for (const c of commits) commitHashToEmail.set(c.hash, c.email)

  for (const stat of stats) {
    const email = commitHashToEmail.get(stat.hash)
    if (email && contribMap.has(email)) {
      const entry = contribMap.get(email)!
      entry.additions += stat.additions
      entry.deletions += stat.deletions
    }
  }

  return Array.from(contribMap.values()).sort((a, b) => b.commits - a.commits)
}

export function analyzeOwnership(cwd: string, filePath: string): FileOwnership {
  const blameLines = getBlame(cwd, filePath)
  const ownerMap = new Map<string, { name: string; email: string; lines: number }>()

  for (const line of blameLines) {
    const key = line.email
    if (!ownerMap.has(key)) {
      ownerMap.set(key, { name: line.author, email: line.email, lines: 0 })
    }
    ownerMap.get(key)!.lines++
  }

  const totalLines = blameLines.length || 1
  const owners = Array.from(ownerMap.values())
    .map((o) => ({ name: o.name, email: o.email, percentage: Math.round((o.lines / totalLines) * 100) }))
    .sort((a, b) => b.percentage - a.percentage)

  return { path: filePath, owners, totalLines }
}

export function analyzeAllOwnership(cwd: string, limit = 50): FileOwnership[] {
  const files = getTrackedFiles(cwd)
  const textFiles = files.filter((f) => /\.(ts|tsx|js|jsx|py|java|cs|go|rs|rb|php|c|cpp|h|hpp|swift|kt)$/.test(f))
  return textFiles.slice(0, limit).map((f) => analyzeOwnership(cwd, f))
}
