const COLORS = ['#8f9cff', '#6dd2ad', '#e8bd78']

const repositories = {
  'orbit-notes': {
    name: 'Orbit Notes',
    description: 'A small documentation site that grew around a launch checklist.',
    range: 'Apr 08 — May 17, 2026',
    stats: [
      ['Commits', '86', 'over 40 days'],
      ['Files', '34', '4 changed this week'],
      ['Contributors', '3', '1 primary owner'],
      ['Risk score', '38', 'moderate exposure'],
    ],
    hotspots: [
      ['src/launch/checklist.ts', 92, '18 commits'],
      ['src/content/guide.md', 71, '13 commits'],
      ['src/components/StatusCard.tsx', 58, '9 commits'],
      ['src/data/missions.json', 42, '7 commits'],
    ],
    contributors: [
      ['Maya Chen', 'product + code', 52, 45],
      ['Noah Williams', 'frontend', 31, 27],
      ['Inez Patel', 'docs', 17, 14],
    ],
    activity: [7, 11, 8, 16, 13, 9, 14, 8],
    focusTitle: 'The checklist is carrying the most change.',
    focusText: 'It has nearly twice the change pressure of the next file. Before adding another launch option, it may be worth splitting the validation rules from the display logic.',
    rhythm: [
      ['Busiest month', 'May'],
      ['Peak day', 'Tuesday'],
      ['Longest quiet spell', '4 days'],
    ],
    seed: 11,
    peaks: [2, 11, 24, 39, 53, 67],
  },
  'signal-lab': {
    name: 'Signal Lab',
    description: 'An experiment tracker with a quick pace and a wide contributor circle.',
    range: 'Jan 12 — May 17, 2026',
    stats: [
      ['Commits', '214', 'over 126 days'],
      ['Files', '118', '12 changed this week'],
      ['Contributors', '8', 'healthy spread'],
      ['Risk score', '24', 'low exposure'],
    ],
    hotspots: [
      ['packages/runner/src/queue.ts', 84, '31 commits'],
      ['apps/lab/src/ExperimentView.tsx', 65, '24 commits'],
      ['packages/metrics/src/series.ts', 53, '19 commits'],
      ['docs/results/weekly.md', 39, '14 commits'],
    ],
    contributors: [
      ['Ari Kim', 'platform', 27, 58],
      ['Ravi Shah', 'data', 21, 45],
      ['June Alvarez', 'frontend', 17, 36],
      ['Five others', 'mixed roles', 35, 75],
    ],
    activity: [19, 24, 31, 27, 38, 29, 25, 21],
    focusTitle: 'The project is busy without one person holding it together.',
    focusText: 'The largest contributor owns 27% of the commits, and the most changed files have several people around them. That spread lowers the risk of a single point of knowledge.',
    rhythm: [
      ['Busiest month', 'March'],
      ['Peak day', 'Thursday'],
      ['Longest quiet spell', '2 days'],
    ],
    seed: 27,
    peaks: [5, 9, 22, 34, 47, 60, 73, 82],
  },
  'harbor-api': {
    name: 'Harbor API',
    description: 'A service that has settled down, but still has a few old docks to inspect.',
    range: 'Aug 21, 2025 — May 17, 2026',
    stats: [
      ['Commits', '463', 'over 270 days'],
      ['Files', '207', '6 changed this week'],
      ['Contributors', '5', '2 primary owners'],
      ['Risk score', '67', 'high exposure'],
    ],
    hotspots: [
      ['src/auth/session.ts', 97, '66 commits'],
      ['src/routes/webhooks.ts', 88, '48 commits'],
      ['src/db/migrations/index.ts', 73, '39 commits'],
      ['src/notifications/send.ts', 61, '27 commits'],
    ],
    contributors: [
      ['Elena Rossi', 'backend', 47, 218],
      ['Mateo Silva', 'infrastructure', 29, 134],
      ['Sam Okafor', 'frontend', 12, 55],
      ['Two others', 'mixed roles', 12, 56],
    ],
    activity: [42, 58, 65, 49, 37, 32, 28, 24],
    focusTitle: 'Authentication is the project’s clearest risk area.',
    focusText: 'The session module changes often and nearly half of all commits come from one owner. That does not mean the code is broken; it does suggest a good place for shared documentation or pairing.',
    rhythm: [
      ['Busiest month', 'October'],
      ['Peak day', 'Wednesday'],
      ['Longest quiet spell', '11 days'],
    ],
    seed: 44,
    peaks: [1, 4, 7, 17, 31, 45, 59, 76],
  },
}

const select = document.querySelector('#repoSelect')
const randomButton = document.querySelector('#randomExample')
const tabs = [...document.querySelectorAll('.tab')]
const panels = [...document.querySelectorAll('.view-panel')]

function seededHeatmap(seed, peaks) {
  let value = seed
  return Array.from({ length: 84 }, (_, index) => {
    value = (value * 9301 + 49297) % 233280
    const random = value / 233280
    const peak = peaks.includes(index) || peaks.includes(index - 1)
    if (peak) return 4
    if (random > 0.83) return 3
    if (random > 0.62) return 2
    if (random > 0.38) return 1
    return 0
  })
}

