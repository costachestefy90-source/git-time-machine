import React, { useEffect, useState } from 'react'
import { api, BlameLine } from '../lib/api'

const COLORS = [
  'bg-accent/10', 'bg-surface-2', 'bg-blue-500/10',
]

export default function BlameExplorer() {
  const [files, setFiles] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [selectedFile, setSelectedFile] = useState('')
  const [blame, setBlame] = useState<BlameLine[]>([])
  const [loading, setLoading] = useState(false)
  const [hoveredHash, setHoveredHash] = useState('')
  const [selectedLine, setSelectedLine] = useState<BlameLine | null>(null)

  useEffect(() => {
    api.files().then(setFiles)
  }, [])

  useEffect(() => {
    if (!selectedFile) return
    setLoading(true)
    setSelectedLine(null)
    api.blame(selectedFile).then((b) => {
      setBlame(b)
      setLoading(false)
    })
  }, [selectedFile])

  const filteredFiles = search
    ? files.filter((f) => f.toLowerCase().includes(search.toLowerCase())).slice(0, 20)
    : []

  const authorColors = new Map<string, string>()
  let colorIdx = 0
  for (const line of blame) {
    if (!authorColors.has(line.author)) {
      authorColors.set(line.author, COLORS[colorIdx % COLORS.length])
      colorIdx++
    }
  }

  return (
    <div className="h-full flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-fg">Blame Explorer</h2>
        <p className="text-sm text-fg-muted mt-0.5">Click any line to see who wrote it and why</p>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedFile('') }}
          className="w-full bg-surface-1 border border-surface-3 rounded-lg px-3 py-2 text-sm font-medium text-fg placeholder-fg-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
        />
        {filteredFiles.length > 0 && !selectedFile && (
          <div className="absolute mt-1 w-full bg-surface-1 border border-surface-3 rounded-lg max-h-48 overflow-auto z-10 shadow-lg">
            {filteredFiles.map((f) => (
              <button
                key={f}
                onClick={() => { setSelectedFile(f); setSearch(f) }}
                className="block w-full text-left px-3 py-2 text-sm text-fg-muted hover:bg-surface-2 hover:text-fg truncate font-mono transition-colors"
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-fg-muted">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Loading blame data...
          </div>
        </div>
      )}

      {blame.length > 0 && (
        <div className="flex-1 min-h-0 flex gap-4">
          <div className="flex-1 bg-surface-1 rounded-xl border border-surface-3 overflow-auto shadow-sm">
            <table className="w-full text-xs font-mono">
              <tbody>
                {blame.map((line) => (
                  <tr
                    key={line.line}
                    className={`hover:bg-surface-2 cursor-pointer transition-colors ${
                      hoveredHash === line.hash ? 'bg-accent/5' : ''
                    } ${selectedLine?.line === line.line ? 'bg-accent/10' : ''}`}
                    onMouseEnter={() => setHoveredHash(line.hash)}
                    onMouseLeave={() => setHoveredHash('')}
                    onClick={() => setSelectedLine(line)}
                  >
                    <td className="px-2 py-0.5 text-fg-faint text-right select-none w-12 border-r border-surface-3 tabular-nums">
                      {line.line}
                    </td>
                    <td className={`px-2 py-0.5 w-24 truncate ${authorColors.get(line.author)} border-r border-surface-3`}>
                      <span className="text-fg-muted font-medium">{line.author.split(' ')[0]}</span>
                    </td>
                    <td className="px-2 py-0.5 text-fg-faint w-20 border-r border-surface-3">
                      {new Date(line.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                    <td className="px-2 py-0.5">
                      <pre className="whitespace-pre text-fg">{line.content}</pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedLine && (
            <div className="w-80 bg-surface-1 rounded-xl border border-surface-3 p-5 overflow-auto shrink-0 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-fg">Line {selectedLine.line}</h3>
                <button onClick={() => setSelectedLine(null)} className="text-fg-faint hover:text-fg transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-fg-faint mb-1">Author</p>
                  <p className="text-sm font-semibold text-fg">{selectedLine.author}</p>
                  <p className="text-xs text-fg-faint font-mono">{selectedLine.email}</p>
                </div>
                <div>
                  <p className="text-xs text-fg-faint mb-1">Date</p>
                  <p className="text-sm font-medium text-fg">{new Date(selectedLine.date).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-fg-faint mb-1">Commit</p>
                  <p className="text-xs font-mono font-bold text-accent-light">{selectedLine.hash.slice(0, 12)}</p>
                </div>
                <div>
                  <p className="text-xs text-fg-faint mb-1">Message</p>
                  <p className="text-sm text-fg-muted">{selectedLine.message}</p>
                </div>
                <div>
                  <p className="text-xs text-fg-faint mb-1">Code</p>
                  <pre className="bg-[var(--code-bg)] rounded-lg p-2.5 text-xs overflow-x-auto text-fg">
                    {selectedLine.content}
                  </pre>
                </div>

                <HighlightedLines blame={blame} hash={selectedLine.hash} />
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedFile && !loading && (
        <div className="flex-1 flex items-center justify-center text-fg-faint">
          Search for a file to explore its blame history
        </div>
      )}
    </div>
  )
}

function HighlightedLines({ blame, hash }: { blame: BlameLine[]; hash: string }) {
  const sameCommit = blame.filter((l) => l.hash === hash)
  if (sameCommit.length <= 1) return null

  return (
    <div>
      <p className="text-xs text-fg-faint mb-1 font-medium">
        Same commit ({sameCommit.length} lines)
      </p>
      <div className="bg-[var(--code-bg)] rounded-lg p-2.5 max-h-32 overflow-auto">
        {sameCommit.map((l) => (
          <div key={l.line} className="text-xs font-mono">
            <span className="text-fg-faint inline-block w-8 text-right mr-2 tabular-nums">{l.line}</span>
            <span className="text-fg-muted">{l.content}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
