import React, { useEffect, useState } from 'react'
import { api, FunctionInfo } from '../lib/api'

export default function FunctionTimeline() {
  const [files, setFiles] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState('')
  const [functions, setFunctions] = useState<{ name: string; startLine: number }[]>([])
  const [selectedFn, setSelectedFn] = useState('')
  const [history, setHistory] = useState<FunctionInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [compareIdx, setCompareIdx] = useState<[number, number] | null>(null)

  useEffect(() => {
    api.files().then((f) => {
      const code = f.filter((p) => /\.(ts|tsx|js|jsx|py|java|cs|go|rs)$/.test(p))
      setFiles(code)
    })
  }, [])

  useEffect(() => {
    if (!selectedFile) return
    setFunctions([])
    setSelectedFn('')
    setHistory(null)
    api.functions(selectedFile).then(setFunctions)
  }, [selectedFile])

  useEffect(() => {
    if (!selectedFile || !selectedFn) return
    setLoading(true)
    setCompareIdx(null)
    api.functionHistory(selectedFile, selectedFn).then((h) => {
      setHistory(h)
      setLoading(false)
    })
  }, [selectedFile, selectedFn])

  const filteredFiles = search
    ? files.filter((f) => f.toLowerCase().includes(search.toLowerCase()))
    : files.slice(0, 100)

  return (
    <div className="h-full flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-fg">Function Timeline</h2>
        <p className="text-sm text-fg-muted mt-0.5">See how any function evolved over time</p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-1 border border-surface-3 rounded-lg px-3 py-2 text-sm font-medium text-fg placeholder-fg-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
          />
          {search && filteredFiles.length > 0 && !selectedFile && (
            <div className="mt-1 bg-surface-1 border border-surface-3 rounded-lg max-h-48 overflow-auto shadow-lg">
              {filteredFiles.slice(0, 20).map((f) => (
                <button
                  key={f}
                  onClick={() => { setSelectedFile(f); setSearch(f.split('/').pop()!) }}
                  className="block w-full text-left px-3 py-2 text-sm text-fg-muted hover:bg-surface-2 hover:text-fg truncate font-mono transition-colors"
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {functions.length > 0 && (
          <select
            value={selectedFn}
            onChange={(e) => setSelectedFn(e.target.value)}
            className="bg-surface-1 border border-surface-3 rounded-lg px-3 py-2 text-sm font-medium text-fg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
          >
            <option value="">Select function...</option>
            {functions.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name} (line {f.startLine})
              </option>
            ))}
          </select>
        )}
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-fg-muted">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Tracking function history...
          </div>
        </div>
      )}

      {history && history.versions.length > 0 && (
        <div className="flex-1 min-h-0 overflow-auto space-y-3">
          <p className="text-sm font-medium text-fg-muted">
            {history.versions.length} version{history.versions.length > 1 ? 's' : ''} found
          </p>

          {history.versions.map((v, i) => (
            <div
              key={v.hash}
              className={`bg-surface-1 border rounded-xl p-5 transition-all shadow-sm ${
                compareIdx && (compareIdx[0] === i || compareIdx[1] === i)
                  ? 'border-accent ring-1 ring-accent/20'
                  : 'border-surface-3'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-accent-light">{v.hash.slice(0, 8)}</span>
                  <span className="text-sm font-semibold text-fg">{v.author}</span>
                  <span className="text-xs text-fg-faint">{new Date(v.date).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => {
                    if (!compareIdx) setCompareIdx([i, -1])
                    else if (compareIdx[1] === -1 && compareIdx[0] !== i) setCompareIdx([compareIdx[0], i])
                    else setCompareIdx(null)
                  }}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                    compareIdx && compareIdx[0] === i
                      ? 'bg-accent text-white'
                      : 'bg-surface-2 text-fg-muted hover:text-fg hover:bg-surface-3'
                  }`}
                >
                  {compareIdx && compareIdx[0] === i ? 'Selected' : 'Compare'}
                </button>
              </div>
              <p className="text-xs text-fg-muted mb-3">{v.message}</p>
              <pre className="bg-[var(--code-bg)] rounded-lg p-3 overflow-x-auto text-xs leading-relaxed">
                <code className="text-fg">{v.body}</code>
              </pre>
            </div>
          ))}

          {compareIdx && compareIdx[1] >= 0 && (
            <CompareView
              a={history.versions[compareIdx[0]]}
              b={history.versions[compareIdx[1]]}
              onClose={() => setCompareIdx(null)}
            />
          )}
        </div>
      )}

      {history && history.versions.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-fg-muted font-medium">
          No history found for this function
        </div>
      )}

      {!selectedFile && !loading && (
        <div className="flex-1 flex items-center justify-center text-fg-faint">
          Search for a file, then select a function to see its evolution
        </div>
      )}
    </div>
  )
}

function CompareView({
  a,
  b,
  onClose,
}: {
  a: { hash: string; date: string; author: string; body: string }
  b: { hash: string; date: string; author: string; body: string }
  onClose: () => void
}) {
  const aLines = a.body.split('\n')
  const bLines = b.body.split('\n')

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-8">
      <div className="bg-surface-1 rounded-2xl border border-surface-3 w-full max-w-6xl max-h-full overflow-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-surface-3">
          <h3 className="text-fg font-bold">Compare Versions</h3>
          <button onClick={onClose} className="text-fg-faint hover:text-fg transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-0">
          <div className="border-r border-surface-3 p-5">
            <p className="text-xs text-fg-faint mb-3 font-mono font-bold">{a.hash.slice(0, 8)} — {a.author} — {new Date(a.date).toLocaleDateString()}</p>
            <pre className="text-xs leading-relaxed whitespace-pre-wrap">
              {aLines.map((line, i) => {
                const changed = bLines[i] !== line
                return (
                  <div key={i} className={changed ? 'bg-[var(--diff-del-bg)]' : ''}>
                    <span className="text-fg-faint select-none inline-block w-8 text-right mr-2 tabular-nums">{i + 1}</span>
                    <span className={changed ? 'text-[var(--diff-del-text)]' : 'text-fg'}>{line}</span>
                  </div>
                )
              })}
            </pre>
          </div>
          <div className="p-5">
            <p className="text-xs text-fg-faint mb-3 font-mono font-bold">{b.hash.slice(0, 8)} — {b.author} — {new Date(b.date).toLocaleDateString()}</p>
            <pre className="text-xs leading-relaxed whitespace-pre-wrap">
              {bLines.map((line, i) => {
                const changed = aLines[i] !== line
                return (
                  <div key={i} className={changed ? 'bg-[var(--diff-add-bg)]' : ''}>
                    <span className="text-fg-faint select-none inline-block w-8 text-right mr-2 tabular-nums">{i + 1}</span>
                    <span className={changed ? 'text-[var(--diff-add-text)]' : 'text-fg'}>{line}</span>
                  </div>
                )
              })}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
