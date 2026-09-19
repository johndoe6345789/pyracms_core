"""`generate-cmake` command."""
from .common import CYAN, ROOT, YELLOW, log, run, success


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
        log("No generate_cmake.py in client/ "
            "(or client dir missing)", YELLOW)
