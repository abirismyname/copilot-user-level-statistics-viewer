# GitHub Copilot Usage Metrics Viewer

Visualize GitHub Copilot usage metrics from your organization. Upload metrics NDJSON files to analyze user engagement, feature usage, and adoption patterns.

**Live demo:** [https://abirismyname.github.io/copilot-user-level-statistics-viewer](https://abirismyname.github.io/copilot-user-level-statistics-viewer)

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-blue?logo=tailwindcss&logoColor=white)

## Features

- Upload and parse GitHub Copilot metrics NDJSON files
- View user breakdowns: unique users, chat users, agent users, completion-only users
- Interactive charts (Chart.js) for usage patterns
- Drill down into individual user activity
- Statistics by IDE, programming language, Copilot feature, and model
- Premium Request Unit (PRU) consumption analysis
- Responsive layout
- All data processed client-side — nothing is sent to a server

## Getting Started

### Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/abirismyname/copilot-user-level-statistics-viewer.git
cd copilot-user-level-statistics-viewer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- [Next.js 16](https://nextjs.org) with App Router (static export)
- [TypeScript 5](https://www.typescriptlang.org)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Chart.js](https://www.chartjs.org) / [react-chartjs-2](https://react-chartjs-2.js.org)
- [Vitest](https://vitest.dev)
- [ESLint](https://eslint.org)

## Commands

```bash
npm run dev        # Start development server with Turbopack
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run test       # Run tests in watch mode
npm run test:run   # Run tests once (CI mode)
```

## Generating Data

### Copilot Metrics (NDJSON)

The app consumes user-level Copilot metrics exported via the GitHub API. To export metrics for your enterprise:

```bash
gh api /enterprises/{enterprise}/copilot/metrics/users \
  --paginate \
  --jq '.[]' \
  >> copilot-metrics.ndjson
```

Replace `{enterprise}` with your enterprise slug.

### List of Users and Teams

To generate a CSV mapping of enterprise users to their teams, use the [enterprise-team-members](https://gist.github.com/abirismyname/fb54c990abb04c73c1f4c00061cc37dd) GitHub CLI script:

```bash
# Download the script
gh gist view fb54c990abb04c73c1f4c00061cc37dd --raw > enterprise-team-members.sh
chmod +x enterprise-team-members.sh

# Run it (requires admin:enterprise token scope)
./enterprise-team-members.sh YOUR_ENTERPRISE_SLUG
```

This produces a `enterprise_team_members.csv` file with columns `login,enterprise_team_slug,enterprise_team_name`.

> **Note:** Your GitHub token needs the `admin:enterprise` scope. Run `gh auth refresh -h github.com -s admin:enterprise` if needed.

### Anonymizing Data

To share or test with metrics files without exposing real user logins, use the bundled anonymization script:

```bash
node --experimental-strip-types data-utils/anonymize-report.ts input.ndjson
# Writes: input.anonymized.ndjson
```

This replaces `user_login` values with random pseudonyms and scrubs `enterprise_id`.

## Data Format

The application expects GitHub Copilot user-level metrics in `.ndjson` (newline-delimited JSON) format. Each line represents one user's activity for one day.

> **Note:** Only the current LOC schema (`loc_added_sum`, `loc_suggested_to_add_sum`, etc.) is supported. Records using the deprecated `generated_loc_sum` / `accepted_loc_sum` fields are skipped automatically.

Key fields per record:

```typescript
interface CopilotMetrics {
  report_start_day: string;
  report_end_day: string;
  day: string;
  enterprise_id: string;
  user_id: number;
  user_login: string;
  user_initiated_interaction_count: number;
  code_generation_activity_count: number;
  code_acceptance_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  used_agent: boolean;
  used_chat: boolean;
  totals_by_ide: Array<{...}>;
  totals_by_feature: Array<{...}>;
  totals_by_language_feature: Array<{...}>;
  totals_by_language_model: Array<{...}>;
  totals_by_model_feature: Array<{...}>;
}
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
