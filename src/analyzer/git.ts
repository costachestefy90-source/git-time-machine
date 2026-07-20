import { execSync } from 'child_process'
import type { CommitInfo, BlameLine } from './types.js'

function run(cmd: string, cwd: string): string {
  return execSync(cmd, { cwd, maxBuffer: 50 * 1024 * 1024, encoding: 'utf-8' })
}

export function isGitRepo(cwd: string): boolean {
  try {
    run('git rev-parse --is-inside-work-tree', cwd)
    return true
  } catch {
    return false
  }
}

export function getRepoName(cwd: string): string {
  return run('git rev-parse --show-toplevel', cwd).trim().split('/').pop()!
}

export function getLog(cwd: string, maxCount = 500): CommitInfo[] {
  const sep = '<<SEP>>'
  const raw = run(
    `git log --pretty=format:"%H${sep}%aI${sep}%an${sep}%ae${sep}%s" --name-only -n ${maxCount}`,
    cwd
  )

  const commits: CommitInfo[] = []
  let current: Partial<CommitInfo> | null = null

  for (const line of raw.split('\n')) {
    if (line.includes(sep)) {
      if (current?.hash) commits.push(current as CommitInfo)
      const [hash, date, author, email, message] = line.split(sep)
      current = { hash, date, author, email, message, files: [] }
    } else if (line.trim() && current) {
      current.files!.push(line.trim())
    }
  }
  if (current?.hash) commits.push(current as CommitInfo)
  return commits
}

export function getFileLog(cwd: string, filePath: string, maxCount = 100): CommitInfo[] {
  const sep = '<<SEP>>'
  try {
    const raw = run(
      `git log --pretty=format:"%H${sep}%aI${sep}%an${sep}%ae${sep}%s" --follow -n ${maxCount} -- "${filePath}"`,
      cwd
    )
    return raw
      .split('\n')
      .filter((l) => l.includes(sep))
      .map((line) => {
        const [hash, date, author, email, message] = line.split(sep)
        return { hash, date, author, email, message, files: [filePath] }
      })
  } catch {
    return []
  }
}

export function getBlame(cwd: string, filePath: string): BlameLine[] {
  try {
    const raw = run(`git blame --porcelain "${filePath}"`, cwd)
    const lines: BlameLine[] = []
    let current: Partial<BlameLine> = {}
    let lineNum = 0

    for (const line of raw.split('\n')) {
      if (/^[0-9a-f]{40}/.test(line)) {
        const parts = line.split(' ')
        current = { hash: parts[0] }
        lineNum = parseInt(parts[2], 10)
      } else if (line.startsWith('author ')) {
        current.author = line.slice(7)
      } else if (line.startsWith('author-mail ')) {
        current.email = line.slice(12).replace(/[<>]/g, '')
      } else if (line.startsWith('author-time ')) {
        current.date = new Date(parseInt(line.slice(12), 10) * 1000).toISOString()
      } else if (line.startsWith('summary ')) {
        current.message = line.slice(8)
      } else if (line.startsWith('\t')) {
        current.content = line.slice(1)
        current.line = lineNum
        lines.push(current as BlameLine)
        current = {}
      }
    }
    return lines
  } catch {
    return []
  }
}

export function getDiff(cwd: string, hash: string, filePath?: string): string {
  try {
    const fileArg = filePath ? ` -- "${filePath}"` : ''
    return run(`git diff ${hash}~1..${hash}${fileArg}`, cwd)
  } catch {
    return ''
  }
}

export function getFileAtCommit(cwd: string, hash: string, filePath: string): string {
  try {
    return run(`git show ${hash}:"${filePath}"`, cwd)
  } catch {
    return ''
  }
}

export function getTrackedFiles(cwd: string): string[] {
  return run('git ls-files', cwd)
    .split('\n')
    .filter((f) => f.trim())
}

export function getNumStat(cwd: string, maxCount = 500): { hash: string; file: string; additions: number; deletions: number }[] {
  try {
    const raw = run(`git log --numstat --pretty=format:"<<COMMIT>>%H" -n ${maxCount}`, cwd)
    const results: { hash: string; file: string; additions: number; deletions: number }[] = []
    let currentHash = ''

    for (const line of raw.split('\n')) {
      if (line.startsWith('<<COMMIT>>')) {
        currentHash = line.slice(10)
      } else if (line.trim() && currentHash) {
        const [add, del, file] = line.split('\t')
        if (file && add !== '-') {
          results.push({
            hash: currentHash,
            file,
            additions: parseInt(add, 10) || 0,
            deletions: parseInt(del, 10) || 0,
          })
        }
      }
    }
    return results
  } catch {
    return []
  }
}
