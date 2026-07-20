import { execSync } from 'child_process'
import { getFileLog } from './git.js'

export interface FileSizePoint {
  hash: string
  date: string
  author: string
  message: string
  lines: number
  size: number
}

function run(cmd: string, cwd: string): string {
  return execSync(cmd, { cwd, maxBuffer: 50 * 1024 * 1024, encoding: 'utf-8' })
}

export function getFileSizeTrend(cwd: string, filePath: string, maxCount = 50): FileSizePoint[] {
  const commits = getFileLog(cwd, filePath, maxCount)
  const points: FileSizePoint[] = []

  for (const commit of commits) {
    try {
      const content = run(`git show ${commit.hash}:"${filePath}"`, cwd)
      const lines = content.split('\n').length
      const size = Buffer.byteLength(content, 'utf-8')

      points.push({
        hash: commit.hash,
        date: commit.date,
        author: commit.author,
        message: commit.message,
        lines,
        size,
      })
    } catch {}
  }

  return points.reverse()
}
