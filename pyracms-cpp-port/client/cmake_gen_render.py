"""Rendering of the CMake files for generate_cmake.py."""

import json

from jinja2 import Environment, FileSystemLoader

from cmake_gen_files import CLIENT_DIR


def render_all(config):
    """Write cmake_config.json, CMakeLists.txt and tests/CMakeLists.txt."""
    with open(CLIENT_DIR / "cmake_config.json", "w") as f:
        json.dump(config, f, indent=2)
        f.write("\n")

    env = Environment(
        loader=FileSystemLoader(str(CLIENT_DIR / "cmake_templates")),
        keep_trailing_newline=True,
        trim_blocks=True,
        lstrip_blocks=True,
    )
    targets = [
        ("CMakeLists.txt.j2", CLIENT_DIR / "CMakeLists.txt"),
        ("tests_CMakeLists.txt.j2", CLIENT_DIR / "tests" / "CMakeLists.txt"),
    ]
    for template, path in targets:
        with open(path, "w") as f:
            f.write(env.get_template(template).render(**config))
        print(f"Generated {path}")
