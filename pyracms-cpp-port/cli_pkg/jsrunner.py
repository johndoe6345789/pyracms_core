"""Pick the JavaScript package runner (bun preferred, else npm)."""
import shutil
import sys

from .common import error


def get_js_runner():
    """Return 'bun' if available, otherwise 'npm'."""
    if shutil.which("bun"):
        return "bun"
    if shutil.which("npm"):
        return "npm"
    error("Neither bun nor npm found. Please install one of them.")
    sys.exit(1)


def get_js_exec_runner():
    """Return 'bunx' if bun is available, otherwise 'npx'."""
    if shutil.which("bun"):
        return "bunx"
    return "npx"
