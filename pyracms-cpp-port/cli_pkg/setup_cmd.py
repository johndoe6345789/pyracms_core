"""`setup` command: install dependencies."""
import sys

from .common import CYAN, ROOT, check_prereq, error, log, run, success
from .jsrunner import get_js_runner


def setup_backend():
    log("Setting up backend...", CYAN)
    backend_dir = ROOT / "backend"
    if not check_prereq("conan", "conan"):
        sys.exit(1)
    run("pip install jinja2", cwd=backend_dir)
    run("conan install . --build=missing", cwd=backend_dir)
    success("Backend setup complete")


def setup_frontend():
    log("Setting up frontend...", CYAN)
    frontend_dir = ROOT / "frontend"
    js = get_js_runner()
    run(f"{js} install", cwd=frontend_dir)
    success("Frontend setup complete")


def setup_client():
    log("Setting up client...", CYAN)
    client_dir = ROOT / "client"
    if not client_dir.exists():
        error("Client directory not found, skipping")
        return
    if not check_prereq("conan", "conan"):
        sys.exit(1)
    run("pip install jinja2", cwd=client_dir)
    run("conan install . --build=missing", cwd=client_dir)
    success("Client setup complete")


def cmd_setup(args):
    do_all = not args.backend and not args.frontend and not args.client
    if do_all or args.backend:
        setup_backend()
    if do_all or args.frontend:
        setup_frontend()
    if do_all or args.client:
        setup_client()
