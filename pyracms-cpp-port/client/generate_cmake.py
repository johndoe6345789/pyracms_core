#!/usr/bin/env python3
"""
Generate CMakeLists.txt from a Jinja2 template + JSON config.

Source layout (see README.md):
  src/domain/, src/services/    plain C++ library (hypernucleus_lib)
  src/models/, src/viewmodels/  QML-facing types (QML_ELEMENT/QML_SINGLETON),
                                compiled into the "Hypernucleus" QML module
  qml/                          the QML files of that module
  tests/*.cpp                   GoogleTest suites (one executable)
  tests/qt/*.cpp                QtTest suites (one executable each)

Usage: python generate_cmake.py    (needs jinja2)
"""

from cmake_gen_files import (CLIENT_DIR, LIB_DIRS, MODULE_DIRS, collect,
                             find_files)
from cmake_gen_render import render_all


def build_config():
    qml = [f"qml/{q}" for q in find_files(CLIENT_DIR / "qml", "**/*.qml")]
    tests = CLIENT_DIR / "tests"
    return {
        "project_name": "hypernucleus",
        "version": "0.2.0",
        "cxx_standard": 17,
        "lib_sources": collect(LIB_DIRS, ".cpp"),
        "lib_headers": collect(LIB_DIRS, ".h"),
        "main_source": "src/main.cpp",
        "module_sources": collect(MODULE_DIRS, ".cpp"),
        "module_headers": collect(MODULE_DIRS, ".h"),
        "qml_sources": qml,
        "ts_files": [f"translations/{t}" for t in
                     find_files(CLIENT_DIR / "translations", "*.ts")],
        "singleton_qml": ["qml/theme/Theme.qml"],
        # GoogleTest suites are in tests/, QtTest suites in tests/qt/
        "test_sources": find_files(tests, "*.cpp"),
        "qt_test_sources": find_files(tests, "qt/*.cpp"),
    }


def main():
    config = build_config()
    render_all(config)
    for key in ("lib_sources", "module_sources", "qml_sources",
                "test_sources", "qt_test_sources"):
        print(f"  {key}: {len(config[key])}")


if __name__ == "__main__":
    main()
