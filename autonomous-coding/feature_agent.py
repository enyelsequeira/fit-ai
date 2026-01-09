#!/usr/bin/env python3
"""
Feature-Based Autonomous Agent

Implements a single feature in an existing codebase.
Takes a feature description and works on just that feature.

Usage:
    python feature_agent.py "Add a rest timer to workout tracking"
    python feature_agent.py --spec feature_spec.md
    python feature_agent.py --interactive
"""

import argparse
import subprocess
import sys
import json
from pathlib import Path
from datetime import datetime


FEATURE_PROMPT_TEMPLATE = """# FEATURE IMPLEMENTATION TASK

You are implementing a specific feature in an existing codebase.

## Feature to Implement

{feature_description}

## Project Context

This is the Fit AI fitness tracking application:
- **Frontend**: React 19, TanStack Start/Router/Query, TailwindCSS 4
- **Backend**: Hono, oRPC (type-safe RPC)
- **Database**: Drizzle ORM with SQLite/D1
- **Auth**: better-auth with cookie sessions
- **Monorepo**: pnpm workspaces + Turborepo

## Project Structure

```
apps/
├── web/          # React frontend (TanStack Start + Vite)
├── server/       # Hono + oRPC API server
packages/
├── api/          # oRPC routers (contracts.ts → schemas.ts → handlers.ts → routes.ts)
├── auth/         # Authentication (better-auth)
├── db/           # Drizzle ORM schema
├── env/          # Environment validation
```

## Your Task

1. **Understand the feature** - Read existing code to understand how similar features work
2. **Plan the implementation** - Identify files to create/modify
3. **Implement step by step**:
   - Database schema changes (if needed) in `packages/db/src/schema/`
   - API router in `packages/api/src/routers/` following the pattern
   - Frontend components/routes in `apps/web/src/`
4. **Write tests** in `__tests__/` directories
5. **Verify** with `pnpm check-types` and `pnpm test`
6. **Commit** with a descriptive message

## API Router Pattern

Each router in `packages/api/src/routers/<name>/` has:
- `contracts.ts` - Route contracts with oRPC
- `schemas.ts` - Zod validation schemas
- `handlers.ts` - Business logic
- `routes.ts` - Connect contracts to handlers
- `index.ts` - Export router

Example:
```typescript
// contracts.ts
export const createRouteContract = protectedProcedure
  .route({{ method: "POST", path: "/resource", tags: ["Resource"] }})
  .input(createSchema)
  .output(outputSchema);

// handlers.ts
export async function createHandler({{ input, context }}: CreateRouteHandler) {{
  return await db.insert(table).values({{ ...input, userId: context.session.user.id }});
}}

// routes.ts
export const createRoute = createRouteContract.handler(createHandler);
```

## Commands

```bash
pnpm dev          # Start dev servers
pnpm check-types  # TypeScript check
pnpm test         # Run tests
pnpm check        # Lint
```

## Important

- Follow existing patterns in the codebase
- Use `import type` for type-only imports
- Handle array access safely (noUncheckedIndexedAccess)
- Use ORPCError for API errors
- Commit your changes when the feature is complete

Begin by exploring the codebase to understand how to implement this feature.
"""


def run_claude(prompt: str, cwd: str) -> int:
    """Run Claude CLI with the given prompt."""
    try:
        process = subprocess.Popen(
            ["claude", "-p", "--dangerously-skip-permissions"],
            stdin=subprocess.PIPE,
            cwd=cwd,
            text=True,
        )
        process.communicate(input=prompt)
        return process.returncode or 0
    except FileNotFoundError:
        print("Error: 'claude' CLI not found.")
        print("Install it with: npm install -g @anthropic-ai/claude-code")
        return 1
    except KeyboardInterrupt:
        print("\n\nInterrupted by user.")
        process.terminate()
        return 130


def get_feature_from_file(spec_file: Path) -> str:
    """Read feature description from a file."""
    if not spec_file.exists():
        print(f"Error: File not found: {spec_file}")
        sys.exit(1)
    return spec_file.read_text()


def get_feature_interactive() -> str:
    """Get feature description interactively."""
    print("\n📝 Describe the feature you want to implement:")
    print("   (Press Enter twice when done)\n")

    lines = []
    empty_count = 0

    while empty_count < 1:
        try:
            line = input()
            if line == "":
                empty_count += 1
            else:
                empty_count = 0
                lines.append(line)
        except EOFError:
            break

    return "\n".join(lines)


def log_feature(project_dir: Path, feature: str, status: str) -> None:
    """Log feature to history file."""
    log_file = project_dir / ".feature-history.json"

    history = []
    if log_file.exists():
        try:
            history = json.loads(log_file.read_text())
        except:
            pass

    history.append({
        "timestamp": datetime.now().isoformat(),
        "feature": feature[:200],  # Truncate for log
        "status": status
    })

    # Keep last 50 entries
    history = history[-50:]
    log_file.write_text(json.dumps(history, indent=2))


def main():
    parser = argparse.ArgumentParser(
        description="Feature-Based Autonomous Agent",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    %(prog)s "Add a rest timer to workout tracking"
    %(prog)s "Create a workout streak counter that shows consecutive days"
    %(prog)s --spec my_feature.md
    %(prog)s --interactive

The agent will:
1. Explore the codebase to understand existing patterns
2. Plan the implementation
3. Create/modify necessary files
4. Write tests
5. Commit the changes
        """,
    )

    parser.add_argument(
        "feature",
        nargs="?",
        help="Feature description (in quotes)",
    )

    parser.add_argument(
        "--spec",
        type=str,
        help="Path to a file containing the feature specification",
    )

    parser.add_argument(
        "--interactive", "-i",
        action="store_true",
        help="Enter feature description interactively",
    )

    parser.add_argument(
        "--project-dir",
        type=str,
        default=".",
        help="Project directory (default: current directory)",
    )

    args = parser.parse_args()

    # Get feature description
    if args.spec:
        feature = get_feature_from_file(Path(args.spec))
    elif args.interactive:
        feature = get_feature_interactive()
    elif args.feature:
        feature = args.feature
    else:
        parser.print_help()
        print("\nError: Provide a feature description, --spec file, or use --interactive")
        sys.exit(1)

    if not feature.strip():
        print("Error: Feature description is empty")
        sys.exit(1)

    project_dir = Path(args.project_dir).resolve()

    print(f"""
╔══════════════════════════════════════════════════════════════╗
║           FEATURE AGENT                                      ║
╠══════════════════════════════════════════════════════════════╣
║  Implementing feature in existing codebase                   ║
╚══════════════════════════════════════════════════════════════╝

📁 Project: {project_dir}

📋 Feature:
{'-' * 60}
{feature[:500]}{'...' if len(feature) > 500 else ''}
{'-' * 60}

Starting implementation...
(Press Ctrl+C to cancel)
""")

    # Format the prompt
    prompt = FEATURE_PROMPT_TEMPLATE.format(feature_description=feature)

    # Log start
    log_feature(project_dir, feature, "started")

    # Run Claude
    exit_code = run_claude(prompt, str(project_dir))

    # Log completion
    status = "completed" if exit_code == 0 else f"failed (exit {exit_code})"
    log_feature(project_dir, feature, status)

    if exit_code == 0:
        print("\n✅ Feature implementation session complete!")
    else:
        print(f"\n⚠️  Session ended with exit code {exit_code}")

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
