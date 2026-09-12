Git Time Machine

Git Time Machine is a local tool for looking through a Git repository in a more visual way.

It shows how files changed over time, who worked on them, and which parts of a project may need attention. It is useful when you want to understand an unfamiliar codebase or look back at how a project developed.

Everything runs locally on your computer. The repository being analyzed is not uploaded anywhere.

Features

View a visual timeline of Git history

Find files with high change frequency

View possible risk areas

Check how concentrated the project knowledge is

Find old or stale files

See files that often change together

Explore how functions changed between commits

Browse Git blame information

Search through commit history

View file size trends

See contributor and activity information

Requirements

Node.js 18 or newer

Git

Running the project

Clone the repository:

git clone https://github.com/costachestefy90-source/git-time-machine.git
cd git-time-machine

Install the dependencies:

npm install

Run Git Time Machine with a repository:

npm start -- /path/to/your/repository

Replace /path/to/your/repository with the path to the Git repository you want to inspect.

The tool starts a local server and opens the dashboard in your browser.

Development

To run the server without opening a browser automatically:

npm start -- /path/to/test/repository --no-open

Then start the web development server in another terminal:

npm run dev:web

How it works

The command-line tool starts a local server. The server reads Git history using normal Git commands, then sends the information to the web dashboard.

The dashboard is built with React and D3.js. The different views use the Git data to show history, file changes, contributors, and other project information.

Demo

There is also a browser demo that uses the same dashboard as the local tool:

https://costachestefy90-source.github.io/git-time-machine/

The demo uses sample repository data, so it does not upload a repository or run Git commands. Choose an example from the sidebar and use the existing dashboard pages to explore the heatmap, risk scores, ownership, blame, history, and activity views. The numbers are sample data; use the local tool above when you want to inspect a real repository.

GitHub Pages

The complete Git Time Machine app is designed to run locally because it needs a Node server and access to Git on the computer being analyzed.

The browser demo is built from the original React dashboard in demo mode by the GitHub Actions workflow in `.github/workflows/pages.yml`.
