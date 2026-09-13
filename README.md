# Git Time Machine

You can use Git Time Machine to look through the history of a Git repository.
It turns commits and file changes into a few small views that are easier to read.

The main views are:

- a heatmap for files that change a lot
- an activity calendar
- a search for words in commit history
- a simple blame view for a file

You can keep the local analysis on your computer. The repository you choose is not uploaded.

## What you need

- Node.js 18 or newer
- Git

## Run it locally

```bash
git clone https://github.com/costachestefy90-source/git-time-machine.git
cd git-time-machine
npm install
npm start -- /path/to/a/git/repository
```

Replace `/path/to/a/git/repository` with the folder you want to inspect.

To work on the web part without opening the local server automatically, use:

```bash
npm start -- /path/to/a/git/repository --no-open
npm run dev:web
```

## Demo

You can also try the browser demo at:

https://costachestefy90-source.github.io/git-time-machine/

The demo uses sample data because a browser page cannot read a folder on your computer.
You can pick one of the sample repositories in the sidebar and try the four views.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` builds the demo and publishes it with GitHub Pages.
