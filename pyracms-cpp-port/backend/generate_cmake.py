#!/usr/bin/env python3
"""
Generate CMakeLists.txt from a Jinja2 template + JSON config.
Uses Python's glob to auto-discover source files.

Usage: python generate_cmake.py
"""

import glob
import json
import os
from pathlib import Path

try:
    from jinja2 import Environment, FileSystemLoader
except ImportError:
    print("pip install jinja2")
    raise

BACKEND_DIR = Path(__file__).parent

# Auto-discover source files
def find_sources(base_dir, pattern="**/*.cpp"):
    """Glob for source files, return paths relative to base_dir."""
    sources = sorted(glob.glob(str(base_dir / pattern), recursive=True))
    return [os.path.relpath(s, base_dir).replace("\\", "/") for s in sources]

def main():
    src_dir = BACKEND_DIR / "src"
    test_dir = BACKEND_DIR / "tests"

    # Find all source files
    all_sources = find_sources(src_dir)
    main_source = "src/main.cpp"
    lib_sources = [f"src/{s}" for s in all_sources if s != "main.cpp"]
    test_sources = find_sources(test_dir)

    config = {
        "project_name": "pyracms_server",
        "version": "0.1.0",
        "cxx_standard": 17,
        "lib_sources": lib_sources,
        "main_source": main_source,
        "test_sources": test_sources,
    }

    # Write config for reference
    config_path = BACKEND_DIR / "cmake_config.json"
    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)

    # Render CMakeLists.txt
    env = Environment(
        loader=FileSystemLoader(str(BACKEND_DIR / "cmake_templates")),
        keep_trailing_newline=True,
    )
    template = env.get_template("CMakeLists.txt.j2")
    output = template.render(**config)

    cmake_path = BACKEND_DIR / "CMakeLists.txt"
    with open(cmake_path, "w") as f:
        f.write(output)

    print(f"Generated {cmake_path}")
    print(f"  Library sources: {len(lib_sources)}")
    print(f"  Test sources: {len(test_sources)}")

    # Also generate tests/CMakeLists.txt
    test_template = env.get_template("tests_CMakeLists.txt.j2")
    test_output = test_template.render(**config)

    test_cmake_path = BACKEND_DIR / "tests" / "CMakeLists.txt"
    with open(test_cmake_path, "w") as f:
        f.write(test_output)

    print(f"Generated {test_cmake_path}")

if __name__ == "__main__":
    main()
