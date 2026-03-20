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

import argparse
import os
import subprocess
import sys
import shutil
import signal
from pathlib import Path

# ANSI colors
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
CYAN = '\033[96m'
RESET = '\033[0m'
BOLD = '\033[1m'

ROOT = Path(__file__).parent


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


# ---------------------------------------------------------------------------
# setup
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# build
# ---------------------------------------------------------------------------

def build_backend():
    log("Building backend...", CYAN)
    backend_dir = ROOT / "backend"

    # Generate CMakeLists.txt via the project's generate_cmake.py
    generate_cmake_path = backend_dir / "generate_cmake.py"
    if generate_cmake_path.exists():
        run("python generate_cmake.py", cwd=backend_dir)
    else:
        log("No generate_cmake.py found in backend, skipping CMake generation", YELLOW)

    build_dir = backend_dir / "build"
    build_dir.mkdir(exist_ok=True)

    # Determine toolchain file location
    toolchain = ""
    for candidate in [
        build_dir / "conan_toolchain.cmake",
        build_dir / "Release" / "generators" / "conan_toolchain.cmake",
        build_dir / "generators" / "conan_toolchain.cmake",
    ]:
        if candidate.exists():
            toolchain = f"-DCMAKE_TOOLCHAIN_FILE={candidate}"
            break

    if not toolchain:
        # Try common conan2 output path
        toolchain = "-DCMAKE_TOOLCHAIN_FILE=conan_toolchain.cmake"

    run(f"cmake .. {toolchain}", cwd=build_dir)
    run("cmake --build . --parallel", cwd=build_dir)
    success("Backend build complete")


def build_frontend():
    log("Building frontend...", CYAN)
    frontend_dir = ROOT / "frontend"
    js = get_js_runner()
    run(f"{js} run build", cwd=frontend_dir)
    success("Frontend build complete")


def build_client():
    log("Building client...", CYAN)
    client_dir = ROOT / "client"
    if not client_dir.exists():
        error("Client directory not found, skipping")
        return

    generate_cmake_path = client_dir / "generate_cmake.py"
    if generate_cmake_path.exists():
        run("python generate_cmake.py", cwd=client_dir)

    build_dir = client_dir / "build"
    build_dir.mkdir(exist_ok=True)

    toolchain = ""
    for candidate in [
        build_dir / "conan_toolchain.cmake",
        build_dir / "Release" / "generators" / "conan_toolchain.cmake",
        build_dir / "generators" / "conan_toolchain.cmake",
    ]:
        if candidate.exists():
            toolchain = f"-DCMAKE_TOOLCHAIN_FILE={candidate}"
            break

    if not toolchain:
        toolchain = "-DCMAKE_TOOLCHAIN_FILE=conan_toolchain.cmake"

    run(f"cmake .. {toolchain}", cwd=build_dir)
    run("cmake --build . --parallel", cwd=build_dir)
    success("Client build complete")


def build_docker():
    log("Building Docker code snippet runner images...", CYAN)
    if not check_prereq("docker", "docker"):
        sys.exit(1)

    docker_dir = ROOT / "docker"
    runners = {
        "pyracms-runner-python": "python",
        "pyracms-runner-node": "node",
        "pyracms-runner-cpp": "cpp",
        "pyracms-runner-rust": "rust",
        "pyracms-runner-go": "go",
        "pyracms-runner-java": "java",
        "pyracms-runner-ruby": "ruby",
    }

    for image_name, folder in runners.items():
        folder_path = docker_dir / folder
        if not folder_path.exists():
            error(f"Docker context {folder_path} not found, skipping {image_name}")
            continue
        log(f"Building {image_name} from docker/{folder}/")
        run(f"docker build -t {image_name} .", cwd=folder_path)
        success(f"Built {image_name}")

    success("All Docker runner images built")


def cmd_build(args):
    do_all = not args.backend and not args.frontend and not args.client and not args.docker
    if do_all or args.backend:
        build_backend()
    if do_all or args.frontend:
        build_frontend()
    if args.client:
        build_client()
    if args.docker:
        build_docker()


