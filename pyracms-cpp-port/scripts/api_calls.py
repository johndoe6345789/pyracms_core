"""Collect every client API call in the repo (ts/tsx, python, C++)."""

from pathlib import Path

from api_calls_js import js_calls
from api_calls_native import cpp_calls, py_calls

ROOT = Path(__file__).resolve().parents[1]
PLAN = [("frontend/src", ("*.ts", "*.tsx"), js_calls),
        ("client/src", ("*.cpp", "*.h"), cpp_calls),
        ("scripts", ("*.py",), py_calls)]
SKIP = ("__tests__", "/tests/", ".test.", "node_modules", "/e2e/")


def collect(root=ROOT):
    """Yield (verb|None, normalised path, 'file:line')."""
    for base, pats, fn in PLAN:
        for pat in pats:
            for f in sorted((root / base).rglob(pat)):
                rel = f.relative_to(root).as_posix()
                if any(s in rel for s in SKIP):
                    continue
                text = f.read_text(encoding="utf-8")
                for verb, path, pos in fn(f):
                    line = text.count("\n", 0, pos) + 1
                    yield verb, path, f"{rel}:{line}"
