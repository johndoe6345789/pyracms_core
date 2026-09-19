"""`test` command: backend, frontend, e2e and client tests."""
import sys

from .common import CYAN, ROOT, error, log, run, success
from .jsrunner import get_js_exec_runner, get_js_runner


def test_backend(do_all):
    log("Running backend tests...", CYAN)
    build_dir = ROOT / "backend" / "build"
    if not build_dir.exists():
        error("Backend build directory not found. "
              "Run 'python cli.py build --backend' first.")
        if not do_all:
            sys.exit(1)
    else:
        run("ctest --verbose", cwd=build_dir)
        success("Backend tests passed")


def test_frontend():
    log("Running frontend tests...", CYAN)
    frontend_dir = ROOT / "frontend"
    js = get_js_runner()
    run(f"{js} test", cwd=frontend_dir)
    success("Frontend tests passed")


def test_e2e():
    log("Running end-to-end tests...", CYAN)
    frontend_dir = ROOT / "frontend"
    jx = get_js_exec_runner()
    run(f"{jx} playwright test", cwd=frontend_dir)
    success("E2E tests passed")


def test_client():
    log("Running client tests...", CYAN)
    client_build_dir = ROOT / "client" / "build"
    if not client_build_dir.exists():
        error("Client build directory not found. "
              "Run 'python cli.py build --client' first.")
        sys.exit(1)
    run("ctest --verbose", cwd=client_build_dir)
    success("Client tests passed")


def cmd_test(args):
    do_all = (not args.backend and not args.frontend
              and not args.e2e and not args.client)

    if do_all or args.backend:
        test_backend(do_all)
    if do_all or args.frontend:
        test_frontend()
    if args.e2e:
        test_e2e()
    if args.client:
        test_client()
