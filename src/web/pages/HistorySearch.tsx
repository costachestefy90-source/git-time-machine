import React, { useState } from 'react'
import { api, SearchResult } from '../lib/api'

export default function HistorySearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const doSearch = () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    api.search(query.trim()).then((r) => { setResults(r); setLoading(false) })
  }

  return (
    <div className="h-full flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-fg">History Search</h2>
        <p className="text-sm text-fg-muted mt-0.5">Find when a string was added or removed across all history</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doSearch()}
          placeholder='Search string (e.g. "TODO", "fetchUser", "bug fix")...'
          className="flex-1 bg-surface-1 border border-surface-3 rounded-lg px-4 py-2.5 text-sm font-medium text-fg placeholder-fg-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
        />
        <button
          onClick={doSearch}
          disabled={loading || !query.trim()}
          className="px-6 py-2.5 bg-accent rounded-lg text-sm font-bold text-white hover:bg-accent-dim disabled:opacity-50 transition-all shadow-sm"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-fg-muted">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Searching git history...
          </div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="flex-1 min-h-0 overflow-auto space-y-2">
          <p className="text-sm font-semibold text-fg-muted">{results.length} result{results.length > 1 ? 's' : ''} found</p>
          {results.map((r, i) => {
            const key = `${r.hash}-${r.file}-${i}`
            const isExpanded = expanded === key
            return (
              <div
                key={key}
                className="bg-surface-1 border border-surface-3 rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : key)}
                  className="w-full text-left p-4 hover:bg-surface-2 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono font-bold text-accent-light">{r.hash.slice(0, 8)}</span>
                    <span className="text-sm font-semibold text-fg">{r.author}</span>
                    <span className="text-xs text-fg-faint">{new Date(r.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-fg-muted mb-1">{r.message}</p>
                  <p className="text-xs text-fg-faint font-mono">{r.file}</p>
                </button>
                {isExpanded && r.diff && (
                  <div className="border-t border-surface-3 p-4 bg-[var(--code-bg)]">
                    <pre className="text-xs overflow-x-auto leading-relaxed">
                      {r.diff.split('\n').map((line, li) => (
                        <div
                          key={li}
                          className={
                            line.startsWith('+') ? 'text-[var(--diff-add-text)] bg-[var(--diff-add-bg)]' :
                            line.startsWith('-') ? 'text-[var(--diff-del-text)] bg-[var(--diff-del-bg)]' : 'text-fg-muted'
                          }
                        >
                          {line}
                        </div>
                      ))}
                    </pre>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-fg-faint font-medium">
          No results found for "{query}"
        </div>
      )}

      {!searched && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-fg-faint gap-4">
          <p className="font-medium">Search for any string to find when it appeared or disappeared</p>
          <div className="flex gap-2">
            {['TODO', 'HACK', 'FIXME', 'deprecated'].map((s) => (
              <button
                key={s}
                onClick={() => { setQuery(s); }}
                className="text-xs px-4 py-2 bg-surface-1 border border-surface-3 rounded-lg text-fg-muted font-semibold hover:text-fg hover:border-accent transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
