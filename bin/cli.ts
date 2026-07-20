#!/usr/bin/env tsx

import { Command } from 'commander'
import open from 'open'
import path from 'path'
import { createServer } from '../src/server/index.js'

const program = new Command()

program
  .name('git-time-machine')
  .description('Visual git archaeology — see how functions evolved, who changed what, and where bugs spread')
  .version('1.0.0')
  .argument('[path]', 'path to git repository', '.')
  .option('-p, --port <number>', 'port to serve on', '3847')
  .option('--no-open', 'do not open browser automatically')
  .action((targetPath: string, opts: { port: string; open: boolean }) => {
    const resolvedPath = path.resolve(targetPath)
    const port = parseInt(opts.port)

    createServer(resolvedPath, port)

    if (opts.open) {
      setTimeout(() => open(`http://localhost:${port}`), 500)
    }
  })

program.parse()
