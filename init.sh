#!/bin/bash
# Fit AI Development Environment Setup
# Usage: ./init.sh [--skip-seed] [--api-only] [--web-only]

set -e

echo "=== Fit AI Development Setup ==="
echo ""

# Parse arguments
SKIP_SEED=false
API_ONLY=false
WEB_ONLY=false

for arg in "$@"; do
  case $arg in
    --skip-seed)
      SKIP_SEED=true
      shift
      ;;
    --api-only)
      API_ONLY=true
      shift
      ;;
    --web-only)
      WEB_ONLY=true
      shift
      ;;
  esac
done

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "Error: pnpm is required but not installed."
    echo "Install with: npm install -g pnpm"
    exit 1
fi

echo "Using pnpm version: $(pnpm --version)"
echo ""

# Check if node is installed and version is sufficient
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "Warning: Node.js 20+ recommended. Current version: $(node -v)"
fi

echo "Using Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "Installing dependencies..."
pnpm install
echo "Dependencies installed successfully!"
echo ""

# Setup database
echo "Setting up database..."
pnpm db:push
echo "Database schema pushed successfully!"
echo ""

# Seed exercise data (optional)
if [ "$SKIP_SEED" = false ]; then
    echo "Seeding exercise library (this may take a moment)..."
    if pnpm -F @fit-ai/db db:seed:free-exercise-db 2>/dev/null; then
        echo "Exercise library seeded successfully!"
    else
        echo "Note: Exercise seed skipped or already complete."
    fi
    echo ""
fi

# Start development servers
echo "=========================================="
echo "Setup complete! Starting development servers..."
echo ""
echo "  Frontend: http://localhost:3001"
echo "  API:      http://localhost:3000"
echo ""
echo "=========================================="
echo ""

if [ "$API_ONLY" = true ]; then
    pnpm dev:server
elif [ "$WEB_ONLY" = true ]; then
    pnpm dev:web
else
    pnpm dev
fi
