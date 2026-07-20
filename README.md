# Git Time Machine

**See the hidden stories in your git history.** Run one command in any repository and get a beautiful interactive dashboard that reveals how your code evolved, who owns what, where the risks are, and how your team works.

Built for developers, tech leads, and engineering managers who want to understand their codebase beyond `git log`.

---

## Why Git Time Machine?

Every git repository contains a goldmine of information that's nearly impossible to access through the command line:

- **Which files are the riskiest?** Files that change constantly, are owned by one person, and haven't been reviewed recently are ticking time bombs.
- **Who should review this PR?** The contributor dashboard instantly shows who has expertise in which files.
- **Is this function safe to change?** The function timeline shows you every version, every author, and every reason it was modified.
- **Where is the technical debt?** Stale code, high churn hotspots, and coupled files that should be refactored.
- **How does the team actually work?** Commit patterns, peak hours, bus factor risks, and knowledge distribution.

Git Time Machine turns all of this into interactive visualizations you can explore in your browser. Everything runs locally — your code never leaves your machine.

---

## Features

### Analysis — For Tech Leads and Managers

| Feature | What It Does |
|---------|-------------|
| **Churn Heatmap** | Treemap visualization where every file is a colored rectangle. Size = change frequency. Color ranges from blue (stable) to red (constantly changing). Click any file for detailed commit stats, contributors, and line change history. |
| **Risk Dashboard** | Every file gets a 0–100 risk score combining three factors: how often it changes (40%), how concentrated ownership is (35%), and how long since the last change (25%). Files scoring 70+ are flagged Critical. Sortable table with visual bar breakdowns. |
| **Bus Factor** | Per-folder analysis of knowledge concentration. A bus factor of 1 means one person holds over 50% of the commits — if they leave, that module's knowledge goes with them. Configurable folder depth (1–3 levels). Color-coded risk cards with contributor percentage bars. |
| **Stale Code** | Scans every source file and surfaces those untouched for 90 days, 6 months, 1 year, or 2 years. Shows total commits, last author, and last change message. Great for finding dead code, deprecated features, and forgotten modules. |
| **Co-Changes** | Interactive force-directed graph showing files that always change together. Thick lines = strong coupling. Draggable, zoomable. Reveals hidden architectural dependencies that might need refactoring. Sidebar lists all pairs with confidence percentages. |

### Explore — For Developers

| Feature | What It Does |
|---------|-------------|
| **Function Timeline** | Pick any function in any file and see every version across the entire git history. Each version shows the full source code, author, date, and commit message. Compare any two versions side-by-side with highlighted diffs. Supports TypeScript, JavaScript, Python, Java, C#, Go, and Rust. |
| **Blame Explorer** | Enhanced `git blame` with color-coded authors, hover highlighting for same-commit lines, and a click-to-inspect detail panel showing the full commit context. The fastest way to answer "who wrote this line and why?" |
| **History Search** | Visual interface for `git log -S` (pickaxe search). Enter any string and find every commit where it was added or removed. Expandable diffs show exactly how it was used. Quick-search buttons for TODO, HACK, FIXME, and deprecated. |
| **File Trends** | Area chart tracking a file's line count over time. Detects complexity creep — files that grow gradually until they become unmanageable. Summary stats show current size, growth percentage, and first appearance date. |

### People — For Everyone

| Feature | What It Does |
|---------|-------------|
| **Contributors** | Bar chart of commits per contributor with an additions overlay line. Table view with commits, additions, deletions, files touched, and active date range. Click any contributor to see their top files. |
| **Activity** | GitHub-style commit calendar heatmap (past year), hour-of-day distribution chart, and day-of-week breakdown. Reveals work patterns, crunch periods, and development velocity. |

### Help

| Feature | What It Does |
|---------|-------------|
| **Explanation** | In-depth guide explaining every feature, what the data means, and how to use it effectively. Expandable sections with detailed paragraphs — no jargon, no code. |

---

## Installation

### Prerequisites

You need two things installed on your system:

1. **Node.js 18 or newer** — the JavaScript runtime
2. **Git** — the version control tool (you probably already have this)

### macOS

**Option A: Using Homebrew (recommended)**

```bash
# Install Node.js if you don't have it
brew install node

# Verify installation
node --version   # Should show v18 or higher
git --version    # Should show any version
```

**Option B: Using the Node.js installer**

