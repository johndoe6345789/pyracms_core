#!/usr/bin/env python3
"""
Generate CMakeLists.txt from a Jinja2 template + JSON config.
Uses Python's glob to auto-discover source files and QML resources.

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

CLIENT_DIR = Path(__file__).parent


def find_sources(base_dir, pattern="**/*.cpp"):
    """Glob for source files, return paths relative to base_dir."""
    sources = sorted(glob.glob(str(base_dir / pattern), recursive=True))
    return [os.path.relpath(s, base_dir).replace("\\", "/") for s in sources]


def find_headers(base_dir, pattern="**/*.h"):
    """Glob for header files, return paths relative to base_dir."""
    headers = sorted(glob.glob(str(base_dir / pattern), recursive=True))
    return [os.path.relpath(h, base_dir).replace("\\", "/") for h in headers]


def find_qml_files(base_dir, pattern="**/*.qml"):
    """Glob for QML files, return paths relative to base_dir."""
    qml_files = sorted(glob.glob(str(base_dir / pattern), recursive=True))
    return [os.path.relpath(q, base_dir).replace("\\", "/") for q in qml_files]


def main():
    src_dir = CLIENT_DIR / "src"
    qml_dir = CLIENT_DIR / "qml"
    test_dir = CLIENT_DIR / "tests"

    # Find all source files
    all_sources = find_sources(src_dir)
    main_source = "src/main.cpp"
    lib_sources = [f"src/{s}" for s in all_sources if s != "main.cpp"]

    # Find all headers
    all_headers = find_headers(src_dir)
    lib_headers = [f"src/{h}" for h in all_headers]

    # Find QML files
    qml_files = find_qml_files(qml_dir)
    qml_sources = [f"qml/{q}" for q in qml_files]

    # Find test sources
    test_sources = find_sources(test_dir)

    config = {
        "project_name": "hypernucleus",
        "version": "0.1.0",
        "cxx_standard": 17,
        "lib_sources": lib_sources,
        "lib_headers": lib_headers,
        "main_source": main_source,
        "qml_sources": qml_sources,
        "test_sources": test_sources,
    }

    # Write config for reference
    config_path = CLIENT_DIR / "cmake_config.json"
    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)

    # Render CMakeLists.txt
    env = Environment(
        loader=FileSystemLoader(str(CLIENT_DIR / "cmake_templates")),
        keep_trailing_newline=True,
    )
    template = env.get_template("CMakeLists.txt.j2")
    output = template.render(**config)

    cmake_path = CLIENT_DIR / "CMakeLists.txt"
    with open(cmake_path, "w") as f:
        f.write(output)

    print(f"Generated {cmake_path}")
    print(f"  Library sources: {len(lib_sources)}")
    print(f"  Library headers: {len(lib_headers)}")
    print(f"  QML files: {len(qml_sources)}")
    print(f"  Test sources: {len(test_sources)}")

    # Also generate tests/CMakeLists.txt
    test_template = env.get_template("tests_CMakeLists.txt.j2")
    test_output = test_template.render(**config)

    test_cmake_path = CLIENT_DIR / "tests" / "CMakeLists.txt"
    with open(test_cmake_path, "w") as f:
        f.write(test_output)

    print(f"Generated {test_cmake_path}")


if __name__ == "__main__":
    main()
