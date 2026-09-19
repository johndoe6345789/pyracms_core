"""`build` command: backend, frontend, client and docker images."""
from .build_cmake import cmake_build
from .build_docker import build_docker
from .common import CYAN, ROOT, error, log, run, success
from .jsrunner import get_js_runner


def build_backend():
    log("Building backend...", CYAN)
    cmake_build(ROOT / "backend", True)
    success("Backend build complete")


def build_frontend():
    log("Building frontend...", CYAN)
    frontend_dir = ROOT / "frontend"
    js = get_js_runner()
    run(f"{js} run build", cwd=frontend_dir)
    success("Frontend build complete")


def build_client():
    log("Building client...", CYAN)
    if not (ROOT / "client").exists():
        error("Client directory not found, skipping")
        return
    cmake_build(ROOT / "client", False)
    success("Client build complete")


def cmd_build(args):
    do_all = (not args.backend and not args.frontend
              and not args.client and not args.docker)
    if do_all or args.backend:
        build_backend()
    if do_all or args.frontend:
        build_frontend()
    if args.client:
        build_client()
    if args.docker:
        build_docker()
