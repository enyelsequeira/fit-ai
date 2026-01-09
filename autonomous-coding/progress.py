"""
Progress tracking utilities for autonomous coding agent.
"""

import json
from pathlib import Path
from typing import Optional
from datetime import datetime


def load_feature_list(project_dir: Path) -> Optional[dict]:
    """Load feature_list.json from project directory."""
    feature_file = project_dir / "feature_list.json"
    if feature_file.exists():
        with open(feature_file, "r") as f:
            return json.load(f)
    return None


def save_feature_list(project_dir: Path, features: dict) -> None:
    """Save feature_list.json to project directory."""
    feature_file = project_dir / "feature_list.json"
    with open(feature_file, "w") as f:
        json.dump(features, f, indent=2)


def get_progress_summary(features: dict) -> dict:
    """Get a summary of feature completion progress."""
    if not features or "features" not in features:
        return {"total": 0, "completed": 0, "pending": 0, "percentage": 0}

    feature_list = features["features"]
    total = len(feature_list)
    completed = sum(1 for f in feature_list if f.get("status") == "passing")
    pending = total - completed
    percentage = (completed / total * 100) if total > 0 else 0

    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "percentage": round(percentage, 1)
    }


def get_next_feature(features: dict) -> Optional[dict]:
    """Get the next pending feature to implement."""
    if not features or "features" not in features:
        return None

    for feature in features["features"]:
        if feature.get("status") != "passing":
            return feature
    return None


def mark_feature_complete(features: dict, feature_id: str) -> dict:
    """Mark a feature as complete."""
    if not features or "features" not in features:
        return features

    for feature in features["features"]:
        if feature.get("id") == feature_id:
            feature["status"] = "passing"
            feature["completed_at"] = datetime.now().isoformat()
            break

    return features


def append_progress_log(project_dir: Path, message: str) -> None:
    """Append a message to the progress log."""
    log_file = project_dir / "claude-progress.txt"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with open(log_file, "a") as f:
        f.write(f"[{timestamp}] {message}\n")


def is_project_initialized(project_dir: Path) -> bool:
    """Check if the project has been initialized."""
    return (project_dir / "feature_list.json").exists()
