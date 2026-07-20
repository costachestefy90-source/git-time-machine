import { getFileLog, getFileAtCommit } from './git.js'
import type { FunctionInfo, FunctionVersion } from './types.js'

const FUNCTION_PATTERNS: Record<string, RegExp[]> = {
  ts: [
    /(?:export\s+)?(?:async\s+)?function\s+(\w+)/,
    /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(/,
    /(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\([^)]*\)\s*[:{]/,
  ],
  js: [
    /(?:export\s+)?(?:async\s+)?function\s+(\w+)/,
    /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(/,
    /(\w+)\s*:\s*(?:async\s+)?function/,
  ],
  py: [
    /def\s+(\w+)\s*\(/,
    /class\s+(\w+)\s*[:(]/,
  ],
  java: [
    /(?:public|private|protected)\s+(?:static\s+)?(?:\w+\s+)?(\w+)\s*\(/,
  ],
  cs: [
    /(?:public|private|protected|internal)\s+(?:static\s+)?(?:async\s+)?(?:\w+\s+)?(\w+)\s*\(/,
  ],
  go: [
    /func\s+(?:\([^)]+\)\s+)?(\w+)\s*\(/,
  ],
  rs: [
    /(?:pub\s+)?(?:async\s+)?fn\s+(\w+)/,
  ],
}

function getExtKey(filePath: string): string | null {
  const ext = filePath.split('.').pop()?.toLowerCase()
  if (!ext) return null
  if (['ts', 'tsx'].includes(ext)) return 'ts'
  if (['js', 'jsx', 'mjs'].includes(ext)) return 'js'
  if (ext === 'py') return 'py'
  if (ext === 'java') return 'java'
  if (ext === 'cs') return 'cs'
  if (ext === 'go') return 'go'
  if (ext === 'rs') return 'rs'
  return null
}

export function extractFunctions(content: string, filePath: string): { name: string; startLine: number; endLine: number; body: string }[] {
  const extKey = getExtKey(filePath)
  if (!extKey) return []

  const patterns = FUNCTION_PATTERNS[extKey]
  const lines = content.split('\n')
  const functions: { name: string; startLine: number; endLine: number; body: string }[] = []

  for (let i = 0; i < lines.length; i++) {
    for (const pattern of patterns) {
      const match = lines[i].match(pattern)
      if (match?.[1]) {
        const name = match[1]
        if (['if', 'else', 'for', 'while', 'switch', 'catch', 'return', 'new', 'class', 'import', 'from'].includes(name)) continue

        const endLine = findFunctionEnd(lines, i, extKey)
        const body = lines.slice(i, endLine + 1).join('\n')
        functions.push({ name, startLine: i + 1, endLine: endLine + 1, body })
        break
      }
    }
  }
  return functions
}

function findFunctionEnd(lines: string[], startLine: number, extKey: string): number {
  if (extKey === 'py') {
    const indent = lines[startLine].match(/^(\s*)/)?.[1].length ?? 0
    for (let i = startLine + 1; i < lines.length; i++) {
      const line = lines[i]
      if (line.trim() === '') continue
      const currentIndent = line.match(/^(\s*)/)?.[1].length ?? 0
      if (currentIndent <= indent && line.trim()) return i - 1
    }
    return lines.length - 1
  }

  let braceCount = 0
  let started = false
  for (let i = startLine; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '{') { braceCount++; started = true }
      if (ch === '}') braceCount--
      if (started && braceCount === 0) return i
    }
  }
  return Math.min(startLine + 20, lines.length - 1)
}

export function trackFunction(cwd: string, filePath: string, functionName: string, maxCount = 50): FunctionInfo {
  const commits = getFileLog(cwd, filePath, maxCount)
  const versions: FunctionVersion[] = []

  for (const commit of commits) {
    const content = getFileAtCommit(cwd, commit.hash, filePath)
    if (!content) continue

    const fns = extractFunctions(content, filePath)
    const fn = fns.find((f) => f.name === functionName)
    if (!fn) continue

    const prev = versions.length > 0 ? versions[versions.length - 1].body : null
    if (prev === fn.body) continue

    versions.push({
      hash: commit.hash,
      date: commit.date,
      author: commit.author,
      message: commit.message,
      body: fn.body,
    })
  }

  return {
    name: functionName,
    file: filePath,
    startLine: 0,
    endLine: 0,
    versions,
  }
}

export function listFunctions(cwd: string, filePath: string): { name: string; startLine: number; endLine: number }[] {
  try {
    const content = getFileAtCommit(cwd, 'HEAD', filePath)
    return extractFunctions(content, filePath).map(({ name, startLine, endLine }) => ({ name, startLine, endLine }))
  } catch {
    return []
  }
}
