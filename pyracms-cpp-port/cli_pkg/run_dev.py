"""Start the backend binary and the frontend dev server together."""
import os
import signal
import subprocess
import sys

from .build_cmd import build_backend
from .common import CYAN, ROOT, YELLOW, log, success
from .jsrunner import get_js_runner

BACKEND_ENV = {"SERVER_HOST": "0.0.0.0", "SERVER_PORT": "8080"}


def start_backend(processes, build_dir, binary):
    p_backend = subprocess.Popen(
        str(binary),
        cwd=build_dir,
        env={**os.environ, **BACKEND_ENV}
    )
    processes.append(p_backend)


def run_dev():
    log("Starting development servers...", CYAN)
    processes = []

    # Start backend build and run
    build_dir = ROOT / "backend" / "build"
    backend_binary = build_dir / "pyracms_backend"

    if backend_binary.exists():
        log("Starting backend server...")
        start_backend(processes, build_dir, backend_binary)
    else:
        log("Backend binary not found; building first...", YELLOW)
        build_backend()
        backend_binary = build_dir / "pyracms_backend"
        if backend_binary.exists():
            start_backend(processes, build_dir, backend_binary)

    # Start frontend dev server
    js = get_js_runner()
    log("Starting frontend dev server...")
    p_frontend = subprocess.Popen(
        f"{js} run dev",
        shell=True,
        cwd=ROOT / "frontend"
    )
    processes.append(p_frontend)

    success("Dev servers started. Press Ctrl+C to stop.")

    def cleanup(sig, frame):
        log("Shutting down dev servers...", YELLOW)
        for p in processes:
            try:
                p.terminate()
                p.wait(timeout=5)
            except Exception:
                p.kill()
        sys.exit(0)

    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    # Wait for any process to exit
    try:
        for p in processes:
            p.wait()
    except KeyboardInterrupt:
        cleanup(None, None)
