import { getLog, getNumStat } from './git.js'
import type { FileChurn } from './types.js'

export function analyzeChurn(cwd: string, maxCount = 500): FileChurn[] {
  const commits = getLog(cwd, maxCount)
  const stats = getNumStat(cwd, maxCount)

  const fileMap = new Map<string, FileChurn>()

  for (const commit of commits) {
    for (const file of commit.files) {
      if (!fileMap.has(file)) {
        fileMap.set(file, {
          path: file,
          commits: 0,
          additions: 0,
          deletions: 0,
          authors: [],
          lastModified: commit.date,
        })
      }
      const entry = fileMap.get(file)!
      entry.commits++
      if (!entry.authors.includes(commit.author)) {
        entry.authors.push(commit.author)
      }
      if (commit.date > entry.lastModified) {
        entry.lastModified = commit.date
      }
    }
  }

  for (const stat of stats) {
    const entry = fileMap.get(stat.file)
    if (entry) {
      entry.additions += stat.additions
      entry.deletions += stat.deletions
    }
  }

  return Array.from(fileMap.values()).sort((a, b) => b.commits - a.commits)
}
