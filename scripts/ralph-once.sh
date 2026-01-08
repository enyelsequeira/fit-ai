#!/bin/bash
# Ralph Once - Run Claude once for a single task iteration
# Use this to test before running the infinite loop

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "=========================================="
echo "  Ralph Once - Single Iteration"
echo "=========================================="
echo ""

# Check if PROMPT.md exists
if [ ! -f "PROMPT.md" ]; then
    echo "ERROR: PROMPT.md not found in project root"
    exit 1
fi

# Check if .agent/TODO.md exists
if [ ! -f ".agent/TODO.md" ]; then
    echo "ERROR: .agent/TODO.md not found"
    exit 1
fi

echo "Starting single session..."
echo ""

cat PROMPT.md | claude -p --dangerously-skip-permissions

echo ""
echo "Session complete."