# ---------------------------------------------------------------------------
# run
# ---------------------------------------------------------------------------

def cmd_run(args):
    if args.client:
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
            error("Client binary not found. Run 'python cli.py build --client' first.")
            sys.exit(1)

        run(str(client_binary))
        return

    if args.dev:
        log("Starting development servers...", CYAN)

        processes = []

        # Start backend build and run
        backend_dir = ROOT / "backend"
        build_dir = backend_dir / "build"
        backend_binary = build_dir / "pyracms_backend"

        if backend_binary.exists():
            log("Starting backend server...")
            p_backend = subprocess.Popen(
                str(backend_binary),
                cwd=build_dir,
                env={**os.environ, "SERVER_HOST": "0.0.0.0", "SERVER_PORT": "8080"}
            )
            processes.append(p_backend)
        else:
            log("Backend binary not found; building first...", YELLOW)
            build_backend()
            backend_binary = build_dir / "pyracms_backend"
            if backend_binary.exists():
                p_backend = subprocess.Popen(
                    str(backend_binary),
                    cwd=build_dir,
                    env={**os.environ, "SERVER_HOST": "0.0.0.0", "SERVER_PORT": "8080"}
                )
                processes.append(p_backend)

        # Start frontend dev server
        frontend_dir = ROOT / "frontend"
        js = get_js_runner()
        log("Starting frontend dev server...")
        p_frontend = subprocess.Popen(
            f"{js} run dev",
            shell=True,
            cwd=frontend_dir
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

        return

    # Default: docker-compose up
    log("Starting all services via docker-compose...", CYAN)
    if not check_prereq("docker-compose", "docker-compose"):
        # Try docker compose (v2)
        run("docker compose up", cwd=ROOT)
    else:
        run("docker-compose up", cwd=ROOT)


# ---------------------------------------------------------------------------
# db
# ---------------------------------------------------------------------------

def get_db_env():
    return {
        "PGHOST": os.environ.get("DB_HOST", "localhost"),
        "PGPORT": os.environ.get("DB_PORT", "5433"),
        "PGDATABASE": os.environ.get("DB_NAME", "pyracms"),
        "PGUSER": os.environ.get("DB_USER", "pyracms"),
        "PGPASSWORD": os.environ.get("DB_PASSWORD", "pyracms"),
    }


def cmd_db(args):
    if not check_prereq("psql", "psql"):
        sys.exit(1)

    db_env = get_db_env()
    sql_dir = ROOT / "backend" / "sql"

    if args.action == "migrate":
        log("Running database migrations...", CYAN)
        sql_files = sorted(sql_dir.glob("*.sql"))
        for sql_file in sql_files:
            log(f"Applying {sql_file.name}...")
            run(
                f"psql -f {sql_file}",
                env={**os.environ, **db_env},
                check=False
            )
        success("Migrations complete")

    elif args.action == "seed":
        log("Seeding database with sample data...", CYAN)
        seed_sql = """
        -- Seed a default tenant
        INSERT INTO tenants (name, domain, settings)
        VALUES ('Default', 'localhost', '{}')
        ON CONFLICT DO NOTHING;

        -- Seed an admin user (password: admin123)
        INSERT INTO users (username, email, password_hash, role, tenant_id)
        VALUES ('admin', 'admin@localhost', '$2b$12$LJ3m4ys3Rl0pT0sZWVKPleM7R.L8flGQ0Btwb8E7gHJKN5FKxMHy2', 'admin', 1)
        ON CONFLICT DO NOTHING;

        -- Seed some achievements (already done in migration, but ensure)
        INSERT INTO achievements (name, display_name, description, icon) VALUES
            ('first_post', 'First Post', 'Created your first forum post', 'forum'),
            ('first_article', 'Author', 'Published your first article', 'article'),
            ('first_snippet', 'Coder', 'Created your first code snippet', 'code')
        ON CONFLICT (name) DO NOTHING;

        -- Seed a sample article
        INSERT INTO articles (name, display_name, is_private, tenant_id, user_id, renderer_name, view_count)
        VALUES ('welcome', 'Welcome to PyraCMS', false, 1, 1, 'markdown', 0)
        ON CONFLICT DO NOTHING;

        -- Seed a forum category
        INSERT INTO forum_categories (name, tenant_id)
        VALUES ('General Discussion', 1)
        ON CONFLICT DO NOTHING;
        """
        result = subprocess.run(
            "psql",
            input=seed_sql,
            shell=False,
            env={**os.environ, **db_env},
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            error(f"Seed failed: {result.stderr}")
        else:
            success("Database seeded")

    elif args.action == "reset":
        log("Resetting database...", YELLOW)
        confirm = input(f"{RED}This will DROP and recreate the database. Continue? [y/N]: {RESET}")
        if confirm.lower() != 'y':
            log("Cancelled.")
            return

        db_name = db_env["PGDATABASE"]
        maintenance_env = {**os.environ, **db_env, "PGDATABASE": "postgres"}

        run(
            f'psql -c "DROP DATABASE IF EXISTS {db_name};"',
            env=maintenance_env,
            check=False
        )
        run(
            f'psql -c "CREATE DATABASE {db_name} OWNER {db_env["PGUSER"]};"',
            env=maintenance_env,
            check=False
        )
        success(f"Database '{db_name}' recreated")

        # Re-run migrations
        log("Re-running migrations...", CYAN)
        sql_files = sorted(sql_dir.glob("*.sql"))
        for sql_file in sql_files:
            log(f"Applying {sql_file.name}...")
            run(
                f"psql -f {sql_file}",
                env={**os.environ, **db_env},
                check=False
            )
        success("Database reset complete")

    else:
        error(f"Unknown db action: {args.action}")
        sys.exit(1)


# ---------------------------------------------------------------------------
# test
# ---------------------------------------------------------------------------

def cmd_test(args):
    do_all = not args.backend and not args.frontend and not args.e2e and not args.client

    if do_all or args.backend:
        log("Running backend tests...", CYAN)
        build_dir = ROOT / "backend" / "build"
        if not build_dir.exists():
            error("Backend build directory not found. Run 'python cli.py build --backend' first.")
            if not do_all:
                sys.exit(1)
        else:
            run("ctest --verbose", cwd=build_dir)
            success("Backend tests passed")

    if do_all or args.frontend:
        log("Running frontend tests...", CYAN)
        frontend_dir = ROOT / "frontend"
        js = get_js_runner()
        run(f"{js} test", cwd=frontend_dir)
        success("Frontend tests passed")

    if args.e2e:
        log("Running end-to-end tests...", CYAN)
        frontend_dir = ROOT / "frontend"
        jx = get_js_exec_runner()
        run(f"{jx} playwright test", cwd=frontend_dir)
        success("E2E tests passed")

    if args.client:
        log("Running client tests...", CYAN)
        client_build_dir = ROOT / "client" / "build"
        if not client_build_dir.exists():
            error("Client build directory not found. Run 'python cli.py build --client' first.")
            sys.exit(1)
        run("ctest --verbose", cwd=client_build_dir)
        success("Client tests passed")


# ---------------------------------------------------------------------------
# generate-cmake
# ---------------------------------------------------------------------------

def cmd_generate_cmake(args):
    log("Generating CMakeLists.txt files...", CYAN)

    backend_dir = ROOT / "backend"
    backend_gen = backend_dir / "generate_cmake.py"
    if backend_gen.exists():
        log("Generating backend CMakeLists.txt...")
        run("python generate_cmake.py", cwd=backend_dir)
        success("Backend CMakeLists.txt generated")
    else:
        log("No generate_cmake.py in backend/", YELLOW)

    client_dir = ROOT / "client"
    client_gen = client_dir / "generate_cmake.py"
    if client_gen.exists():
        log("Generating client CMakeLists.txt...")
        run("python generate_cmake.py", cwd=client_dir)
        success("Client CMakeLists.txt generated")
    else:
        log("No generate_cmake.py in client/ (or client dir missing)", YELLOW)


# ---------------------------------------------------------------------------
# lint
# ---------------------------------------------------------------------------

def cmd_lint(args):
    log("Running linters...", CYAN)

    # Backend: clang-tidy
    backend_dir = ROOT / "backend"
    build_dir = backend_dir / "build"
    compile_commands = build_dir / "compile_commands.json"

    if check_prereq("clang-tidy", "clang-tidy"):
        source_dirs = [backend_dir / "src"]
        cpp_files = []
        for src_dir in source_dirs:
            if src_dir.exists():
                for ext in ["*.cpp", "*.cc", "*.cxx"]:
                    cpp_files.extend(src_dir.rglob(ext))

        if cpp_files:
            files_str = " ".join(str(f) for f in cpp_files[:50])  # Limit to avoid arg too long
            tidy_args = ""
            if compile_commands.exists():
                tidy_args = f"-p {build_dir}"
            log(f"Running clang-tidy on {len(cpp_files)} source files...")
            run(
                f"clang-tidy {tidy_args} {files_str}",
                cwd=backend_dir,
                check=False
            )
        else:
            log("No C++ source files found for clang-tidy", YELLOW)
    else:
        log("Skipping C++ linting (clang-tidy not found)", YELLOW)

    # Frontend: lint
    frontend_dir = ROOT / "frontend"
    js = get_js_runner()
    if (frontend_dir / "package.json").exists():
        log("Running frontend linter...")
        run(f"{js} run lint", cwd=frontend_dir, check=False)
    else:
        log("No package.json in frontend/", YELLOW)

    success("Linting complete")


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        prog="pyracms-cli",
        description="PyraCMS CLI -- Bootstrap, build, and run everything."
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # setup
    p_setup = subparsers.add_parser("setup", help="Install dependencies")
    p_setup.add_argument("--backend", action="store_true", help="Setup backend only")
    p_setup.add_argument("--frontend", action="store_true", help="Setup frontend only")
    p_setup.add_argument("--client", action="store_true", help="Setup Qt6 client only")

    # build
    p_build = subparsers.add_parser("build", help="Build components")
    p_build.add_argument("--backend", action="store_true", help="Build backend only")
    p_build.add_argument("--frontend", action="store_true", help="Build frontend only")
    p_build.add_argument("--client", action="store_true", help="Build Qt6 client only")
    p_build.add_argument("--docker", action="store_true", help="Build Docker runner images")

    # run
    p_run = subparsers.add_parser("run", help="Run the application")
    p_run.add_argument("--dev", action="store_true", help="Run in dev mode (backend + frontend)")
    p_run.add_argument("--client", action="store_true", help="Launch Qt6 desktop client")

    # db
    p_db = subparsers.add_parser("db", help="Database operations")
    p_db.add_argument("action", choices=["migrate", "seed", "reset"],
                      help="migrate: run SQL files, seed: insert sample data, reset: drop and recreate")

    # test
    p_test = subparsers.add_parser("test", help="Run tests")
    p_test.add_argument("--backend", action="store_true", help="Run backend tests")
    p_test.add_argument("--frontend", action="store_true", help="Run frontend tests")
    p_test.add_argument("--e2e", action="store_true", help="Run Playwright e2e tests")
    p_test.add_argument("--client", action="store_true", help="Run client tests")

    # generate-cmake
    subparsers.add_parser("generate-cmake", help="Generate CMakeLists.txt for backend and client")

    # lint
    subparsers.add_parser("lint", help="Run linters on backend and frontend")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    commands = {
        "setup": cmd_setup,
        "build": cmd_build,
        "run": cmd_run,
        "db": cmd_db,
        "test": cmd_test,
        "generate-cmake": cmd_generate_cmake,
        "lint": cmd_lint,
    }

    handler = commands.get(args.command)
    if handler:
        handler(args)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
