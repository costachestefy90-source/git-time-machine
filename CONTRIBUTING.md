# Contributing

Contributions are welcome! Here's how to get started.

## Reporting Issues

- Open a GitHub issue with a clear title
- Include your Node.js version (`node --version`), OS, and Git version
- Describe what you expected vs. what happened
- If possible, include the repository you tested against (or describe its size/structure)

## Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b my-feature`
3. Make your changes
4. Test against at least one real git repository
5. Commit with a clear message
6. Push and open a Pull Request

## Development Setup

```bash
git clone https://github.com/YOUR_USERNAME/git-time-machine.git
cd git-time-machine
npm install

# Terminal 1: API server
npm start -- /path/to/test/repo --no-open

# Terminal 2: Vite dev server (hot reload)
npm run dev:web
```

## Adding a New Feature Page

1. Create the analyzer in `src/analyzer/` — extract data using git commands
2. Add the API endpoint in `src/server/index.ts`
3. Add types and the API call in `src/web/lib/api.ts`
4. Create the page component in `src/web/pages/`
5. Add the route and nav item in `src/web/App.tsx`
6. Add the explanation entry in `src/web/pages/Explanation.tsx`

## Code Style

- TypeScript throughout
- No comments unless the "why" is non-obvious
- Tailwind CSS for styling — use the semantic color tokens (`text-fg`, `bg-surface-1`, etc.)
- D3.js for data visualizations
