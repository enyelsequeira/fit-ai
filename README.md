# Fit AI - Comprehensive Fitness Tracking Application

A full-featured fitness tracking application with workout logging, exercise library, goal setting, progress tracking, and AI-powered recommendations.

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

### Exercise Library
- **873+ Exercises** from [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) with images
- Categorized by muscle group (chest, back, shoulders, arms, legs, core)
- Detailed instructions, difficulty levels, and equipment requirements
- Create custom exercises
- Paginated browsing with search and filters

### Workout Tracking
- Log workouts with multiple exercises and sets
- Set types: normal, warmup, dropset, failure, rest-pause
- RPE (Rate of Perceived Exertion) and RIR (Reps in Reserve) tracking
- Superset support
- Workout templates for quick starts
- Rest timer

### Goals System
- 5 goal types: weight, strength, body measurement, workout frequency, custom
- Progress tracking with history
- Visual progress indicators
- Goal status management (active, paused, completed, abandoned)

### Progress Tracking
- Body measurements tracking
- Progress photos with before/after comparison
- Personal records (PRs) detection and history
- Training analytics and summaries
- Volume and strength charts

### Recovery System
- Daily recovery check-ins (sleep, stress, soreness, energy)
- Recovery score calculation
- Trend analysis
- Muscle recovery mapping

### AI Features
- AI-powered workout generator
- Training recommendations based on history
- Workout analysis and suggestions

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TanStack Start/Router/Query, TailwindCSS 4 |
| **Backend** | Hono, oRPC (type-safe RPC) |
| **Database** | Drizzle ORM, Cloudflare D1 (SQLite) |
| **Auth** | better-auth with cookie sessions |
| **Infrastructure** | Cloudflare Workers, pnpm workspaces, Turborepo |
| **Testing** | Vitest (712 tests) |

## Project Structure

```
fit-ai/
├── apps/
│   ├── web/              # React frontend (TanStack Start + Vite)
│   └── server/           # Hono + oRPC API server
├── packages/
│   ├── api/              # oRPC routers and business logic
│   ├── auth/             # Authentication (better-auth)
│   ├── db/               # Drizzle ORM schema and migrations
│   ├── env/              # Environment validation (@t3-oss/env)
│   └── infra/            # Cloudflare infrastructure (Alchemy)
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/enyelsequeira/fit-ai.git
cd fit-ai

# Install dependencies
pnpm install

# Set up environment variables
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

### Database Setup

```bash
# Push schema to local D1 database
pnpm db:push

# Seed exercises from Free Exercise DB (873+ exercises with images)
pnpm -F @fit-ai/db db:seed:free-exercise-db
```

### Development

```bash
# Start all apps in development mode
pnpm dev

# Or start individually
pnpm dev:web     # Frontend on http://localhost:3001
pnpm dev:server  # API on http://localhost:3000
```

### Testing

```bash
# Run all tests
pnpm test

# Type checking
pnpm check-types

# Linting
pnpm check
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all applications |
| `pnpm test` | Run test suite |
| `pnpm check-types` | TypeScript type checking |
| `pnpm check` | Run Oxlint + Oxfmt |
| `pnpm db:push` | Push schema to database |
| `pnpm db:generate` | Generate migrations |
| `pnpm deploy` | Deploy to Cloudflare |

## Deployment

This project deploys to Cloudflare Workers using Alchemy:

```bash
# Login to Cloudflare (first time)
pnpm wrangler login

# Deploy
pnpm deploy

# Seed remote database
pnpm -F @fit-ai/db db:seed:free-exercise-db:remote
```

## API Endpoints

The API uses oRPC for type-safe endpoints. Key routers:

- `/rpc/exercise/*` - Exercise CRUD and listing
- `/rpc/workout/*` - Workout logging and management
- `/rpc/goals/*` - Goal setting and tracking
- `/rpc/recovery/*` - Recovery check-ins
- `/rpc/analytics/*` - Training analytics
- `/rpc/ai/*` - AI workout generation

## Screenshots

*Coming soon*

## Contributing

Contributions are welcome! Please read the [AGENTS.md](./AGENTS.md) file for coding guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

- [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) for the exercise library (Public Domain)
- [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack) for the project scaffold
- [shadcn/ui](https://ui.shadcn.com/) for UI components
