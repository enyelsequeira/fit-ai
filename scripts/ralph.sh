#!/bin/bash
# Ralph - Run Claude in a loop for autonomous task completion
# Inspired by: https://ghuntley.com/ralph/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "=========================================="
echo "  Ralph - Autonomous Agent Loop"
echo "=========================================="
echo ""
echo "Project: $(basename "$PROJECT_ROOT")"
echo "Prompt:  PROMPT.md"
echo "Tasks:   .agent/TODO.md"
echo ""
echo "Starting infinite loop..."
echo "Press Ctrl+C to stop"
echo ""

# Check if PROMPT.md exists
if [ ! -f "PROMPT.md" ]; then
    echo "ERROR: PROMPT.md not found in project root"
    exit 1
fi

# Check if .agent/TODO.md exists
if [ ! -f ".agent/TODO.md" ]; then
    echo "ERROR: .agent/TODO.md not found"
    echo "Create it with your task list first"
    exit 1
fi

# Run the loop
while :; do
    echo ""
    echo "----------------------------------------"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting new session"
    echo "----------------------------------------"
    
    cat PROMPT.md | claude -p --dangerously-skip-permissions
    
    echo ""
    echo "Session ended. Starting next iteration in 5 seconds..."
    sleep 5
done
