"""Shared helpers: colours, logging, prerequisite checks, shell runner."""
import os
import shutil
import subprocess
import sys
from pathlib import Path

# ANSI colors
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
CYAN = '\033[96m'
RESET = '\033[0m'
BOLD = '\033[1m'

ROOT = Path(__file__).parent.parent


def log(msg, color=GREEN):
    print(f"{color}{BOLD}>{RESET} {msg}")


def error(msg):
    print(f"{RED}{BOLD}x{RESET} {msg}", file=sys.stderr)


def success(msg):
    print(f"{GREEN}{BOLD}v{RESET} {msg}")


def check_prereq(name, command):
    if shutil.which(command):
        return True
    error(f"{name} not found. Please install {name} ({command})")
    return False


def run(cmd, cwd=None, env=None, check=True):
    log(f"Running: {cmd}")
    merged_env = os.environ.copy()
    if env:
        merged_env.update(env)
    result = subprocess.run(cmd, shell=True, cwd=cwd, env=merged_env)
    if check and result.returncode != 0:
        error(f"Command failed with exit code {result.returncode}")
        sys.exit(result.returncode)
    return result
