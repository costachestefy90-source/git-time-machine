import type {
  BlameLine,
  BusFactorEntry,
  CoChangePair,
  CommitInfo,
  ContributorStats,
  DayActivity,
  FileChurn,
  FileOwnership,
  FileRisk,
  FileSizePoint,
  FunctionInfo,
  SearchResult,
  StaleFile,
} from './api'

type ContributorSeed = {
  name: string
  email: string
  weight: number
}

type DemoRepository = {
  repo: string
  path: string
  description: string
  seed: number
  commitScale: number
  riskBias: number
  activityLevel: number
  authors: ContributorSeed[]
  files: string[]
}

export const DEMO_REPOSITORIES: Record<string, DemoRepository> = {
  'git-time-machine': {
    repo: 'Git Time Machine',
    path: '/sample/git-time-machine',
    description: 'A sample snapshot of the project dashboard.',
    seed: 17,
    commitScale: 58,
    riskBias: 18,
    activityLevel: 33,
    authors: [
      { name: 'Steff', email: 'steff@example.test', weight: 0.52 },
      { name: 'Mina Park', email: 'mina@example.test', weight: 0.29 },
      { name: 'Jon Bell', email: 'jon@example.test', weight: 0.19 },
    ],
    files: [
      'src/analyzer/git.ts',
      'src/analyzer/churn.ts',
      'src/analyzer/risk.ts',
      'src/analyzer/contributors.ts',
      'src/server/index.ts',
      'src/web/App.tsx',
      'src/web/index.css',
      'src/web/lib/api.ts',
      'src/web/pages/ChurnHeatmap.tsx',
      'src/web/pages/RiskDashboard.tsx',
      'src/web/pages/BlameExplorer.tsx',
      'src/web/pages/ActivityTimeline.tsx',
      'src/web/pages/ContributorDNA.tsx',
      'src/web/pages/FunctionTimeline.tsx',
      'README.md',
    ],
  },
  'signal-lab': {
    repo: 'Signal Lab',
    path: '/sample/signal-lab',
    description: 'A fast-moving experiment tracker with a broad team.',
    seed: 31,
    commitScale: 92,
    riskBias: 6,
    activityLevel: 54,
    authors: [
      { name: 'Ari Kim', email: 'ari@example.test', weight: 0.27 },
      { name: 'Ravi Shah', email: 'ravi@example.test', weight: 0.21 },
      { name: 'June Alvarez', email: 'june@example.test', weight: 0.17 },
      { name: 'Four others', email: 'team@example.test', weight: 0.35 },
    ],
    files: [
      'packages/runner/src/queue.ts',
      'packages/runner/src/retry.ts',
      'packages/metrics/src/series.ts',
      'packages/metrics/src/compare.ts',
      'apps/lab/src/ExperimentView.tsx',
      'apps/lab/src/RunTable.tsx',
      'apps/lab/src/routes.ts',
      'apps/lab/src/styles.css',
      'docs/results/weekly.md',
      'docs/results/archive.md',
      'tests/runner/queue.test.ts',
      'tests/metrics/series.test.ts',
      'README.md',
    ],
  },
  'harbor-api': {
    repo: 'Harbor API',
    path: '/sample/harbor-api',
    description: 'A service with a few concentrated areas worth reviewing.',
    seed: 49,
    commitScale: 132,
    riskBias: 28,
    activityLevel: 42,
    authors: [
      { name: 'Elena Rossi', email: 'elena@example.test', weight: 0.47 },
      { name: 'Mateo Silva', email: 'mateo@example.test', weight: 0.29 },
      { name: 'Sam Okafor', email: 'sam@example.test', weight: 0.12 },
      { name: 'Two others', email: 'team@example.test', weight: 0.12 },
    ],
    files: [
      'src/auth/session.ts',
      'src/auth/tokens.ts',
      'src/routes/webhooks.ts',
      'src/routes/health.ts',
      'src/db/migrations/index.ts',
      'src/db/client.ts',
      'src/notifications/send.ts',
      'src/notifications/templates.ts',
      'src/jobs/cleanup.ts',
      'src/config/runtime.ts',
      'tests/auth/session.test.ts',
      'tests/routes/webhooks.test.ts',
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

function selectedRepository(): DemoRepository {
  return DEMO_REPOSITORIES[getDemoSampleKey()] || DEMO_REPOSITORIES['git-time-machine']
}

function dateDaysAgo(days: number): Date {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return date
}

function isoDaysAgo(days: number): string {
  return dateDaysAgo(days).toISOString()
}

function dateOnlyDaysAgo(days: number): string {
  return isoDaysAgo(days).slice(0, 10)
}

function authorNames(repository: DemoRepository): string[] {
  return repository.authors.map((author) => author.name)
}

function makeChurn(repository: DemoRepository): FileChurn[] {
  const names = authorNames(repository)
  return repository.files.map((path, index) => {
    const commits = Math.max(2, Math.round(repository.commitScale * (1 - index / (repository.files.length + 4)) / 4) + ((repository.seed + index * 5) % 7))
    const additions = commits * (7 + ((repository.seed + index) % 14))
    const deletions = Math.round(additions * (0.25 + ((repository.seed + index) % 4) / 10))
    const authorCount = Math.min(names.length, 1 + ((index + repository.seed) % names.length))
    return {
      path,
      commits,
      additions,
      deletions,
      authors: names.slice(0, authorCount),
      lastModified: isoDaysAgo((index * 11 + repository.seed) % 160),
    }
  }).sort((a, b) => b.commits - a.commits)
}

function makeContributors(repository: DemoRepository): ContributorStats[] {
  const totalCommits = repository.commitScale * 2
  return repository.authors.map((author, index) => {
    const commits = Math.max(1, Math.round(totalCommits * author.weight))
    const additions = commits * (18 + ((repository.seed + index * 4) % 16))
    const deletions = Math.round(additions * (0.18 + index * 0.06))
    return {
      name: author.name,
      email: author.email,
      commits,
      additions,
      deletions,
      files: repository.files.filter((_, fileIndex) => (fileIndex + index) % Math.max(2, index + 2) !== 1).slice(0, 10 + index * 2),
      firstCommit: isoDaysAgo(360 - index * 38),
      lastCommit: isoDaysAgo(index * 3),
    }
  })
}

function makeRisk(repository: DemoRepository, churn: FileChurn[]): FileRisk[] {
  const owner = repository.authors[0]
  return churn.slice(0, 12).map((file, index) => {
    const churnScore = Math.min(98, 28 + file.commits * 2 + (index % 3) * 5)
    const ownershipScore = Math.min(94, Math.round(repository.authors[0].weight * 100) + (index % 4) * 5)
    const ageScore = Math.min(93, repository.riskBias + 12 + (index * 7) % 42)
    const score = Math.min(96, Math.round(churnScore * 0.4 + ownershipScore * 0.35 + ageScore * 0.25))
    return {
      path: file.path,
      score,
      churnScore,
      ownershipScore,
      ageScore,
      commits: file.commits,
      authors: file.authors.length,
      daysSinceLastChange: (index * 19 + repository.seed) % 260,
      topOwner: owner.name,
      topOwnerPct: Math.round(owner.weight * 100),
    }
  }).sort((a, b) => b.score - a.score)
}

function makeOwnership(repository: DemoRepository, file: string): FileOwnership {
  const names = repository.authors
  const first = Math.round(names[0].weight * 100)
  const remaining = 100 - first
  const owners = names.map((author, index) => ({
    name: author.name,
    email: author.email,
    percentage: index === 0 ? first : Math.round(remaining * author.weight / Math.max(0.01, 1 - names[0].weight)),
  }))
  const difference = 100 - owners.reduce((sum, owner) => sum + owner.percentage, 0)
  if (owners.length > 1) owners[owners.length - 1].percentage += difference
  return {
    path: file,
    owners,
    totalLines: 80 + ((repository.seed + file.length) % 380),
  }
}

function makeActivity(repository: DemoRepository): DayActivity[] {
  const names = authorNames(repository)
  const activity: DayActivity[] = []
  for (let daysAgo = 364; daysAgo >= 0; daysAgo--) {
    const signal = (daysAgo * 17 + repository.seed * 13) % 100
    if (signal < repository.activityLevel || signal > 94) {
      const commits = 1 + ((signal + repository.seed) % 7)
      activity.push({
        date: dateOnlyDaysAgo(daysAgo),
        commits,
        authors: names.slice(0, 1 + ((signal + daysAgo) % names.length)),
      })
    }
  }
  return activity
}

function makeLog(repository: DemoRepository): CommitInfo[] {
  const messages = [
    'Tighten the data view',
    'Add a focused detail panel',
    'Handle empty history safely',
    'Document the analysis flow',
    'Refine the activity chart',
    'Split the repository helpers',
    'Add keyboard-friendly controls',
    'Fix a stale file calculation',
  ]
  return Array.from({ length: 14 }, (_, index) => ({
    hash: `${(repository.seed + index + 1).toString(16).padStart(2, '0')}${'abc1234'.repeat(8)}`.slice(0, 40),
    date: isoDaysAgo(index * 9 + 2),
    author: repository.authors[index % repository.authors.length].name,
    email: repository.authors[index % repository.authors.length].email,
    message: messages[index % messages.length],
    files: repository.files.slice(index % 3, 3 + (index % 5)),
  }))
}

function makeBlame(repository: DemoRepository, file: string): BlameLine[] {
  const snippets = [
    `export function inspect${file.split('/').pop()?.split('.')[0] || 'Repository'}() {`,
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
    const hash = `${(repository.seed + index + 20).toString(16).padStart(2, '0')}${'def5678'.repeat(8)}`.slice(0, 40)
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

function makeFunctions(file: string): { name: string; startLine: number; endLine: number }[] {
  const base = file.split('/').pop()?.split('.')[0] || 'module'
  const clean = base.replace(/[^a-zA-Z0-9]/g, '')
  return [
    { name: `inspect${clean[0]?.toUpperCase() || ''}${clean.slice(1)}`, startLine: 8, endLine: 24 },
    { name: 'summarizeChanges', startLine: 27, endLine: 46 },
    { name: 'sortByPressure', startLine: 49, endLine: 61 },
  ]
}

function makeFunctionHistory(repository: DemoRepository, file: string, name: string): FunctionInfo {
  const authors = repository.authors
  const versions = [
    'function VALUE(input) {\n  return input\n}',
    'function VALUE(input) {\n  const result = normalize(input)\n  return result\n}',
    'function VALUE(input) {\n  const result = normalize(input)\n  return result.filter(isUseful)\n}',
  ]
  return {
    name,
    file,
    startLine: 8,
    endLine: 24,
    versions: versions.map((body, index) => ({
      hash: `${(repository.seed + index + 60).toString(16).padStart(2, '0')}${'789abcd'.repeat(8)}`.slice(0, 40),
      date: isoDaysAgo(190 - index * 70),
      author: authors[index % authors.length].name,
      message: ['Start with a simple return', 'Normalize incoming values', 'Ignore low-signal changes'][index],
      body: body.replaceAll('VALUE', name),
    })),
  }
}

function makeTrend(repository: DemoRepository, file: string): FileSizePoint[] {
  return Array.from({ length: 8 }, (_, index) => {
    const lines = 80 + index * (8 + (repository.seed % 5)) + ((file.length + index) % 7)
    return {
      hash: `${(repository.seed + index + 90).toString(16).padStart(2, '0')}${'fedcba9'.repeat(8)}`.slice(0, 40),
      date: isoDaysAgo(240 - index * 34),
      author: repository.authors[index % repository.authors.length].name,
      message: ['Create the file', 'Add the first view', 'Wire in history', 'Improve empty states'][index % 4],
      lines,
      size: lines * 42,
    }
  })
}

function makeBusFactor(repository: DemoRepository): BusFactorEntry[] {
  const folders = Array.from(new Set(repository.files.map((file) => file.split('/').slice(0, 2).join('/')))).slice(0, 6)
  return folders.map((folder, index) => {
    const first = Math.max(38, Math.round(repository.authors[0].weight * 100) - index * 3)
    const second = Math.min(35, 100 - first - 8)
    const third = Math.max(1, 100 - first - second)
    const risk = first > 80 ? 'critical' : first > 55 ? 'high' : first > 40 ? 'medium' : 'low'
    return {
      folder,
      busFactor: first > 55 ? 1 : 2,
      risk,
      totalCommits: repository.commitScale + index * 7,
      contributors: [
        { name: repository.authors[0].name, commits: first, percentage: first },
        { name: repository.authors[1 % repository.authors.length].name, commits: second, percentage: second },
        { name: repository.authors[2 % repository.authors.length].name, commits: third, percentage: third },
      ],
    }
  })
}

function makeStale(repository: DemoRepository): StaleFile[] {
  return repository.files.slice(-6).map((path, index) => ({
    path,
    lastCommitDate: isoDaysAgo(190 + index * 115),
    lastAuthor: repository.authors[(index + 1) % repository.authors.length].name,
    lastMessage: ['Move old helper', 'Document the original behavior', 'Keep for compatibility'][index % 3],
    daysSinceChange: 190 + index * 115,
    totalCommits: 3 + index * 4,
  })).sort((a, b) => b.daysSinceChange - a.daysSinceChange)
}

function makeCoChanges(repository: DemoRepository): CoChangePair[] {
  return repository.files.slice(0, 10).map((fileA, index) => ({
    fileA,
    fileB: repository.files[(index + 3) % repository.files.length],
    cochanges: Math.max(3, 15 - index),
    confidence: Math.max(54, 94 - index * 5),
  }))
}

function makeHours(repository: DemoRepository): { hour: number; commits: number }[] {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    commits: Math.max(1, (repository.seed + hour * 7) % 18 - (hour < 7 || hour > 20 ? 5 : 0)),
  }))
}

function makeDays(repository: DemoRepository): { day: number; name: string; commits: number }[] {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((name, day) => ({
    day,
    name,
    commits: 8 + ((repository.seed + day * 9) % 24),
  }))
}

function makeSearchResults(repository: DemoRepository, query: string): SearchResult[] {
  return [
    ['Add a history search result', repository.files[0]],
    ['Keep the dashboard queryable', repository.files[5]],
    ['Document the TODO for cleanup', repository.files[repository.files.length - 1]],
  ].map(([message, file], index) => ({
    hash: `${(repository.seed + index + 120).toString(16).padStart(2, '0')}${'1234567'.repeat(8)}`.slice(0, 40),
    date: isoDaysAgo(20 + index * 38),
    author: repository.authors[index % repository.authors.length].name,
    message: `${message} (${query})`,
    file,
    diff: `@@ -${index + 4},4 +${index + 4},5 @@\n const result = inspect(history)\n-${query} was not included\n+${query} is now included\n return result`,
  }))
}

function makeRepositoryData(repository: DemoRepository) {
  const churn = makeChurn(repository)
  return {
    churn,
    contributors: makeContributors(repository),
    risk: makeRisk(repository, churn),
    ownership: repository.files.map((file) => makeOwnership(repository, file)),
    activity: makeActivity(repository),
    log: makeLog(repository),
    busFactor: makeBusFactor(repository),
    stale: makeStale(repository),
    cochange: makeCoChanges(repository),
    hours: makeHours(repository),
    days: makeDays(repository),
  }
}

const repositoryData = new Map<string, ReturnType<typeof makeRepositoryData>>()

function dataFor(repository: DemoRepository): ReturnType<typeof makeRepositoryData> {
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
    case '/log':
      return data.log as T
    case '/files':
      return repository.files as T
    case '/churn':
      return data.churn as T
    case '/contributors':
      return data.contributors as T
    case '/risk':
      return data.risk as T
    case '/ownership/all':
      return data.ownership as T
    case '/ownership': {
      const file = params?.file || repository.files[0]
      return (data.ownership.find((entry) => entry.path === file) || data.ownership[0]) as T
    }
    case '/activity':
      return data.activity as T
    case '/activity/hours':
      return data.hours as T
    case '/activity/days':
      return data.days as T
    case '/busfactor':
      return data.busFactor as T
    case '/stale': {
      const threshold = Number(params?.days || 180)
      return data.stale.filter((file) => file.daysSinceChange >= threshold) as T
    }
    case '/cochange':
      return data.cochange as T
    case '/blame':
      return makeBlame(repository, params?.file || repository.files[0]) as T
    case '/functions':
      return makeFunctions(params?.file || repository.files[0]) as T
    case '/function/history': {
      const file = params?.file || repository.files[0]
      const functions = makeFunctions(file)
      return makeFunctionHistory(repository, file, params?.name || functions[0].name) as T
    }
    case '/file-at':
      return { content: makeBlame(repository, params?.file || repository.files[0]).map((line) => line.content).join('\n') } as T
    case '/filetrend':
      return makeTrend(repository, params?.file || repository.files[0]) as T
    case '/diff':
      return { diff: `diff --git a/${params?.file || repository.files[0]} b/${params?.file || repository.files[0]}\n+ const summary = inspect(history)\n- return history\n+ return summarize(history)` } as T
    case '/search':
      return makeSearchResults(repository, params?.q || 'TODO') as T
    default:
      return [] as T
  }
}