1. Go to [nodejs.org](https://nodejs.org)
2. Download the macOS installer (LTS version)
3. Run the `.pkg` file and follow the prompts
4. Open Terminal and verify with `node --version`

Git comes pre-installed on macOS. If not, install Xcode Command Line Tools:
```bash
xcode-select --install
```

### Windows

**Option A: Using winget (Windows 10/11)**

```powershell
# Install Node.js
winget install OpenJS.NodeJS.LTS

# Install Git (if not already installed)
winget install Git.Git

# Restart your terminal, then verify
node --version
git --version
```

**Option B: Using installers**

1. Download Node.js LTS from [nodejs.org](https://nodejs.org) and run the `.msi` installer
2. Download Git from [git-scm.com](https://git-scm.com/download/win) and run the installer
3. Open a new Command Prompt or PowerShell and verify with `node --version` and `git --version`

**Option C: Using Chocolatey**

```powershell
choco install nodejs-lts git -y
```

### Linux

**Ubuntu / Debian**

```bash
# Install Node.js 20 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Verify
node --version
git --version
```

**Fedora / RHEL / CentOS**

```bash
# Install Node.js via NodeSource
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs git

# Verify
node --version
git --version
```

**Arch Linux**

```bash
sudo pacman -S nodejs npm git
```

**Using nvm (any distro — recommended for developers)**

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# Install and use Node.js LTS
nvm install --lts
nvm use --lts

# Verify
node --version
git --version
```

---

## Quick Start

### Clone and Run

```bash
# 1. Clone this repository
git clone https://github.com/costachestefy90-source/git-time-machine.git

# 2. Install dependencies
cd git-time-machine
npm install

# 3. Run it on any git repository
npm start -- /path/to/your/repo
```

A browser window will open automatically with the dashboard.

### Examples

```bash
# Analyze the current directory
npm start

# Analyze a specific repository
npm start -- ~/projects/my-app

# Use a custom port
npm start -- ~/projects/my-app --port 4000

# Don't open the browser automatically
npm start -- ~/projects/my-app --no-open
```

### CLI Reference

```
git-time-machine [path] [options]

Arguments:
  path              Path to a git repository (default: current directory)

Options:
  -p, --port <num>  Server port (default: 3847)
  --no-open         Don't open the browser automatically
  -h, --help        Show help
  -V, --version     Show version
```

---

## How It Works

```
Your Git Repo
     │
     ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  CLI (tsx)   │────▶│ Express API  │────▶│  React + D3.js  │
│  bin/cli.ts  │     │  Port 3847   │     │  Browser UI     │
└─────────────┘     └──────────────┘     └─────────────────┘
                          │
                          ▼
                    Native git commands
                    (log, blame, diff,
                     show, shortlog)
```

1. You point it at a git repository
2. The CLI starts a local Express server on port 3847
3. The server runs native `git` commands to analyze history, blame, diffs, and statistics
4. A React frontend opens in your browser with D3.js-powered visualizations
5. **Everything stays local** — no data is sent anywhere, no accounts needed, no telemetry

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| CLI | Node.js, Commander, tsx |
| Server | Express, cors |
| Frontend | React 18, React Router |
| Styling | Tailwind CSS with dark/light theme |
| Visualizations | D3.js (treemap, force graph, calendar heatmap, area charts, bar charts) |
| Build | Vite |
| Git Analysis | Native git commands via `child_process.execSync` |

---

## Development

Want to contribute or modify the tool? Here's how to set up the development environment:

```bash
# Clone the repo
git clone https://github.com/costachestefy90-source/git-time-machine.git
cd git-time-machine
npm install

# Terminal 1: Start the API server pointing at a test repo
npm start -- /path/to/test/repo --no-open

# Terminal 2: Start the Vite dev server with hot reload
npm run dev:web
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api` requests to the Express server on port 3847. Changes to React components will hot-reload instantly.

### Project Structure

```
git-time-machine/
├── bin/cli.ts                  # CLI entry point
├── src/
│   ├── analyzer/               # Git data extraction
│   │   ├── git.ts              # Core git operations
│   │   ├── churn.ts            # File change frequency analysis
│   │   ├── contributors.ts    # Contributor statistics
│   │   ├── functions.ts       # Function-level tracking
│   │   ├── risk.ts            # Composite risk scoring
│   │   ├── search.ts          # History string search
│   │   ├── activity.ts        # Commit time patterns
│   │   ├── stale.ts           # Stale file detection
│   │   ├── busfactor.ts       # Knowledge concentration
│   │   ├── cochange.ts        # Co-change coupling
│   │   ├── filetrends.ts      # File size over time
│   │   └── types.ts           # Shared interfaces
│   ├── server/index.ts         # Express API (20+ endpoints)
│   └── web/                    # React frontend
│       ├── App.tsx             # Layout, routing, theme toggle
│       ├── lib/api.ts          # API client
│       └── pages/              # 12 page components
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

---

## Supported Languages

Function-level tracking (Function Timeline) supports:

- TypeScript / JavaScript (`.ts`, `.tsx`, `.js`, `.jsx`)
- Python (`.py`)
- Java (`.java`)
- C# (`.cs`)
- Go (`.go`)
- Rust (`.rs`)

All other features (churn, blame, risk, activity, etc.) work with **any language** — they analyze git history, not source code syntax.

---

## Troubleshooting

**"command not found: git"**
Install Git for your operating system (see Installation section above).

**"Node.js version too old"**
Git Time Machine requires Node.js 18+. Check with `node --version` and upgrade if needed.

**Port already in use**
Use a different port: `npm start -- /path/to/repo --port 4000`

**Slow on large repositories**
The initial analysis of very large repositories (50k+ commits) may take a few seconds. Subsequent page loads are fast because data is cached per session.

**No functions found**
Function detection works with TypeScript, JavaScript, Python, Java, C#, Go, and Rust. Other languages will work with all features except Function Timeline.

---

## License

MIT — use it however you want.
