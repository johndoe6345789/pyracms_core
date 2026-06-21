#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
PATHS = [ROOT / "backend" / "src", ROOT / "backend" / "include"]
EXTS = {".cpp", ".h", ".hpp", ".cc", ".cxx"}
SOFT_LINES = 80
HARD_LINES = 150
MAX_COLUMNS = 80


def iter_cpp_files():
    for base in PATHS:
        for path in base.rglob("*"):
            if path.is_file() and path.suffix in EXTS:
                yield path


def rel(path):
    return path.relative_to(ROOT)


def check_file(path):
    errors = []
    warnings = []
    lines = path.read_text(errors="replace").splitlines()

    if len(lines) > HARD_LINES:
        errors.append(
            f"{rel(path)}: file has {len(lines)} lines "
            f"(hard limit {HARD_LINES})"
        )
    elif len(lines) > SOFT_LINES:
        warnings.append(
            f"{rel(path)}: file has {len(lines)} lines "
            f"(soft target {SOFT_LINES})"
        )

    for index, line in enumerate(lines, 1):
        width = len(line)
        if width > MAX_COLUMNS:
            errors.append(
                f"{rel(path)}:{index}: line has {width} columns "
                f"(limit {MAX_COLUMNS})"
            )

    return errors, warnings


def main():
    all_errors = []
    all_warnings = []
    for path in sorted(iter_cpp_files()):
        errors, warnings = check_file(path)
        all_errors.extend(errors)
        all_warnings.extend(warnings)

    for warning in all_warnings:
        print(f"warning: {warning}")
    for error in all_errors:
        print(f"error: {error}", file=sys.stderr)

    if all_errors:
        print(
            f"cpp lint failed: {len(all_errors)} error(s), "
            f"{len(all_warnings)} warning(s)",
            file=sys.stderr,
        )
        return 1

    print(f"cpp lint passed: {len(all_warnings)} warning(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
