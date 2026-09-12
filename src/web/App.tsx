import React, { useEffect, useState } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import { DEMO_REPOSITORIES, getDemoSampleKey, isDemoMode } from './lib/demoData'

import ChurnHeatmap from './pages/ChurnHeatmap'
import FunctionTimeline from './pages/FunctionTimeline'
import BlameExplorer from './pages/BlameExplorer'
import ContributorDNA from './pages/ContributorDNA'
import RiskDashboard from './pages/RiskDashboard'
import HistorySearch from './pages/HistorySearch'
import ActivityTimeline from './pages/ActivityTimeline'
import StaleCodeFinder from './pages/StaleCodeFinder'
import BusFactorPage from './pages/BusFactorPage'
import CoChangeGraph from './pages/CoChangeGraph'
import FileSizeTrends from './pages/FileSizeTrends'
import Explanation from './pages/Explanation'

const NAV_SECTIONS = [
  {
    title: 'Analysis',
    items: [
      { path: '/', label: 'Churn Heatmap', icon: SvgFlame },
      { path: '/risk', label: 'Risk Dashboard', icon: SvgShield },
      { path: '/bus-factor', label: 'Bus Factor', icon: SvgUsers },
      { path: '/stale', label: 'Stale Code', icon: SvgClock },
      { path: '/cochange', label: 'Co-Changes', icon: SvgLink },
    ],
  },
  {
    title: 'Explore',
    items: [
      { path: '/functions', label: 'Function Timeline', icon: SvgCode },
      { path: '/blame', label: 'Blame Explorer', icon: SvgEye },
      { path: '/search', label: 'History Search', icon: SvgSearch },
      { path: '/trends', label: 'File Trends', icon: SvgTrend },
    ],
  },
  {
    title: 'People',
    items: [
      { path: '/contributors', label: 'Contributors', icon: SvgTeam },
      { path: '/activity', label: 'Activity', icon: SvgCalendar },
    ],
  },
  {
    title: 'Help',
    items: [
      { path: '/explanation', label: 'Explanation', icon: SvgBook },
    ],
  },
]

export default function App() {
  const [dark, setDark] = useState(true)
  const demo = isDemoMode()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div className="flex h-screen">
      <nav className="w-56 bg-surface-1 border-r border-surface-3 flex flex-col shrink-0 overflow-auto">
        <div className="px-5 pt-5 pb-4">
          <span className="text-sm font-bold text-fg tracking-tight">Git Time Machine</span>
        </div>

        {demo && <DemoPicker />}

        <div className="flex-1 px-3 pb-3 space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-[10px] uppercase tracking-widest text-fg-faint font-semibold px-2 mb-1.5">
                {section.title}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all duration-150 ${
                        isActive
                          ? 'bg-accent/10 text-accent-light font-medium'
                          : 'text-fg-muted hover:text-fg hover:bg-surface-2'
                      }`
                    }
                  >
                    <item.icon active={false} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-3 pb-4 mt-auto border-t border-surface-3 pt-3">
          <button
            onClick={() => setDark(!dark)}
            className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-[13px] text-fg-muted hover:text-fg hover:bg-surface-2 transition-all duration-150"
          >
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-auto p-6 bg-surface-0">
        <Routes>
          <Route path="/" element={<ChurnHeatmap />} />
          <Route path="/risk" element={<RiskDashboard />} />
          <Route path="/bus-factor" element={<BusFactorPage />} />
          <Route path="/stale" element={<StaleCodeFinder />} />
          <Route path="/cochange" element={<CoChangeGraph />} />
          <Route path="/functions" element={<FunctionTimeline />} />
          <Route path="/blame" element={<BlameExplorer />} />
          <Route path="/search" element={<HistorySearch />} />
          <Route path="/trends" element={<FileSizeTrends />} />
          <Route path="/contributors" element={<ContributorDNA />} />
          <Route path="/activity" element={<ActivityTimeline />} />
          <Route path="/explanation" element={<Explanation />} />
        </Routes>
      </main>
    </div>
  )
}

function DemoPicker() {
  const current = getDemoSampleKey()

  const changeSample = (value: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('demo', '1')
    url.searchParams.set('sample', value)
    window.location.assign(url.toString())
  }

  return (
    <div className="px-3 pb-4">
      <div className="rounded-lg bg-surface-2 border border-surface-3 p-3">
        <p className="text-[10px] uppercase tracking-widest text-accent-light font-bold">Demo data</p>
        <p className="text-[11px] text-fg-faint mt-1 mb-2">Choose a sample repository</p>
        <select
          value={current}
          onChange={(e) => changeSample(e.target.value)}
          className="w-full bg-surface-1 border border-surface-3 rounded-md px-2 py-1.5 text-xs font-semibold text-fg focus:outline-none focus:border-accent"
          aria-label="Choose a demo repository"
        >
          {Object.entries(DEMO_REPOSITORIES).map(([key, repository]) => (
            <option key={key} value={key}>{repository.repo}</option>
          ))}
        </select>
        <p className="text-[10px] text-fg-faint mt-2 leading-relaxed">Sample values are used here. Local analysis is unchanged.</p>
      </div>
    </div>
  )
}

function SvgFlame({ active: _ }: { active: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
}
function SvgShield({ active: _ }: { active: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
function SvgUsers({ active: _ }: { active: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function SvgClock({ active: _ }: { active: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function SvgLink({ active: _ }: { active: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
}
function SvgCode({ active: _ }: { active: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
}
function SvgEye({ active: _ }: { active: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
}
function SvgSearch({ active: _ }: { active: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function SvgTrend({ active: _ }: { active: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
}
function SvgTeam({ active: _ }: { active: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function SvgCalendar({ active: _ }: { active: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function SvgBook({ active: _ }: { active: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
}
