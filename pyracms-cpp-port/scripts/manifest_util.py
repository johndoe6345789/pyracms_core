"""Small helpers shared by the manifest scripts (stdlib only)."""
from __future__ import annotations

import hashlib

OS_ALIASES = {"windows": "win", "win": "win", "win32": "win",
              "macos": "mac", "mac": "mac", "darwin": "mac",
              "linux": "lin", "lin": "lin"}
ARCH_ALIASES = {"x64": "x86_64", "x86_64": "x86_64", "amd64": "x86_64",
                "arm64": "arm64", "aarch64": "arm64"}


def norm_os(v):
    return OS_ALIASES[v.lower()]


def norm_arch(v):
    return ARCH_ALIASES[v.lower()]


def sha256_of(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()
