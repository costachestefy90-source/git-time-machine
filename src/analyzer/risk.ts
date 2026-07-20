import { analyzeChurn } from './churn.js'
import { analyzeOwnership } from './contributors.js'
import { getTrackedFiles } from './git.js'

export interface FileRisk {
  path: string
  score: number
  churnScore: number
  ownershipScore: number
  ageScore: number
  commits: number
  authors: number
  daysSinceLastChange: number
  topOwner: string
  topOwnerPct: number
}

export function analyzeRisk(cwd: string, maxCount = 500, limit = 100): FileRisk[] {
  const churn = analyzeChurn(cwd, maxCount)
  const codeFiles = churn.filter((f) =>
    /\.(ts|tsx|js|jsx|py|java|cs|go|rs|rb|php|c|cpp|h|hpp|swift|kt)$/.test(f.path)
  )

  const maxCommits = Math.max(...codeFiles.map((f) => f.commits), 1)
  const now = Date.now()

  const risks: FileRisk[] = codeFiles.slice(0, limit).map((file) => {
    const churnScore = file.commits / maxCommits

    const authorCount = file.authors.length
    const ownershipScore = authorCount === 1 ? 1 : authorCount === 2 ? 0.6 : authorCount <= 4 ? 0.3 : 0.1

    const daysSince = Math.floor((now - new Date(file.lastModified).getTime()) / 86400000)
    const ageScore = Math.min(daysSince / 365, 1)

    const score = Math.round((churnScore * 0.4 + ownershipScore * 0.35 + ageScore * 0.25) * 100)

    let topOwner = file.authors[0] || 'unknown'
    let topOwnerPct = 100

    try {
      const ownership = analyzeOwnership(cwd, file.path)
      if (ownership.owners.length > 0) {
        topOwner = ownership.owners[0].name
        topOwnerPct = ownership.owners[0].percentage
      }
    } catch {}

    return {
      path: file.path,
      score,
      churnScore: Math.round(churnScore * 100),
      ownershipScore: Math.round(ownershipScore * 100),
      ageScore: Math.round(ageScore * 100),
      commits: file.commits,
      authors: authorCount,
      daysSinceLastChange: daysSince,
      topOwner,
      topOwnerPct,
    }
  })

  return risks.sort((a, b) => b.score - a.score)
}
