"""
Prompt loading utilities for autonomous coding agent.
"""

from pathlib import Path
from typing import Optional


PROMPTS_DIR = Path(__file__).parent / "prompts"


def load_prompt(name: str) -> str:
    """Load a prompt file by name."""
    # Try .md first, then .txt
    for ext in [".md", ".txt"]:
        prompt_file = PROMPTS_DIR / f"{name}{ext}"
        if prompt_file.exists():
            return prompt_file.read_text()

    raise FileNotFoundError(f"Prompt not found: {name}")


def load_app_spec() -> str:
    """Load the application specification."""
    return load_prompt("app_spec")


def load_initializer_prompt() -> str:
    """Load the initializer agent prompt."""
    return load_prompt("initializer_prompt")


def load_coding_prompt() -> str:
    """Load the coding agent prompt."""
    return load_prompt("coding_prompt")


def format_prompt(template: str, **kwargs) -> str:
    """Format a prompt template with variables."""
    for key, value in kwargs.items():
        template = template.replace(f"{{{key}}}", str(value))
        template = template.replace(f"{{{{ {key} }}}}", str(value))
    return template
