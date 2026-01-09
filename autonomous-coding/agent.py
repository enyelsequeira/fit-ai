"""
Agent session logic for autonomous coding.
Uses Claude CLI directly (no API key needed - uses existing session).
Implements the two-agent pattern: initializer + coding agent.
"""

import json
import subprocess
import time
from pathlib import Path
from typing import Optional
from datetime import datetime

from progress import (
    load_feature_list,
    get_progress_summary,
    get_next_feature,
    is_project_initialized,
    append_progress_log,
)
from prompts import (
    load_app_spec,
    load_initializer_prompt,
    load_coding_prompt,
    format_prompt,
)


class AutonomousAgent:
    """Autonomous coding agent that runs via Claude CLI."""

    def __init__(
        self,
        project_dir: Path,
        max_iterations: Optional[int] = None,
    ):
        self.project_dir = Path(project_dir).resolve()
        self.max_iterations = max_iterations
        self.iteration_count = 0

    def setup_project_dir(self) -> None:
        """Ensure project directory exists with necessary files."""
        self.project_dir.mkdir(parents=True, exist_ok=True)

        # Copy app_spec.txt if not present
        app_spec_dest = self.project_dir / "app_spec.txt"
        if not app_spec_dest.exists():
            app_spec_dest.write_text(load_app_spec())
            print(f"  Created: app_spec.txt")

        # Create .claude_settings.json for security
        settings_file = self.project_dir / ".claude_settings.json"
        if not settings_file.exists():
            settings = {
                "security": {
                    "sandbox_mode": True,
                    "allowed_directories": [str(self.project_dir)],
                },
                "created_at": datetime.now().isoformat(),
            }
            settings_file.write_text(json.dumps(settings, indent=2))
            print(f"  Created: .claude_settings.json")

    def run_claude(self, prompt: str) -> int:
        """
        Run Claude CLI with the given prompt.
        Uses --dangerously-skip-permissions for autonomous operation.

        Returns the exit code.
        """
        try:
            # Run claude with the prompt piped in
            process = subprocess.Popen(
                ["claude", "-p", "--dangerously-skip-permissions"],
                stdin=subprocess.PIPE,
                cwd=str(self.project_dir),
                text=True,
            )

            # Send prompt and wait for completion
            process.communicate(input=prompt)

            return process.returncode or 0

        except FileNotFoundError:
            print("\nError: 'claude' CLI not found.")
            print("Install it with: npm install -g @anthropic-ai/claude-code")
            return 1
        except KeyboardInterrupt:
            print("\n\nInterrupted by user.")
            process.terminate()
            return 130

    def run_initializer(self) -> int:
        """
        Run the initializer agent (first session).
        Creates feature_list.json and sets up project structure.
        """
        print("\n" + "=" * 60)
        print("  INITIALIZER AGENT - Setting up project")
        print("=" * 60)

        append_progress_log(self.project_dir, "Starting initializer agent")

        # Load and format the initializer prompt
        prompt_template = load_initializer_prompt()
        app_spec = load_app_spec()

        prompt = format_prompt(
            prompt_template,
            app_spec=app_spec,
            project_dir=str(self.project_dir),
        )

        print("\nRunning initializer agent...")
        print("This will create feature_list.json with 100+ test cases.")
        print("This may take several minutes - please be patient.\n")

        exit_code = self.run_claude(prompt)

        append_progress_log(
            self.project_dir,
            f"Initializer agent completed with exit code {exit_code}"
        )

        return exit_code

    def run_coding_session(self) -> int:
        """
        Run a coding session (continuation sessions).
        Implements features one by one based on feature_list.json.
        """
        features = load_feature_list(self.project_dir)
        if not features:
            print("Error: No feature_list.json found. Running initializer first...")
            return self.run_initializer()

        progress = get_progress_summary(features)
        next_feature = get_next_feature(features)

        print("\n" + "=" * 60)
        print(f"  CODING AGENT - Session {self.iteration_count + 1}")
        print("=" * 60)
        print(f"  Progress: {progress['completed']}/{progress['total']} ({progress['percentage']}%)")
        if next_feature:
            feature_name = next_feature.get('description', next_feature.get('id', 'Unknown'))
            # Truncate long descriptions
            if len(feature_name) > 50:
                feature_name = feature_name[:47] + "..."
            print(f"  Next: {feature_name}")
        print("=" * 60)

        if not next_feature:
            print("\n  All features completed!")
            append_progress_log(self.project_dir, "All features completed")
            return 0

        append_progress_log(
            self.project_dir,
            f"Starting coding session - Feature: {next_feature.get('id', 'Unknown')}"
        )

        # Load and format the coding prompt
        prompt_template = load_coding_prompt()
        prompt = format_prompt(
            prompt_template,
            feature_list=json.dumps(features, indent=2),
            next_feature=json.dumps(next_feature, indent=2),
            progress_completed=progress["completed"],
            progress_total=progress["total"],
            project_dir=str(self.project_dir),
        )

        print("\nRunning coding session...")
        print("This may take 5-15 minutes per feature.\n")

        exit_code = self.run_claude(prompt)

        self.iteration_count += 1
        append_progress_log(
            self.project_dir,
            f"Coding session {self.iteration_count} completed with exit code {exit_code}"
        )

        return exit_code

    def run(self) -> None:
        """
        Main run loop for autonomous coding.
        Automatically continues between sessions.
        """
        self.setup_project_dir()

        print("\n" + "=" * 60)
        print("  AUTONOMOUS CODING AGENT")
        print("=" * 60)
        print(f"  Project: {self.project_dir}")
        print(f"  Max iterations: {self.max_iterations or 'Unlimited'}")
        print("")
        print("  Press Ctrl+C to pause. Run again to resume.")
        print("=" * 60)

        try:
            while True:
                # Check iteration limit
                if self.max_iterations and self.iteration_count >= self.max_iterations:
                    print(f"\n  Reached max iterations ({self.max_iterations}). Stopping.")
                    break

                # Determine which agent to run
                if not is_project_initialized(self.project_dir):
                    # Run initializer
                    exit_code = self.run_initializer()
                    if exit_code != 0:
                        print(f"\n  Initializer exited with code {exit_code}")
                else:
                    # Check if all features complete
                    features = load_feature_list(self.project_dir)
                    progress = get_progress_summary(features)

                    if progress["pending"] == 0:
                        print("\n" + "=" * 60)
                        print("  ALL FEATURES COMPLETED!")
                        print(f"  Total: {progress['total']} features")
                        print("=" * 60)
                        break

                    # Run coding session
                    exit_code = self.run_coding_session()
                    if exit_code != 0:
                        print(f"\n  Session exited with code {exit_code}")

                # Brief pause between sessions
                print("\n" + "-" * 40)
                print("  Session complete. Continuing in 3 seconds...")
                print("  (Press Ctrl+C to pause)")
                print("-" * 40)
                time.sleep(3)

        except KeyboardInterrupt:
            print("\n\n  Paused by user. Run again to resume.")
            self._save_state()

    def _save_state(self) -> None:
        """Save current state for resume."""
        append_progress_log(
            self.project_dir,
            f"Session paused at iteration {self.iteration_count}"
        )
