export interface CommitInfo {
  hash: string
  date: string
  author: string
  email: string
  message: string
  files: string[]
}

export interface FileChurn {
  path: string
  commits: number
  additions: number
  deletions: number
  authors: string[]
  lastModified: string
}

export interface BlameLine {
  line: number
  content: string
  hash: string
  author: string
  email: string
  date: string
  message: string
}

export interface ContributorStats {
  name: string
  email: string
  commits: number
  additions: number
  deletions: number
  files: string[]
  firstCommit: string
  lastCommit: string
}

export interface FunctionVersion {
  hash: string
  date: string
  author: string
  message: string
  body: string
  diff?: string
}

export interface FunctionInfo {
  name: string
  file: string
  startLine: number
  endLine: number
  versions: FunctionVersion[]
}

export interface FileOwnership {
  path: string
  owners: { name: string; email: string; percentage: number }[]
  totalLines: number
}
