import type { BlameLine, DayActivity, FileChurn, SearchResult } from './api'

type Author = { name: string; email: string }

type DemoRepository = {
  repo: string
  path: string
  seed: number
  commitScale: number
  activityLevel: number
  authors: Author[]
  files: string[]
}

export const DEMO_REPOSITORIES: Record<string, DemoRepository> = {
  'git-time-machine': {
    repo: 'Git Time Machine',
    path: '/sample/git-time-machine',
    seed: 17,
    commitScale: 58,
    activityLevel: 33,
    authors: [
      { name: 'Steff', email: 'steff@example.test' },
      { name: 'Mina Park', email: 'mina@example.test' },
      { name: 'Jon Bell', email: 'jon@example.test' },
    ],
    files: [
      'src/analyzer/git.ts',
      'src/analyzer/churn.ts',
      'src/server/index.ts',
      'src/web/App.tsx',
      'src/web/index.css',
      'src/web/lib/api.ts',
      'src/web/pages/ChurnHeatmap.tsx',
      'src/web/pages/ActivityTimeline.tsx',
      'src/web/pages/HistorySearch.tsx',
      'src/web/pages/BlameExplorer.tsx',
      'README.md',
    ],
  },
  'signal-lab': {
    repo: 'Signal Lab',
    path: '/sample/signal-lab',
    seed: 31,
    commitScale: 92,
    activityLevel: 54,
    authors: [
      { name: 'Ari Kim', email: 'ari@example.test' },
      { name: 'Ravi Shah', email: 'ravi@example.test' },
      { name: 'June Alvarez', email: 'june@example.test' },
    ],
    files: [
      'src/queue.ts',
      'src/retry.ts',
      'src/metrics.ts',
      'src/compare.ts',
      'src/ExperimentView.tsx',
      'src/RunTable.tsx',
      'src/routes.ts',
      'src/styles.css',
      'tests/queue.test.ts',
      'README.md',
    ],
  },
  'harbor-api': {
    repo: 'Harbor API',
    path: '/sample/harbor-api',
    seed: 49,
    commitScale: 132,
    activityLevel: 42,
    authors: [
      { name: 'Elena Rossi', email: 'elena@example.test' },
      { name: 'Mateo Silva', email: 'mateo@example.test' },
      { name: 'Sam Okafor', email: 'sam@example.test' },
    ],
    files: [
      'src/auth/session.ts',
      'src/auth/tokens.ts',
      'src/routes/webhooks.ts',
      'src/routes/health.ts',
      'src/db/client.ts',
      'src/notifications/send.ts',
      'src/jobs/cleanup.ts',
      'src/config/runtime.ts',
      'tests/session.test.ts',
      'README.md',
    ],
  },
}

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false
  const query = new URLSearchParams(window.location.search)
  return query.get('demo') === '1' || window.location.hostname.endsWith('github.io')
}

export function getDemoSampleKey(): string {
  if (typeof window === 'undefined') return 'git-time-machine'
  const requested = new URLSearchParams(window.location.search).get('sample')
  return requested && DEMO_REPOSITORIES[requested] ? requested : 'git-time-machine'
}

function selectedRepository() {
  return DEMO_REPOSITORIES[getDemoSampleKey()] || DEMO_REPOSITORIES['git-time-machine']
}

function dateDaysAgo(days: number) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return date
}

function isoDaysAgo(days: number) {
  return dateDaysAgo(days).toISOString()
}

function dateOnlyDaysAgo(days: number) {
  return isoDaysAgo(days).slice(0, 10)
}

function makeChurn(repository: DemoRepository): FileChurn[] {
  return repository.files.map((path, index) => {
    const commits = Math.max(
      2,
      Math.round(repository.commitScale * (1 - index / (repository.files.length + 4)) / 4) + ((repository.seed + index * 5) % 7),
    )
    const additions = commits * (7 + ((repository.seed + index) % 14))
    const deletions = Math.round(additions * (0.25 + ((repository.seed + index) % 4) / 10))
    const authorCount = 1 + ((index + repository.seed) % repository.authors.length)

    return {
      path,
      commits,
      additions,
      deletions,
      authors: repository.authors.slice(0, authorCount).map((author) => author.name),
      lastModified: isoDaysAgo((index * 11 + repository.seed) % 160),
    }
  }).sort((a, b) => b.commits - a.commits)
}

