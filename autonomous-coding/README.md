# Autonomous Coding Agent Demo

A minimal harness demonstrating long-running autonomous coding with the Claude Agent SDK. This demo implements a **two-agent pattern** (initializer + coding agent) that can build complete applications over multiple sessions.

## Prerequisites

### Required: Install Claude Code and Agent SDK

```bash
# Install Claude Code CLI (latest version required)
npm install -g @anthropic-ai/claude-code

# Install Python dependencies
pip install -r requirements.txt
```

Verify your installations:

```bash
claude --version        # Should be latest version
pip show claude-code-sdk  # Check SDK is installed
```

### API Key

Set your Anthropic API key:

```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

## Quick Start

```bash
python autonomous_agent_demo.py --project-dir ./my_project
```

For testing with limited iterations:

```bash
python autonomous_agent_demo.py --project-dir ./my_project --max-iterations 3
```

## Important Timing Expectations

**Warning: This demo takes a long time to run!**

- **First session (initialization)**: The agent generates a `feature_list.json` with 100+ test cases. This takes several minutes and may appear to hang - this is normal.

- **Subsequent sessions**: Each coding iteration can take 5-15 minutes depending on complexity.

- **Full app**: Building all features typically requires many hours of total runtime across multiple sessions.

**Tip**: The 100 features parameter in the prompts is designed for comprehensive coverage. If you want faster demos, you can modify `prompts/initializer_prompt.md` to reduce the feature count (e.g., 20-30 features for a quicker demo).

## How It Works

### Two-Agent Pattern

1. **Initializer Agent (Session 1)**:
   - Reads `app_spec.txt`
   - Creates `feature_list.json` with 100+ test cases
   - Sets up project structure
   - Creates `init.sh` setup script
   - Initializes git

2. **Coding Agent (Sessions 2+)**:
   - Picks up where the previous session left off
   - Implements features one by one
   - Runs tests and type checks
   - Marks features as passing in `feature_list.json`
   - Commits changes to git

### Session Management

- Each session runs with a **fresh context window**
- Progress is persisted via `feature_list.json` and git commits
- The agent auto-continues between sessions (3 second delay)
- Press `Ctrl+C` to pause; run the same command to resume

## Security Model

This demo uses a defense-in-depth security approach (see `security.py`):

### Bash Allowlist

Only specific commands are permitted:

| Category        | Commands                                  |
| --------------- | ----------------------------------------- |
| File inspection | ls, cat, head, tail, wc, grep, find, tree |
| Node.js/pnpm    | npm, npx, node, pnpm, turbo               |
| Version control | git                                       |
| Build/Test      | tsc, vite, vitest, jest                   |
| Utilities       | mkdir, cp, mv, rm, touch, chmod           |

Commands not in the allowlist are blocked by the security hook.

## Project Structure

```
autonomous-coding/
├── autonomous_agent_demo.py  # Main entry point
├── agent.py                  # Agent session logic
├── client.py                 # Claude SDK client configuration
├── security.py               # Bash command allowlist and validation
├── progress.py               # Progress tracking utilities
├── prompts.py                # Prompt loading utilities
├── prompts/
│   ├── app_spec.txt          # Application specification (XML format)
│   ├── initializer_prompt.md # First session prompt
│   └── coding_prompt.md      # Continuation session prompt
└── requirements.txt          # Python dependencies
```

## Generated Project Structure

After running, your project directory will contain:

```
my_project/
├── feature_list.json         # Test cases (source of truth)
├── app_spec.txt              # Copied specification
├── init.sh                   # Environment setup script
├── claude-progress.txt       # Session progress notes
├── .claude_settings.json     # Security settings
└── [application files]       # Generated application code
```

## Running the Generated Application

After the agent completes (or pauses), you can run the generated application:

```bash
cd my_project

# Run the setup script created by the agent
./init.sh

# Or manually:
pnpm install
pnpm dev
```

The application will be available at:

- Frontend: http://localhost:3001
- API: http://localhost:3000

## Command Line Options

| Option             | Description               | Default                      |
| ------------------ | ------------------------- | ---------------------------- |
| `--project-dir`    | Directory for the project | `./autonomous_demo_project`  |
| `--max-iterations` | Max agent iterations      | Unlimited                    |
| `--model`          | Claude model to use       | `claude-sonnet-4-5-20250929` |

## Customization

### Changing the Application

Edit `prompts/app_spec.txt` to specify a different application to build. The spec uses XML format with sections for:

- Technology stack
- Core features
- Database schema
- API endpoints
- Frontend patterns
- Commands

### Adjusting Feature Count

Edit `prompts/initializer_prompt.md` and change the "100 features" requirement to a smaller number for faster demos.

### Modifying Allowed Commands

Edit `security.py` to add or remove commands from `ALLOWED_COMMANDS`.

## feature_list.json Format

```json
[
  {
    "id": "feature-001",
    "category": "api",
    "priority": "high",
    "description": "User can sign up with email and password",
    "steps": [
      "Step 1: POST to /api/auth/sign-up/email with valid credentials",
      "Step 2: Verify 200 response with user object",
      "Step 3: Verify session cookie is set",
      "Step 4: Verify user exists in database"
    ],
    "passes": false
  }
]
```

**Critical**: Features can ONLY be marked as passing. Never remove, edit descriptions, or modify steps.

## Troubleshooting

### "Appears to hang on first run"

This is normal. The initializer agent is generating 100+ detailed test cases, which takes significant time. Watch for `[Tool: ...]` output to confirm the agent is working.

### "Command blocked by security hook"

The agent tried to run a command not in the allowlist. This is the security system working as intended. If needed, add the command to `ALLOWED_COMMANDS` in `security.py`.

### "API key not set"

Ensure `ANTHROPIC_API_KEY` is exported in your shell environment.

### "Import error"

Install dependencies:

```bash
pip install -r requirements.txt
```

### Tests failing after resuming

The coding agent runs verification tests at the start of each session. If tests fail, it will fix them before implementing new features.
