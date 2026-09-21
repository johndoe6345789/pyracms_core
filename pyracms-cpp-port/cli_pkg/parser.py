"""argparse definition for the PyraCMS CLI."""
import argparse


def flags(sub, *items):
    for name, text in items:
        sub.add_argument(name, action="store_true", help=text)


def build_parser():
    parser = argparse.ArgumentParser(
        prog="pyracms-cli",
        description="PyraCMS CLI -- Bootstrap, build, and run everything."
    )
    sp = parser.add_subparsers(dest="command", help="Available commands")

    p = sp.add_parser("setup", help="Install dependencies")
    flags(p, ("--backend", "Setup backend only"),
          ("--frontend", "Setup frontend only"),
          ("--client", "Setup Qt6 client only"))

    p = sp.add_parser("build", help="Build components")
    flags(p, ("--backend", "Build backend only"),
          ("--frontend", "Build frontend only"),
          ("--client", "Build Qt6 client only"),
          ("--docker", "Build Docker runner images"))

    p = sp.add_parser("run", help="Run the application")
    flags(p, ("--dev", "Run in dev mode (backend + frontend)"),
          ("--client", "Launch Qt6 desktop client"))

    p = sp.add_parser("db", help="Database operations")
    p.add_argument(
        "action", choices=["migrate", "seed", "reset"],
        help="migrate: run SQL files, seed: insert sample data, "
             "reset: drop and recreate")

    p = sp.add_parser("user", help="Account maintenance")
    p.add_argument("action", choices=["set-password"],
                   help="set-password: reset a lost password without e-mail")
    p.add_argument("username", help="account username")
    p.add_argument("--tenant", metavar="SLUG",
                   help="site the account belongs to (default: platform)")
    p.add_argument("--yes", action="store_true", help="skip the confirmation")
    p.add_argument("--print-sql", action="store_true",
                   help="print the SQL instead of running psql")

    p = sp.add_parser("test", help="Run tests")
    flags(p, ("--backend", "Run backend tests"),
          ("--frontend", "Run frontend tests"),
          ("--e2e", "Run Playwright e2e tests"),
          ("--client", "Run client tests"))

    sp.add_parser("generate-cmake",
                  help="Generate CMakeLists.txt for backend and client")
    sp.add_parser("lint", help="Run linters on backend and frontend")
    return parser
