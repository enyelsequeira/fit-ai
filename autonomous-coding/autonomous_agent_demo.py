#!/usr/bin/env python3
"""
Autonomous Coding Agent Demo

A minimal harness demonstrating long-running autonomous coding with Claude CLI.
This implements a two-agent pattern (initializer + coding agent) that can build
complete applications over multiple sessions.

No API key needed - uses your existing Claude CLI session.

Usage:
    python autonomous_agent_demo.py --project-dir ./my_project
    python autonomous_agent_demo.py --project-dir ./my_project --max-iterations 3
"""

import argparse
import shutil
import sys
from pathlib import Path


def check_claude_cli() -> bool:
    """Check if Claude CLI is installed."""
    return shutil.which("claude") is not None


def main():
    parser = argparse.ArgumentParser(
        description="Autonomous Coding Agent Demo",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    %(prog)s --project-dir ./my_project
    %(prog)s --project-dir ./my_project --max-iterations 3

Notes:
    - No API key needed - uses your existing Claude CLI session
    - First run initializes the project and creates feature_list.json
    - Subsequent runs continue implementing features
    - Press Ctrl+C to pause; run again to resume
    - Progress is saved in feature_list.json and git commits
        """,
    )

    parser.add_argument(
        "--project-dir",
        type=str,
        default=".",
        help="Directory for the project (default: current directory)",
    )

    parser.add_argument(
        "--max-iterations",
        type=int,
        default=None,
        help="Maximum agent iterations (default: unlimited)",
    )

    args = parser.parse_args()

    # Check Claude CLI
    if not check_claude_cli():
        print("Error: 'claude' CLI not found.")
        print("\nInstall it with:")
        print("  npm install -g @anthropic-ai/claude-code")
        sys.exit(1)

    # Validate project directory
    project_dir = Path(args.project_dir).resolve()

    print(f"""
╔══════════════════════════════════════════════════════════════╗
║           AUTONOMOUS CODING AGENT                            ║
╠══════════════════════════════════════════════════════════════╣
║  Uses Claude CLI (no API key needed)                         ║
╠══════════════════════════════════════════════════════════════╣
║  Project:    {str(project_dir)[:45]:<45} ║
║  Max iters:  {str(args.max_iterations or 'Unlimited'):<45} ║
╚══════════════════════════════════════════════════════════════╝
""")

    # Import here to catch import errors with helpful message
    try:
        from agent import AutonomousAgent
    except ImportError as e:
        print(f"Error importing agent module: {e}")
        print("\nMake sure you're running from the autonomous-coding directory")
        sys.exit(1)

    # Create and run agent
    agent = AutonomousAgent(
        project_dir=project_dir,
        max_iterations=args.max_iterations,
    )

    try:
        agent.run()
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        print("\nCheck the progress log for details:")
        print(f"  cat {project_dir}/claude-progress.txt")
        sys.exit(1)


if __name__ == "__main__":
    main()