function makeActivity(repository: DemoRepository): DayActivity[] {
  const names = repository.authors.map((author) => author.name)
  const activity: DayActivity[] = []

  for (let daysAgo = 364; daysAgo >= 0; daysAgo--) {
    const signal = (daysAgo * 17 + repository.seed * 13) % 100
    if (signal < repository.activityLevel || signal > 94) {
      activity.push({
        date: dateOnlyDaysAgo(daysAgo),
        commits: 1 + ((signal + repository.seed) % 7),
        authors: names.slice(0, 1 + ((signal + daysAgo) % names.length)),
      })
    }
  }

  return activity
}

function makeDays(repository: DemoRepository) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((name, day) => ({
    day,
    name,
    commits: 8 + ((repository.seed + day * 9) % 24),
  }))
}

function makeBlame(repository: DemoRepository, file: string): BlameLine[] {
  const fileName = file.split('/').pop()?.split('.')[0] || 'Repository'
  const snippets = [
    'export function inspect' + fileName + '() {',
    '  const history = readHistory(repository)',
    '  const changes = groupByFile(history)',
    '  return changes.sort(byChangePressure)',
    '}',
    '',
    '// Keep the analysis local to the selected repository.',
    'const recent = history.filter(isRecent)',
    'return summarize(recent)',
  ]
  const messages = ['Add repository summary', 'Keep history local', 'Sort the result by pressure']

  return Array.from({ length: 18 }, (_, index) => {
    const author = repository.authors[index % repository.authors.length]
    const hash = ((repository.seed + index + 20).toString(16).padStart(2, '0') + 'def5678'.repeat(8)).slice(0, 40)

    return {
      line: index + 1,
      content: snippets[index % snippets.length],
      hash,
      author: author.name,
      email: author.email,
      date: isoDaysAgo(index * 17 + 5),
      message: messages[index % messages.length],
    }
  })
}

function makeSearchResults(repository: DemoRepository, query: string): SearchResult[] {
  const files = [repository.files[0], repository.files[Math.min(3, repository.files.length - 1)], repository.files[repository.files.length - 1]]
  const messages = ['Add a history search result', 'Keep the dashboard queryable', 'Document the cleanup']

  return files.map((file, index) => ({
    hash: ((repository.seed + index + 120).toString(16).padStart(2, '0') + '1234567'.repeat(8)).slice(0, 40),
    date: isoDaysAgo(20 + index * 38),
    author: repository.authors[index % repository.authors.length].name,
    message: messages[index] + ' (' + query + ')',
    file,
    diff: [
      '@@ -' + (index + 4) + ',4 +' + (index + 4) + ',5 @@',
      ' const result = inspect(history)',
      '-' + query + ' was not included',
      '+' + query + ' is now included',
      ' return result',
    ].join('\n'),
  }))
}

function makeRepositoryData(repository: DemoRepository) {
  return {
    churn: makeChurn(repository),
    activity: makeActivity(repository),
    days: makeDays(repository),
  }
}

const repositoryData = new Map<string, ReturnType<typeof makeRepositoryData>>()

function dataFor(repository: DemoRepository) {
  const existing = repositoryData.get(repository.repo)
  if (existing) return existing

  const created = makeRepositoryData(repository)
  repositoryData.set(repository.repo, created)
  return created
}

export function demoResponse<T>(path: string, params?: Record<string, string>): T {
  const repository = selectedRepository()
  const data = dataFor(repository)

  switch (path) {
    case '/info':
      return { repo: repository.repo, path: repository.path } as T
    case '/files':
      return repository.files as T
    case '/churn':
      return data.churn as T
    case '/activity':
      return data.activity as T
    case '/activity/days':
      return data.days as T
    case '/blame':
      return makeBlame(repository, params?.file || repository.files[0]) as T
    case '/search':
      return makeSearchResults(repository, params?.q || 'TODO') as T
    default:
      return [] as T
  }
}
