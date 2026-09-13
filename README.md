# Git Time Machine

I made Git Time Machine to help me look through the history of a Git repository.
It turns commits and file changes into a few small views that are easier to read.

The main views are:

- a heatmap for files that change a lot
- an activity calendar
- a search for words in commit history
- a simple blame view for a file

I keep the local analysis on my computer. The repository I choose is not uploaded.

## What I need

- Node.js 18 or newer
- Git

## Run it locally

```bash
git clone https://github.com/costachestefy90-source/git-time-machine.git
cd git-time-machine
npm install
npm start -- /path/to/a/git/repository
```

I replace `/path/to/a/git/repository` with the folder I want to inspect.

To work on the web part without opening the local server automatically, I use:

```bash
npm start -- /path/to/a/git/repository --no-open
npm run dev:web
```

## Demo

I also made a browser demo at:

https://costachestefy90-source.github.io/git-time-machine/

The demo uses sample data because a browser page cannot read a folder on my computer.
I can pick one of the sample repositories in the sidebar and try the four views.

## GitHub Pages

I use the workflow in `.github/workflows/pages.yml` to build the demo and publish it with GitHub Pages.
