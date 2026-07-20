import { getLog } from './git.js'

export interface CoChangePair {
  fileA: string
  fileB: string
  cochanges: number
  confidence: number
}

export function analyzeCoChanges(cwd: string, maxCount = 500, minCochanges = 3, limit = 100): CoChangePair[] {
  const commits = getLog(cwd, maxCount)
  const pairCount = new Map<string, number>()
  const fileCount = new Map<string, number>()

  for (const commit of commits) {
    const files = commit.files.filter((f) =>
      /\.(ts|tsx|js|jsx|py|java|cs|go|rs|rb|php|c|cpp|h|hpp|swift|kt|css|scss|html)$/.test(f)
    )

    for (const file of files) {
      fileCount.set(file, (fileCount.get(file) || 0) + 1)
    }

    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const key = [files[i], files[j]].sort().join('||')
        pairCount.set(key, (pairCount.get(key) || 0) + 1)
      }
    }
  }

  const pairs: CoChangePair[] = []

  for (const [key, count] of pairCount) {
    if (count < minCochanges) continue
    const [fileA, fileB] = key.split('||')
    const maxSingle = Math.max(fileCount.get(fileA) || 1, fileCount.get(fileB) || 1)
    const confidence = Math.round((count / maxSingle) * 100)

    pairs.push({ fileA, fileB, cochanges: count, confidence })
  }

  return pairs.sort((a, b) => b.cochanges - a.cochanges).slice(0, limit)
}
