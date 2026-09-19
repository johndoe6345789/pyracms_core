#!/usr/bin/env python3
"""
PyraCMS CLI -- Bootstrap, build, and run everything.

Usage:
    python cli.py setup [--backend] [--frontend] [--client]
    python cli.py build [--backend] [--frontend] [--client] [--docker]
    python cli.py run [--dev] [--client]
    python cli.py db migrate|seed|reset
    python cli.py test [--backend] [--frontend] [--e2e] [--client]
    python cli.py generate-cmake
    python cli.py lint
"""

from cli_pkg.main import main

if __name__ == "__main__":
    main()
