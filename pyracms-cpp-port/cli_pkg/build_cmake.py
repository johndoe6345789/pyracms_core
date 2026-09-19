"""CMake configure + build shared by the backend and the Qt client."""
from .common import YELLOW, log, run


def find_toolchain(build_dir):
    for candidate in [
        build_dir / "conan_toolchain.cmake",
        build_dir / "Release" / "generators" / "conan_toolchain.cmake",
        build_dir / "generators" / "conan_toolchain.cmake",
    ]:
        if candidate.exists():
            return f"-DCMAKE_TOOLCHAIN_FILE={candidate}"
    # Try common conan2 output path
    return "-DCMAKE_TOOLCHAIN_FILE=conan_toolchain.cmake"


def cmake_build(project_dir, warn_missing):
    # Generate CMakeLists.txt via the project's generate_cmake.py
    if (project_dir / "generate_cmake.py").exists():
        run("python generate_cmake.py", cwd=project_dir)
    elif warn_missing:
        log("No generate_cmake.py found in backend, "
            "skipping CMake generation", YELLOW)

    build_dir = project_dir / "build"
    build_dir.mkdir(exist_ok=True)
    toolchain = find_toolchain(build_dir)
    run(f"cmake .. {toolchain}", cwd=build_dir)
    run("cmake --build . --parallel", cwd=build_dir)
