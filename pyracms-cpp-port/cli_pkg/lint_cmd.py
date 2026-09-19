"""`lint` command: clang-tidy for the backend, the frontend linter."""
from .common import CYAN, ROOT, YELLOW, check_prereq, log, run, success
from .jsrunner import get_js_runner


def lint_backend():
    backend_dir = ROOT / "backend"
    build_dir = backend_dir / "build"
    compile_commands = build_dir / "compile_commands.json"

    if not check_prereq("clang-tidy", "clang-tidy"):
        log("Skipping C++ linting (clang-tidy not found)", YELLOW)
        return
    source_dirs = [backend_dir / "src"]
    cpp_files = []
    for src_dir in source_dirs:
        if src_dir.exists():
            for ext in ["*.cpp", "*.cc", "*.cxx"]:
                cpp_files.extend(src_dir.rglob(ext))

    if not cpp_files:
        log("No C++ source files found for clang-tidy", YELLOW)
        return
    # Limit to avoid arg too long
    files_str = " ".join(str(f) for f in cpp_files[:50])
    tidy_args = ""
    if compile_commands.exists():
        tidy_args = f"-p {build_dir}"
    log(f"Running clang-tidy on {len(cpp_files)} source files...")
    run(
        f"clang-tidy {tidy_args} {files_str}",
        cwd=backend_dir,
        check=False
    )


def lint_frontend():
    frontend_dir = ROOT / "frontend"
    js = get_js_runner()
    if (frontend_dir / "package.json").exists():
        log("Running frontend linter...")
        run(f"{js} run lint", cwd=frontend_dir, check=False)
    else:
        log("No package.json in frontend/", YELLOW)


def cmd_lint(args):
    log("Running linters...", CYAN)
    lint_backend()
    lint_frontend()
    success("Linting complete")
