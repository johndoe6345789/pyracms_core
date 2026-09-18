"""File discovery for generate_cmake.py."""

import glob
import os
from pathlib import Path

CLIENT_DIR = Path(__file__).parent

LIB_DIRS = ["domain", "services"]
MODULE_DIRS = ["models", "viewmodels"]


def find_files(base_dir, pattern):
    """Glob for files, return sorted paths relative to base_dir."""
    found = sorted(glob.glob(str(base_dir / pattern), recursive=True))
    return [os.path.relpath(f, base_dir).replace("\\", "/") for f in found]


def collect(dirs, ext):
    """Files below src/<dir> with the given extension, as src/... paths."""
    files = []
    for d in dirs:
        pattern = f"{d}/**/*{ext}"
        found = find_files(CLIENT_DIR / "src", pattern)
        files += [f"src/{f}" for f in found]
    return files
