import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { isGitRepo, getRepoName, getLog, getBlame, getDiff, getTrackedFiles, getFileAtCommit } from '../analyzer/git.js'
import { analyzeChurn } from '../analyzer/churn.js'
import { analyzeContributors, analyzeOwnership, analyzeAllOwnership } from '../analyzer/contributors.js'
import { trackFunction, listFunctions } from '../analyzer/functions.js'
import { analyzeRisk } from '../analyzer/risk.js'
import { searchHistory } from '../analyzer/search.js'
import { analyzeActivity, analyzeHourDistribution, analyzeDayOfWeek } from '../analyzer/activity.js'
import { findStaleFiles } from '../analyzer/stale.js'
import { analyzeBusFactor } from '../analyzer/busfactor.js'
import { analyzeCoChanges } from '../analyzer/cochange.js'
import { getFileSizeTrend } from '../analyzer/filetrends.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function createServer(targetDir: string, port: number) {
  const app = express()
  app.use(cors())
  app.use(express.json())

  if (!isGitRepo(targetDir)) {
    console.error('Not a git repository:', targetDir)
    process.exit(1)
  }

  app.get('/api/info', (_req, res) => {
    res.json({ repo: getRepoName(targetDir), path: targetDir })
  })

  app.get('/api/log', (req, res) => {
    const maxCount = parseInt(req.query.max as string) || 500
    res.json(getLog(targetDir, maxCount))
  })

  app.get('/api/files', (_req, res) => {
    const files = getTrackedFiles(targetDir)
    res.json(files)
  })

  app.get('/api/blame', (req, res) => {
    const filePath = req.query.file as string
    if (!filePath) return res.status(400).json({ error: 'file param required' })
    res.json(getBlame(targetDir, filePath))
  })

  app.get('/api/diff', (req, res) => {
    const hash = req.query.hash as string
    const file = req.query.file as string | undefined
    if (!hash) return res.status(400).json({ error: 'hash param required' })
    res.json({ diff: getDiff(targetDir, hash, file) })
  })

  app.get('/api/file-at', (req, res) => {
    const hash = req.query.hash as string
    const file = req.query.file as string
    if (!hash || !file) return res.status(400).json({ error: 'hash and file params required' })
    res.json({ content: getFileAtCommit(targetDir, hash, file) })
  })

  app.get('/api/churn', (req, res) => {
    const maxCount = parseInt(req.query.max as string) || 500
    res.json(analyzeChurn(targetDir, maxCount))
  })

  app.get('/api/contributors', (req, res) => {
    const maxCount = parseInt(req.query.max as string) || 500
    res.json(analyzeContributors(targetDir, maxCount))
  })

  app.get('/api/ownership', (req, res) => {
    const filePath = req.query.file as string
    if (!filePath) return res.status(400).json({ error: 'file param required' })
    res.json(analyzeOwnership(targetDir, filePath))
  })

  app.get('/api/ownership/all', (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50
    res.json(analyzeAllOwnership(targetDir, limit))
  })

  app.get('/api/functions', (req, res) => {
    const filePath = req.query.file as string
    if (!filePath) return res.status(400).json({ error: 'file param required' })
    res.json(listFunctions(targetDir, filePath))
  })

  app.get('/api/function/history', (req, res) => {
    const filePath = req.query.file as string
    const name = req.query.name as string
    if (!filePath || !name) return res.status(400).json({ error: 'file and name params required' })
    const maxCount = parseInt(req.query.max as string) || 50
    res.json(trackFunction(targetDir, filePath, name, maxCount))
  })

  app.get('/api/risk', (req, res) => {
    const limit = parseInt(req.query.limit as string) || 100
    res.json(analyzeRisk(targetDir, 500, limit))
  })

  app.get('/api/search', (req, res) => {
    const q = req.query.q as string
    if (!q) return res.status(400).json({ error: 'q param required' })
    const max = parseInt(req.query.max as string) || 50
    res.json(searchHistory(targetDir, q, max))
  })

  app.get('/api/activity', (req, res) => {
    const max = parseInt(req.query.max as string) || 1000
    res.json(analyzeActivity(targetDir, max))
  })

  app.get('/api/activity/hours', (req, res) => {
    res.json(analyzeHourDistribution(targetDir))
  })

  app.get('/api/activity/days', (req, res) => {
    res.json(analyzeDayOfWeek(targetDir))
  })

  app.get('/api/stale', (req, res) => {
    const days = parseInt(req.query.days as string) || 180
    const limit = parseInt(req.query.limit as string) || 200
    res.json(findStaleFiles(targetDir, days, limit))
  })

  app.get('/api/busfactor', (req, res) => {
    const depth = parseInt(req.query.depth as string) || 2
    res.json(analyzeBusFactor(targetDir, 500, depth))
  })

  app.get('/api/cochange', (req, res) => {
    const min = parseInt(req.query.min as string) || 3
    res.json(analyzeCoChanges(targetDir, 500, min))
  })

  app.get('/api/filetrend', (req, res) => {
    const file = req.query.file as string
    if (!file) return res.status(400).json({ error: 'file param required' })
    const max = parseInt(req.query.max as string) || 50
    res.json(getFileSizeTrend(targetDir, file, max))
  })

  const webDir = path.resolve(__dirname, 'web')
  app.use(express.static(webDir))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(webDir, 'index.html'))
  })

  return app.listen(port, () => {
    console.log(`\n  🕰️  Git Time Machine`)
    console.log(`  Analyzing: ${targetDir}`)
    console.log(`  Open: http://localhost:${port}\n`)
  })
}
