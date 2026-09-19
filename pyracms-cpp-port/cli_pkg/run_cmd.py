"""`run` command: docker-compose, dev servers, or the Qt client."""
import sys

from .common import CYAN, ROOT, check_prereq, error, log, run
from .run_dev import run_dev


def run_client():
    log("Launching Qt6 desktop client...", CYAN)
    client_binary = ROOT / "client" / "build" / "pyracms_client"
    if not client_binary.exists():
        # Try alternative names
        for alt in ["pyracms-client", "PyracmsClient"]:
            alt_path = ROOT / "client" / "build" / alt
            if alt_path.exists():
                client_binary = alt_path
                break

    if not client_binary.exists():
        error("Client binary not found. "
              "Run 'python cli.py build --client' first.")
        sys.exit(1)

    run(str(client_binary))


def run_compose():
    log("Starting all services via docker-compose...", CYAN)
    if not check_prereq("docker-compose", "docker-compose"):
        # Try docker compose (v2)
        run("docker compose up", cwd=ROOT)
    else:
        run("docker-compose up", cwd=ROOT)


def cmd_run(args):
    if args.client:
        run_client()
        return
    if args.dev:
        run_dev()
        return
    run_compose()
