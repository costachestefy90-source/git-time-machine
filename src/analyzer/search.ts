import { execSync } from 'child_process'

export interface SearchResult {
  hash: string
  date: string
  author: string
  message: string
  file: string
  diff: string
}

function run(cmd: string, cwd: string): string {
  return execSync(cmd, { cwd, maxBuffer: 50 * 1024 * 1024, encoding: 'utf-8' })
}

export function searchHistory(cwd: string, query: string, maxCount = 50): SearchResult[] {
  try {
    const sep = '<<SEP>>'
    const raw = run(
      `git log -S "${query.replace(/"/g, '\\"')}" --pretty=format:"%H${sep}%aI${sep}%an${sep}%s" --name-only -n ${maxCount}`,
      cwd
    )

    const results: SearchResult[] = []
    let current: Partial<SearchResult> | null = null

    for (const line of raw.split('\n')) {
      if (line.includes(sep)) {
        const [hash, date, author, message] = line.split(sep)
        current = { hash, date, author, message }
      } else if (line.trim() && current?.hash) {
        try {
          const diff = run(`git diff ${current.hash}~1..${current.hash} -- "${line.trim()}" 2>/dev/null || true`, cwd)
          const relevantLines = diff
            .split('\n')
            .filter((l) => (l.startsWith('+') || l.startsWith('-')) && !l.startsWith('+++') && !l.startsWith('---'))
            .filter((l) => l.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 10)
            .join('\n')

          results.push({
            ...current as SearchResult,
            file: line.trim(),
            diff: relevantLines || '(binary or no matching lines in diff)',
          })
        } catch {
          results.push({ ...current as SearchResult, file: line.trim(), diff: '' })
        }
      }
    }

    return results
  } catch {
    return []
  }
}

export function searchByRegex(cwd: string, pattern: string, maxCount = 50): SearchResult[] {
  try {
    const sep = '<<SEP>>'
    const raw = run(
      `git log -G "${pattern.replace(/"/g, '\\"')}" --pretty=format:"%H${sep}%aI${sep}%an${sep}%s" --name-only -n ${maxCount}`,
      cwd
    )

    const results: SearchResult[] = []
    let current: Partial<SearchResult> | null = null

    for (const line of raw.split('\n')) {
      if (line.includes(sep)) {
        const [hash, date, author, message] = line.split(sep)
        current = { hash, date, author, message }
      } else if (line.trim() && current?.hash) {
        results.push({ ...current as SearchResult, file: line.trim(), diff: '' })
      }
    }

    return results
  } catch {
    return []
  }
}
