"""Path helpers: normalise call paths and match them to backend routes."""

import fnmatch
import itertools
import re

HOLE = "{}"


def join_literals(expr):
    """Join adjacent (f-)string literals into one string."""
    out = ""
    for m in re.finditer(r'(f?)"([^"\n]*)"', expr):
        out += m.group(2)
    return out


def normalise(raw):
    """Turn ${x}/{x} holes into {} and drop the prefix and query."""
    text = re.sub(r"\$\{[^}]*\}", HOLE, raw)
    text = re.sub(r"\{[^{}]*\}", HOLE, text)
    text = text[text.find("/api/"):] if "/api/" in text else text
    text = text.split("?")[0]
    return re.sub(r"(?<=[a-z]){}$", "", text)


def samples(path):
    """Candidate concrete paths: each hole becomes a word or a number."""
    n = path.count(HOLE)
    for combo in itertools.product(("x", "1"), repeat=min(n, 6)):
        it = iter(combo + ("x",) * (n - len(combo)))
        yield re.sub(r"\{\}", lambda _: next(it), path)


def seg_ok(call, route):
    if route.startswith("{") or call == HOLE:
        return True
    return fnmatch.fnmatchcase(route, call.replace(HOLE, "*"))


def path_ok(path, route_path, rx):
    if "(" in route_path:  # regex route: try concrete samples
        return any(rx.fullmatch(s) for s in samples(path))
    a, b = path.split("/"), route_path.split("/")
    return len(a) == len(b) and all(map(seg_ok, a, b))


def match(verb, path, routes):
    """True when some route serves this verb (or any verb) and path."""
    return any(
        (not verb or r_verb == verb) and path_ok(path, r_path, rx)
        for r_verb, r_path, rx in routes)
