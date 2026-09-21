"""Entry point: parse arguments and dispatch to the command modules."""
import sys

from .build_cmd import cmd_build
from .cmake_cmd import cmd_generate_cmake
from .db_cmd import cmd_db
from .lint_cmd import cmd_lint
from .parser import build_parser
from .run_cmd import cmd_run
from .setup_cmd import cmd_setup
from .test_cmd import cmd_test
from .user_cmd import cmd_user

COMMANDS = {
    "setup": cmd_setup,
    "build": cmd_build,
    "run": cmd_run,
    "db": cmd_db,
    "user": cmd_user,
    "test": cmd_test,
    "generate-cmake": cmd_generate_cmake,
    "lint": cmd_lint,
}


def main():
    parser = build_parser()
    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    handler = COMMANDS.get(args.command)
    if handler:
        handler(args)
    else:
        parser.print_help()
        sys.exit(1)
