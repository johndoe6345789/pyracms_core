"""API calls found in python scripts and the Qt client."""

import re

from api_paths import join_literals, normalise

PYCALL = re.compile(r'request\(\s*"(\w+)"\s*,\s*((?:f?"[^"\n]*"\s*)+)')
CPP = re.compile(r'(createRequest|getJson)\(\s*'
                 r'((?:"[^"]*"|\w+)(?:\s*\+\s*(?:"[^"]*"|[\w.()]+))*)')
CPP_VERBS = {"get": "GET", "post": "POST", "put": "PUT",
             "deleteResource": "DELETE"}


def py_calls(path):
    src = path.read_text(encoding="utf-8")
    for m in PYCALL.finditer(src):
        expr = join_literals(m.group(2))
        if expr.startswith("/api/"):
            yield m.group(1).upper(), normalise(expr), m.start()


def cpp_verb(src, pos, fn):
    if fn == "getJson":
        return "GET"
    found = re.findall(r"(deleteResource|get|post|put)\(\s*$",
                       src[max(0, pos - 40):pos])
    return CPP_VERBS[found[-1]] if found else None


def cpp_calls(path):
    src = path.read_text(encoding="utf-8")
    for m in CPP.finditer(src):
        parts = re.findall(r'"[^"]*"|[\w.()]+', m.group(2))
        text = "".join(p[1:-1] if p[0] == '"' else "{}" for p in parts)
        if text.startswith("/api/"):
            yield (cpp_verb(src, m.start(), m.group(1)), normalise(text),
                   m.start())
