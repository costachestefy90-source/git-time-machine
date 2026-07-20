# Git Time Machine

A visual git archaeology tool. Run it in any repository to get an interactive browser UI that reveals the hidden stories in your git history.

## Features

### Analysis
- **Churn Heatmap** — Treemap visualization of file change frequency. Red = high churn, blue = stable. Click any file for detailed stats.
- **Risk Dashboard** — Composite risk score (0–100) for every file based on churn, ownership concentration, and staleness. Prioritize reviews and refactoring.
- **Bus Factor** — Per-folder knowledge concentration analysis. Identifies modules where a single person holds most of the knowledge.
- **Stale Code** — Finds files untouched for configurable periods (90 days to 2 years). Surface dead code and forgotten modules.
- **Co-Changes** — Force-directed graph of files that always change together, revealing hidden coupling and architectural dependencies.

### Explore
- **Function Timeline** — Pick any function and see every version across its entire git history. Side-by-side comparison between any two versions.
- **Blame Explorer** — Color-coded blame view with inline commit context. Click any line to see who wrote it and why.
- **History Search** — Find when any string was added or removed across all history. Built-in quick searches for TODO, HACK, FIXME, deprecated.
- **File Trends** — Area chart tracking a file's line count over time. Detect complexity creep before it becomes a problem.

### People
- **Contributors** — Bar charts and tables mapping every contributor's commits, additions, deletions, and file expertise.
- **Activity** — GitHub-style commit calendar, hour-of-day distribution, and day-of-week patterns.

### Help
- **Explanation** — In-depth guide explaining what every feature does, what the data means, and how to use it effectively.

## Quick Start

```bash
# Clone and install
git clone https://github.com/stefancostache/git-time-machine.git
cd git-time-machine
npm install

# Run on any git repository
npm start -- /path/to/your/repo

# Or use npx (after publishing)
npx git-time-machine /path/to/your/repo
```

## Usage

```bash
git-time-machine [path] [options]

Arguments:
  path          Path to a git repository (default: current directory)

Options:
  -p, --port    Server port (default: 3847)
  --no-open     Don't open browser automatically
  -h, --help    Show help
```

## How It Works

1. Point it at any git repository
2. The CLI starts a local Express server that analyzes git data using native git commands
3. A React + D3.js web UI opens in your browser
4. All data stays local — nothing is sent anywhere

## Tech Stack

- **CLI**: Node.js, Commander, tsx
- **Server**: Express
- **UI**: React, Vite, Tailwind CSS
- **Visualizations**: D3.js (treemap, force graph, calendar heatmap, area charts, bar charts)
- **Git Analysis**: Native git commands via child_process

## Requirements

- Node.js 18+
- Git installed and available in PATH

## Development

```bash
# Start the API server
npm start -- /path/to/repo --no-open

# In another terminal, start the Vite dev server
npm run dev:web
```

The Vite dev server runs on port 5173 and proxies API requests to port 3847.

## License

MIT
