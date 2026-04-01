# T R A C E

**Sickle Cell Causal Intelligence** — Trace symptoms to root causes across body systems.

## Why TRACE Exists

I have sickle cell disease. Every time I feel a crisis coming, I'm mentally tracing connections — was it the cold weather? The dehydration? The sinus congestion from last week? No tool does this for me. TRACE does.

TRACE uses multi-agent AI reasoning to trace invisible connections across your body systems, from the symptom you feel to the biological root cause, through every mechanism in between.

## How It Works

Three specialized Claude agents work in sequence:

```
User describes symptoms
  → Symptom Analyzer (Claude Sonnet 4.5)
      Parses input into structured symptoms with body systems and temporal markers
  → Causal Chain Builder (Claude Opus 4.6 + Extended Thinking)
      Traces causal connections through SCD pathophysiology
      Autonomously searches Exa for medical research
      Scrapes articles via FireCrawl when relevant
  → Recommendation Agent (Claude Sonnet 4.5)
      Generates actionable suggestions with urgency ratings
  → Results save to Obsidian vault + PostgreSQL database
```

## Three Visualization Modes

Same trace data, three ways to understand it:

- **Interactive** — Card-based investigation where you click through branching causal paths
- **Timeline** — React Flow node graph showing temporal connections with animated particles
- **Linear** — Step-by-step chain reveal with peeling layer animations

## Key Features

- **Multi-Agent Architecture** — 3 Claude agents with tool use and extended thinking
- **Real Medical Research** — Exa Search + FireCrawl for autonomous literature review
- **Health Data Integration** — 6 years of Apple Health data (2.5M records) as personal baseline
- **Agent Activity Panel** — Real-time visualization of the AI pipeline working
- **Obsidian Integration** — Trace results save as markdown notes in your vault
- **Voice Input** — Speak your symptoms via Web Speech API (Chrome, Edge, Safari)
- **Accessible** — WCAG 2.1 AA compliant (29 issues found and fixed via RAMS audit)
- **Light/Dark Mode** — Custom warm palette for both themes

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (Turbopack) |
| UI | ShadCN/UI, Tailwind CSS v4, Motion (Framer Motion) |
| Graph | React Flow + Dagre |
| Icons | Phosphor Icons |
| Fonts | Space Grotesk + Inter |
| AI | Claude Opus 4.6 + Sonnet 4.5 via @anthropic-ai/sdk |
| Database | PostgreSQL + Drizzle ORM (10 tables) |
| MCP | Exa Search, FireCrawl, Obsidian REST API |
| Linting | OxC suite — oxlint + oxfmt (Rust-based, near-instant) |
| Video | Remotion (React-based video generation) |

## Getting Started

### Prerequisites

- **Node.js** 18+ and **Bun** (package manager)
- **Docker** (for PostgreSQL)
- API keys for: Anthropic, Exa, FireCrawl, Obsidian Local REST API (optional)

### Setup

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env.local
# Fill in your keys:
#   ANTHROPIC_API_KEY=sk-ant-...
#   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/trace
#   EXA_API_KEY=...
#   FIRECRAWL_API_KEY=...
#   OBSIDIAN_API_KEY=... (optional)

# Push schema and seed the database
bun run db:push
bun run db:seed

# Import Apple Health data (optional — requires an Apple Health XML export)
bun run db:import-health

# Start Postgres + dev server in one command
bun run dev:full
```

> **Note:** `bun run dev:full` starts the PostgreSQL container via Docker Compose and launches the Next.js dev server. You can also run them separately with `docker compose up -d db` and `bun run dev`.

## Pages

| Route | Description |
|-------|------------|
| `/` | Hero page with SVG illustrations |
| `/login` | Login with demo mode |
| `/trace/new` | Symptom input (text + voice) with Deep/Quick analysis modes |
| `/trace/[id]` | Three-view trace results |
| `/history` | Past traces with urgency filtering |
| `/insights` | Pattern recognition and recommendations |
| `/analytics` | Health data dashboard with HR/HRV/sleep charts |
| `/docs` | Documentation and architecture |

## Built With Claude Code

This entire project was built using Claude Code with Opus 4.6 (1M context):
- **7 agent team sprints** — 48 tasks completed by 45+ parallel agents
- **23 custom skills** — Typography, animation, accessibility, design engineering
- **10+ MCP servers** — FireCrawl, Exa, Chrome DevTools, Morph, Obsidian, Slack
- **Live documented** — Full build process in Obsidian vault (included in repo)

## Problem Statement

**Problem Statement 2: Break the Barriers** — Expert medical knowledge locked behind hematology expertise, put in the patient's hands through multi-agent causal reasoning.

## License

MIT
