import { NavLink, Route, Routes } from 'react-router-dom'
import { DEMO_REPOSITORIES, getDemoSampleKey, isDemoMode } from './lib/demoData'

import ActivityTimeline from './pages/ActivityTimeline'
import ChurnHeatmap from './pages/ChurnHeatmap'
import HistorySearch from './pages/HistorySearch'

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/churn', label: 'Churn heatmap' },
  { path: '/activity', label: 'Activity' },
  { path: '/search', label: 'Search history' },
]

const VIEW_CARDS = [
  { path: '/churn', label: 'Churn heatmap' },
  { path: '/activity', label: 'Activity' },
  { path: '/search', label: 'Search history' },
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

        <nav className="px-3 pb-3 flex-1">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => isActive
                  ? 'block px-2.5 py-2 rounded-md text-[13px] bg-accent/10 text-accent-light font-medium'
                  : 'block px-2.5 py-2 rounded-md text-[13px] text-fg-muted hover:text-fg hover:bg-surface-2'
                }
              >
                {item.label}
              </NavLink>
            ))}
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
