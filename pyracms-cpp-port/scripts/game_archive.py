"""Build the deterministic source archive of one games/<name> folder.

Layout (what the Hypernucleus launcher installs): one top-level folder
named like the game holding the code, game.json and requirements.txt.
Same input -> same bytes -> same sha256 (fixed times/modes, sorted, stored).
"""
from __future__ import annotations

import hashlib
import os
import zipfile

SKIP_DIRS = {"tests", "__pycache__", "dist", "build", ".pytest_cache"}
SKIP_FILES = {"build.py", ".coveragerc", "pytest.ini", "conftest.py"}
TEXT = (".py", ".json", ".txt", ".md")
STAMP = (1980, 1, 1, 0, 0, 0)


def game_files(game_dir):
    """Relative posix paths that ship in the archive, sorted."""
    out = []
    for root, dirs, names in os.walk(game_dir):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
        for n in names:
            if n in SKIP_FILES or n.endswith(".pyc"):
                continue
            rel = os.path.relpath(os.path.join(root, n), game_dir)
            out.append(rel.replace(os.sep, "/"))
    return sorted(out)


def _entry(name, rel, data, entry):
    info = zipfile.ZipInfo(f"{name}/{rel}", STAMP)
    info.create_system = 3  # unix, whatever the host is
    info.compress_type = zipfile.ZIP_STORED
    exe = rel == entry
    info.external_attr = (0o100755 if exe else 0o100644) << 16
    return info, data


def build_zip(game_dir, out_path, name, entry="main.py"):
    """Write the archive; returns (sha256 hex, size in bytes)."""
    with zipfile.ZipFile(out_path, "w") as z:
        for rel in game_files(game_dir):
            with open(os.path.join(game_dir, rel), "rb") as f:
                data = f.read()
            if rel.endswith(TEXT):  # CRLF checkouts must not change sha
                data = data.replace(b"\r\n", b"\n")
            z.writestr(*_entry(name, rel, data, entry))
    with open(out_path, "rb") as f:
        raw = f.read()
    return hashlib.sha256(raw).hexdigest(), len(raw)
