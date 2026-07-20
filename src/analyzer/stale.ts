import { getTrackedFiles } from './git.js'
import { execSync } from 'child_process'

export interface StaleFile {
  path: string
  lastCommitDate: string
  lastAuthor: string
  lastMessage: string
  daysSinceChange: number
  totalCommits: number
}

function run(cmd: string, cwd: string): string {
  return execSync(cmd, { cwd, maxBuffer: 50 * 1024 * 1024, encoding: 'utf-8' })
}

export function findStaleFiles(cwd: string, thresholdDays = 180, limit = 200): StaleFile[] {
  const files = getTrackedFiles(cwd)
  const codeFiles = files.filter((f) =>
    /\.(ts|tsx|js|jsx|py|java|cs|go|rs|rb|php|c|cpp|h|hpp|swift|kt|css|scss|html|sql|yaml|yml|json|xml|toml|cfg|ini|sh|bash|zsh)$/.test(f)
  )

  const now = Date.now()
  const stale: StaleFile[] = []

  for (const file of codeFiles.slice(0, limit)) {
    try {
      const sep = '<<SEP>>'
      const info = run(
        `git log -1 --pretty=format:"%aI${sep}%an${sep}%s" -- "${file}"`,
        cwd
      ).trim()

      if (!info) continue

      const [date, author, message] = info.split(sep)
      const daysSince = Math.floor((now - new Date(date).getTime()) / 86400000)

      if (daysSince >= thresholdDays) {
        const commitCount = parseInt(
          run(`git rev-list --count HEAD -- "${file}"`, cwd).trim(),
          10
        ) || 0

        stale.push({
          path: file,
          lastCommitDate: date,
          lastAuthor: author,
          lastMessage: message,
          daysSinceChange: daysSince,
          totalCommits: commitCount,
        })
      }
    } catch {}
  }

  return stale.sort((a, b) => b.daysSinceChange - a.daysSinceChange)
}