function initials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function renderStats(repository) {
  document.querySelector('#stats').innerHTML = repository.stats
    .map(
      ([label, value, detail]) => `
        <article class="stat">
          <div class="stat-label">${label}</div>
          <div class="stat-value">${value}</div>
          <div class="stat-detail">${detail}</div>
        </article>
      `,
    )
    .join('')
}

function renderHeatmap(repository) {
  const values = seededHeatmap(repository.seed, repository.peaks)
  document.querySelector('#heatmap').innerHTML = values
    .map((level, index) => {
      const day = new Date(2026, 3, 1 + index)
      const commits = level === 0 ? 0 : level + (index % 3)
      const date = day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      return `<i class="heat-cell level-${level}" title="${date}: ${commits} commit${commits === 1 ? '' : 's'}"></i>`
    })
    .join('')
}

function renderHotspots(repository) {
  document.querySelector('#hotspotList').innerHTML = repository.hotspots
    .map(
      ([file, score, commits]) => `
        <div class="file-row">
          <div class="file-topline">
            <span class="file-name" title="${file}">${file}</span>
            <span class="file-score">${score}</span>
          </div>
          <div class="bar-track" aria-label="${file} change score ${score} out of 100">
            <div class="bar-fill" style="width: ${score}%"></div>
          </div>
          <div class="file-bottomline"><span>change score</span><span>${commits}</span></div>
        </div>
      `,
    )
    .join('')
}

function renderOwnership(repository) {
  const total = repository.contributors.reduce((sum, contributor) => sum + contributor[3], 0)
  const percentages = repository.contributors.slice(0, 3).map((contributor) => Math.round((contributor[3] / total) * 100))
  const first = percentages[0] || 0
  const second = percentages[1] || 0
  const stopOne = first * 3.6
  const stopTwo = (first + second) * 3.6
  document.querySelector('#donut').style.background = `conic-gradient(${COLORS[0]} 0deg ${stopOne}deg, ${COLORS[1]} ${stopOne}deg ${stopTwo}deg, ${COLORS[2]} ${stopTwo}deg 360deg)`
  document.querySelector('#donut').setAttribute('aria-label', `${repository.name} contributor commit share`)
  document.querySelector('#ownershipLegend').innerHTML = repository.contributors
    .slice(0, 3)
    .map(
      ([name, role, share], index) => `
        <div class="owner-key">
          <i style="background: ${COLORS[index]}"></i>
          <strong>${name}</strong>
          <span>${share}% · ${role}</span>
        </div>
      `,
    )
    .join('')

  document.querySelector('#contributors').innerHTML = repository.contributors
    .map(
      ([name, role, share, commits]) => `
        <div class="contributor-row">
          <span class="avatar" aria-hidden="true">${initials(name)}</span>
          <span><span class="contributor-name">${name}</span><span class="contributor-role">${role}</span></span>
          <span class="contributor-share">${share}%</span>
          <span class="contributor-commits">${commits}</span>
        </div>
      `,
    )
    .join('')
}

function renderActivity(repository) {
  const max = Math.max(...repository.activity)
  const total = repository.activity.reduce((sum, month) => sum + month, 0)
  const labels = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']
  document.querySelector('#activityTotal').textContent = `${total} commits shown`
  document.querySelector('#activityChart').innerHTML = repository.activity
    .map(
      (commits, index) => `
        <div class="month-column">
          <span class="month-value">${commits}</span>
          <div class="month-bar-wrap"><div class="month-bar" style="height: ${(commits / max) * 100}%"></div></div>
          <span class="month-label">${labels[index]}</span>
        </div>
      `,
    )
    .join('')
  document.querySelector('#rhythmCards').innerHTML = repository.rhythm
    .map(([label, value]) => `<article class="rhythm-card"><span>${label}</span><strong>${value}</strong></article>`)
    .join('')
}

function renderRepository(key) {
  const repository = repositories[key]
  if (!repository) return

  document.title = `${repository.name} — Git Time Machine demo`
  document.querySelector('#sampleSummary').textContent = `${repository.name} · ${repository.description}`
  document.querySelector('#overviewRange').textContent = repository.range
  document.querySelector('#ownershipRange').textContent = repository.range
  document.querySelector('#activityRange').textContent = repository.range
  document.querySelector('#focusTitle').textContent = repository.focusTitle
  document.querySelector('#focusText').textContent = repository.focusText
  renderStats(repository)
  renderHeatmap(repository)
  renderHotspots(repository)
  renderOwnership(repository)
  renderActivity(repository)
}

function setView(view) {
  tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.view === view))
  panels.forEach((panel) => {
    const visible = panel.id === `view-${view}`
    panel.hidden = !visible
    panel.classList.toggle('is-visible', visible)
  })
}

tabs.forEach((tab) => tab.addEventListener('click', () => setView(tab.dataset.view)))

select.addEventListener('change', () => {
  renderRepository(select.value)
  window.history.replaceState({}, '', `?repo=${encodeURIComponent(select.value)}`)
})

randomButton.addEventListener('click', () => {
  const keys = Object.keys(repositories)
  const next = keys[(keys.indexOf(select.value) + 1) % keys.length]
  select.value = next
  renderRepository(next)
  window.history.replaceState({}, '', `?repo=${encodeURIComponent(next)}`)
})

const requestedRepository = new URLSearchParams(window.location.search).get('repo')
if (requestedRepository && repositories[requestedRepository]) {
  select.value = requestedRepository
}

renderRepository(select.value)
