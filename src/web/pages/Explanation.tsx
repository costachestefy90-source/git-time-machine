import React from 'react'

const SECTIONS = [
  {
    group: 'Analysis',
    features: [
      {
        title: 'Churn Heatmap',
        summary: 'Visualizes which files in your repository change most frequently.',
        details: [
          'Every file in your repository is shown as a rectangle in a treemap layout. The size of each rectangle represents how often that file has been changed (committed to), and the color ranges from cool blue (rarely changed) to hot red (frequently changed).',
          'Files that appear large and red are your "hotspots" — these are the areas of your codebase that are constantly being modified. This is significant because high-churn files are statistically more likely to contain bugs, accumulate technical debt, and become harder to maintain over time.',
          'Click any rectangle to see detailed statistics: the exact number of commits, lines added and deleted, when it was last modified, and which contributors have worked on it.',
          'This view is especially useful for engineering managers and tech leads who want to identify which parts of the codebase are under the most pressure, and for developers planning refactoring efforts — if a file is constantly changing, it might benefit from being broken into smaller, more focused modules.',
        ],
      },
      {
        title: 'Risk Dashboard',
        summary: 'Scores every file by combining three risk factors into a single 0–100 number.',
        details: [
          'Each file receives a composite risk score calculated from three independent dimensions: Churn (how often the file changes, weighted at 40%), Ownership concentration (how many people understand the file, weighted at 35%), and Staleness (how long since the last change, weighted at 25%).',
          'A file scores high on Churn if it has been modified in many commits. A file scores high on Ownership if a single person wrote most of its lines — meaning if that person leaves, knowledge is lost. A file scores high on Staleness if it hasn\'t been touched in a long time — old code that nobody maintains can harbor hidden issues.',
          'Risk levels are categorized as: Critical (70–100), High (45–69), Medium (25–44), and Low (0–24). The table shows color-coded bar breakdowns for each dimension so you can see exactly why a file is risky.',
          'This is invaluable for sprint planning and code review prioritization. Files marked Critical should receive extra scrutiny during reviews and be considered for refactoring. The "Top Owner" column tells you who to consult before making changes to risky files.',
        ],
      },
      {
        title: 'Bus Factor',
        summary: 'Measures how many people need to leave before knowledge of a module is lost.',
        details: [
          'The "bus factor" is a well-known software engineering metric. It answers the question: "If key contributors were suddenly unavailable, how many modules would lose their primary source of knowledge?" A bus factor of 1 means a single person holds most of the knowledge — if they leave, the team is in trouble.',
          'This tool analyzes every folder in your repository at a configurable depth (1, 2, or 3 levels deep). For each folder, it counts how many commits each contributor has made, calculates their percentage of total commits, and determines the minimum number of people needed to cover at least 50% of the changes.',
          'Risk levels are: Critical (one person contributed over 80% of commits), High (one person contributed over 50%), Medium (two people needed), and Low (three or more contributors). The colored percentage bars show each contributor\'s share at a glance.',
          'Engineering managers should pay close attention to Critical and High risk modules. These are areas where pair programming, documentation, or cross-training should be prioritized to reduce organizational risk. It\'s also useful during onboarding to identify which team members a new hire should shadow.',
        ],
      },
      {
        title: 'Stale Code',
        summary: 'Finds files that have not been modified for a long time.',
        details: [
          'This tool scans every source code file in your repository and identifies those that haven\'t received a single commit in a configurable time period: 90 days, 6 months, 1 year, or 2 years.',
          'Stale files fall into a few categories: they could be dead code that\'s no longer used but was never cleaned up, stable utility code that works perfectly and doesn\'t need changes, or forgotten code that might have bugs nobody has noticed because nobody looks at it.',
          'The table shows each stale file with its age (days since last change), total number of commits it has ever received, who last modified it, and what that last change was. Files are color-coded by severity — over 2 years is red, over 1 year is amber, and under 1 year is yellow.',
          'Use this to build a cleanup backlog. Files with very few total commits that haven\'t been touched in years are strong candidates for removal. Files with many historical commits that went quiet might contain deprecated features. The "Last Author" column tells you who to ask whether the code is still needed.',
        ],
      },
      {
        title: 'Co-Changes',
        summary: 'Discovers files that are always modified together, revealing hidden dependencies.',
        details: [
          'When two files consistently appear in the same commits, it suggests they are coupled — changing one requires changing the other. This coupling might be intentional (a component and its styles) or accidental (two unrelated systems that share a fragile dependency).',
          'The interactive force-directed graph shows files as nodes and their coupling as connecting lines. Thicker lines mean stronger coupling (more co-changes). You can drag nodes to rearrange the layout and zoom in/out to explore dense areas.',
          'The sidebar lists all detected pairs ranked by the number of times they changed together, along with a confidence percentage. Clicking any pair or link shows the exact coupling statistics.',
          'This analysis is powerful for architectural decisions. If files from different modules always change together, they might belong in the same module. If seemingly unrelated files are coupled, there could be a hidden dependency worth investigating. It\'s also useful for estimating the scope of changes — before modifying a file, check what else typically needs to change with it.',
        ],
      },
    ],
  },
  {
    group: 'Explore',
    features: [
      {
        title: 'Function Timeline',
        summary: 'Shows every version of a specific function across the entire git history.',
        details: [
          'Select any source file, then pick a function defined in that file. The tool traces that function through every commit where the file was modified, extracting the function\'s source code at each point in time.',
          'Each version is displayed as a card showing the commit hash, author, date, commit message, and the complete function body. This lets you read the evolution of a function as a narrative — understanding not just what it does now, but how it got there, who shaped it, and what problems each change was solving.',
          'The compare feature lets you select any two versions and view them side-by-side with differences highlighted. Lines removed are shown in red on the left, and lines added are shown in green on the right.',
          'This is the tool to reach for when you encounter a function and need to understand why it looks the way it does. Instead of reading a flat blame view, you can see the full story: the original implementation, each refactor, each bug fix, and each feature addition, complete with the commit messages that explain the reasoning.',
          'Supported languages include TypeScript, JavaScript, Python, Java, C#, Go, and Rust. Function detection uses pattern matching so it works without installing language-specific parsers.',
        ],
      },
      {
        title: 'Blame Explorer',
        summary: 'An enhanced git blame view with color-coded authors and inline commit context.',
        details: [
          'Select any file to see every line annotated with who last changed it, when, and in which commit. Each author is assigned a distinct background color, making it easy to see at a glance which sections were written by which people.',
          'Hovering over any line highlights all other lines from the same commit in a subtle accent color. This helps you see the scope of individual changes — "this person changed these 15 lines together in one commit."',
          'Clicking a line opens a detail panel showing the full commit information: author name and email, exact timestamp, commit hash, and the commit message explaining why the change was made. If the same commit modified other lines in the file, those are listed too.',
          'Traditional command-line `git blame` is hard to read and lacks interactivity. This view adds color, filtering, and instant context, making it the fastest way to answer "who wrote this line and why?" — the most common question during code review and debugging.',
        ],
      },
      {
        title: 'History Search',
        summary: 'Finds every commit where a specific string was added or removed across all history.',
        details: [
          'This is a visual interface for git\'s powerful `git log -S` (the "pickaxe" search). Enter any string — a function name, a variable, a TODO comment, an error message — and it will find every commit in the entire repository history where that exact string was either introduced or removed.',
          'Results show the commit hash, author, date, message, and which file was affected. Expanding a result reveals the actual diff, with additions highlighted in green and deletions in red, so you can see exactly how the string was used.',
          'Quick-search buttons for common patterns (TODO, HACK, FIXME, deprecated) let you instantly audit your codebase for technical debt markers. You can see when they were added, by whom, and whether they were ever resolved.',
          'Use cases include: tracking when a bug-causing pattern was introduced, finding when a deprecated API was first used (and by whom), discovering when a feature flag was added or removed, and understanding the lifecycle of any piece of code by searching for its key identifiers.',
        ],
      },
      {
        title: 'File Trends',
        summary: 'Tracks how a file\'s size changes over time, charted as an area graph.',
        details: [
          'Select any source file to see an area chart plotting its line count across every commit that modified it. The X-axis is time, and the Y-axis is the number of lines, with data points at each relevant commit.',
          'Summary statistics at the top show the current line count, total number of data points (commits), overall growth percentage, and when the file first appeared. Growth is color-coded: over 50% is red (the file has grown significantly), positive growth is amber, and negative or zero is green (the file has been kept in check or reduced).',
          'Below the chart, a detailed table lists every commit with the exact line count, the delta from the previous commit (positive in red, negative in green), the author, and the commit message.',
          'This tool helps detect "complexity creep" — files that grow gradually over time until they become unmanageable. A steadily rising line suggests the file is accumulating responsibilities and might need to be split. A sudden spike suggests a large feature was added that might warrant review. A flat line means the file is stable.',
        ],
      },
    ],
  },
  {
    group: 'People',
    features: [
      {
        title: 'Contributors',
        summary: 'Maps every contributor\'s commit activity, code volume, and file expertise.',
        details: [
          'The chart view shows a bar graph of commits per contributor (top 20), with a green line overlay showing their total additions. This dual visualization reveals the difference between frequent committers (many small changes) and volume committers (fewer but larger changes).',
          'The table view provides detailed numbers: total commits, lines added, lines deleted, number of files touched, and their active date range. Clicking any contributor opens a detail panel listing their statistics and the specific files they\'ve worked on.',
          'This helps answer questions like: "Who is the most active contributor?", "Who has the broadest codebase knowledge?" (most files touched), "Who should review this PR?" (highest ownership of the affected files), and "When was this contributor active?" (their date range).',
          'For managers, this view supports workload assessment, expertise mapping, and succession planning. For developers, it helps identify who to ask for help with specific areas of the code.',
        ],
      },
      {
        title: 'Activity',
        summary: 'Visualizes when commits happen using calendar heatmaps and time distribution charts.',
        details: [
          'The commit calendar is a GitHub-style contribution heatmap showing the past year of commit activity. Each cell is a day, colored from empty (no commits) through shades of blue and indigo to bright purple (heavy activity). Hovering shows the exact date and commit count.',
          'The "Commits by Hour" bar chart shows which hours of the day see the most commits (in the committer\'s local timezone). This reveals work patterns — a team that commits heavily at 2am might be dealing with crunch or working across time zones.',
          'The "Commits by Day of Week" horizontal bars show weekly patterns. Heavy weekend activity might indicate deadline pressure. Evenly distributed activity suggests a healthy, sustainable pace.',
          'Summary statistics include total commits, number of active days, average commits per day, and the peak day (most commits in a single day). These help characterize the development pace of the project.',
          'This data is useful for retrospectives, estimating development velocity, identifying periods of intense activity (release cycles, crunch), and understanding team work patterns.',
        ],
      },
    ],
  },
]

export default function Explanation() {
  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-fg">Feature Guide</h2>
          <p className="text-sm text-fg-muted mt-1">
            A comprehensive explanation of every feature in Git Time Machine — what it does, what the data means, and how to use it effectively.
          </p>
        </div>

        {SECTIONS.map((section) => (
          <div key={section.group} className="mb-10">
            <h3 className="text-[11px] uppercase tracking-widest text-fg-faint font-bold mb-4 border-b border-surface-3 pb-2">
              {section.group}
            </h3>
            <div className="space-y-6">
              {section.features.map((feature) => (
                <FeatureCard key={feature.title} feature={feature} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FeatureCard({ feature }: { feature: { title: string; summary: string; details: string[] } }) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div className="bg-surface-1 rounded-xl border border-surface-3 overflow-hidden shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 hover:bg-surface-2 transition-colors"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-base font-bold text-fg">{feature.title}</h4>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-fg-faint transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        <p className="text-sm text-fg-muted mt-1">{feature.summary}</p>
      </button>
      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-surface-3 pt-4">
          {feature.details.map((paragraph, i) => (
            <p key={i} className="text-sm text-fg-muted leading-relaxed">{paragraph}</p>
          ))}
        </div>
      )}
    </div>
  )
}
