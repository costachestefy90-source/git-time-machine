import { demoResponse, isDemoMode } from './demoData'

const BASE = '/api'
const requestCache = new Map<string, Promise<unknown>>()

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  if (isDemoMode()) {
    return Promise.resolve(demoResponse<T>(path, params))
  }

  const url = new URL(path, window.location.origin)
  url.pathname = BASE + path
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }

  const cacheKey = url.toString()
  const cached = requestCache.get(cacheKey)
  if (cached) return cached as Promise<T>

  const request = fetch(cacheKey)
    .then((res) => {
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      return res.json() as Promise<T>
    })
    .catch((error) => {
      requestCache.delete(cacheKey)
      throw error
    })

  requestCache.set(cacheKey, request)
  return request
}

export interface CommitInfo {
  hash: string; date: string; author: string; email: string; message: string; files: string[]
}
export interface FileChurn {
  path: string; commits: number; additions: number; deletions: number; authors: string[]; lastModified: string
}
export interface ContributorStats {
  name: string; email: string; commits: number; additions: number; deletions: number
  files: string[]; firstCommit: string; lastCommit: string
}
export interface FileOwnership {
  path: string; owners: { name: string; email: string; percentage: number }[]; totalLines: number
}
export interface FunctionInfo {
  name: string; file: string; startLine: number; endLine: number
  versions: { hash: string; date: string; author: string; message: string; body: string }[]
}

export interface FileRisk {
  path: string; score: number; churnScore: number; ownershipScore: number; ageScore: number
  commits: number; authors: number; daysSinceLastChange: number; topOwner: string; topOwnerPct: number
}
export interface SearchResult {
  hash: string; date: string; author: string; message: string; file: string; diff: string
}
export interface DayActivity {
  date: string; commits: number; authors: string[]
}
export interface StaleFile {
  path: string; lastCommitDate: string; lastAuthor: string; lastMessage: string
  daysSinceChange: number; totalCommits: number
}
export interface BusFactorEntry {
  folder: string; busFactor: number; risk: string; totalCommits: number
  contributors: { name: string; commits: number; percentage: number }[]
}
export interface CoChangePair {
  fileA: string; fileB: string; cochanges: number; confidence: number
}
export interface FileSizePoint {
  hash: string; date: string; author: string; message: string; lines: number; size: number
}

export const api = {
  info: () => get<{ repo: string; path: string }>('/info'),
  log: (max = 500) => get<CommitInfo[]>('/log', { max: String(max) }),
  files: () => get<string[]>('/files'),
  diff: (hash: string, file?: string) => get<{ diff: string }>('/diff', { hash, ...(file ? { file } : {}) }),
  churn: (max = 500) => get<FileChurn[]>('/churn', { max: String(max) }),
  contributors: (max = 500) => get<ContributorStats[]>('/contributors', { max: String(max) }),
  ownership: (file: string) => get<FileOwnership>('/ownership', { file }),
  ownershipAll: (limit = 50) => get<FileOwnership[]>('/ownership/all', { limit: String(limit) }),
  functions: (file: string) => get<{ name: string; startLine: number; endLine: number }[]>('/functions', { file }),
  functionHistory: (file: string, name: string) => get<FunctionInfo>('/function/history', { file, name }),
  fileAt: (hash: string, file: string) => get<{ content: string }>('/file-at', { hash, file }),
  risk: (limit = 100) => get<FileRisk[]>('/risk', { limit: String(limit) }),
  search: (q: string, max = 50) => get<SearchResult[]>('/search', { q, max: String(max) }),
  activity: (max = 1000) => get<DayActivity[]>('/activity', { max: String(max) }),
  activityHours: () => get<{ hour: number; commits: number }[]>('/activity/hours'),
  activityDays: () => get<{ day: number; name: string; commits: number }[]>('/activity/days'),
  stale: (days = 180) => get<StaleFile[]>('/stale', { days: String(days) }),
  busFactor: (depth = 2) => get<BusFactorEntry[]>('/busfactor', { depth: String(depth) }),
  cochange: (min = 3) => get<CoChangePair[]>('/cochange', { min: String(min) }),
  fileTrend: (file: string) => get<FileSizePoint[]>('/filetrend', { file }),
}
