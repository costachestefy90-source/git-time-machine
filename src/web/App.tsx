import { NavLink, Route, Routes } from 'react-router-dom'
import { DEMO_REPOSITORIES, getDemoSampleKey, isDemoMode } from './lib/demoData'

import ActivityTimeline from './pages/ActivityTimeline'
import BlameExplorer from './pages/BlameExplorer'
import ChurnHeatmap from './pages/ChurnHeatmap'
import HistorySearch from './pages/HistorySearch'

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: SvgHome },
  { path: '/churn', label: 'Churn heatmap', icon: SvgFlame },
  { path: '/activity', label: 'Activity', icon: SvgCalendar },
  { path: '/search', label: 'Search history', icon: SvgSearch },
  { path: '/blame', label: 'Blame a file', icon: SvgEye },
]

const VIEW_CARDS = [
  { path: '/churn', label: 'Churn heatmap' },
  { path: '/activity', label: 'Activity' },
  { path: '/search', label: 'Search history' },
  { path: '/blame', label: 'Blame a file' },
]

export default function App() {
  const demo = isDemoMode()

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-56 bg-surface-1 border-b md:border-b-0 md:border-r border-surface-3 flex flex-col shrink-0">
        <div className="px-4 pt-4 pb-3">
          <p className="text-sm font-bold text-fg">Git Time Machine</p>
        </div>

        {demo && <DemoPicker />}

        <nav className="px-3 pb-3 flex-1" aria-label="Views">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2.5 py-2 rounded-md text-[13px] ${
                      isActive
                        ? 'bg-accent/10 text-accent-light font-medium'
                        : 'text-fg-muted hover:text-fg hover:bg-surface-2'
                    }`
                  }
                >
                  <Icon />
                  {item.label}
                </NavLink>
              )
            })}
          </div>
        </nav>

      </aside>

      <main className="flex-1 overflow-auto bg-surface-0 p-4 sm:p-5">
        <div className="w-full">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/churn" element={<ChurnHeatmap />} />
            <Route path="/activity" element={<ActivityTimeline />} />
            <Route path="/search" element={<HistorySearch />} />
            <Route path="/blame" element={<BlameExplorer />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function DemoPicker() {
  const current = getDemoSampleKey()

  function changeSample(value: string) {
    const url = new URL(window.location.href)
    url.searchParams.set('demo', '1')
    url.searchParams.set('sample', value)
    window.location.assign(url.toString())
  }

  return (
    <div className="px-3 pb-3">
        <label className="block text-[10px] uppercase tracking-widest text-fg-faint font-bold mb-1" htmlFor="demo-repository">
          Demo repository
        </label>
        <select
          id="demo-repository"
          value={current}
          onChange={(event) => changeSample(event.target.value)}
          className="w-full bg-surface-2 border border-surface-3 rounded px-2 py-1.5 text-xs text-fg focus:outline-none focus:border-accent"
          aria-label="Choose a demo repository"
        >
          {Object.entries(DEMO_REPOSITORIES).map(([key, repository]) => (
            <option key={key} value={key}>{repository.repo}</option>
          ))}
        </select>
    </div>
  )
}

function Overview() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-fg">Git Time Machine</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
        {VIEW_CARDS.map((card) => (
          <NavLink
            key={card.path}
            to={card.path}
            className="border border-surface-3 bg-surface-1 rounded-md p-4 hover:bg-surface-2"
          >
            <p className="text-sm font-semibold text-fg">{card.label}</p>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

function SvgHome() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9" /><path d="M9 20v-6h6v6" /></svg>
}

function SvgFlame() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
}

function SvgCalendar() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}

function SvgSearch() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
}

function SvgEye() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
}
