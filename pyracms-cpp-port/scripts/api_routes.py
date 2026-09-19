"""Backend half of check_api_contract: every route a controller serves."""

import re
from pathlib import Path

CTRL = Path(__file__).resolve().parents[1] / "backend/include/controllers"
DEFINE = re.compile(r'#define\s+(\w+)\s+"([^"]*)"')
ADD = re.compile(
    r"ADD_METHOD_(TO|VIA_REGEX)\(\s*[\w:]+\s*,\s*"
    r'((?:[A-Za-z_]\w*|"[^"]*")(?:\s+(?:[A-Za-z_]\w*|"[^"]*"))*)'
    r"\s*,\s*drogon::(\w+)")
WS = re.compile(r'WS_PATH_ADD\(\s*"([^"]+)"')
PARAM = re.compile(r"\{[^/}]*\}")


def resolve(expr, defs):
    out = ""
    for tok in re.findall(r'"[^"]*"|\w+', expr):
        out += tok[1:-1] if tok[0] == '"' else defs.get(tok, "")
    return out


def to_regex(kind, path):
    if kind == "VIA_REGEX":
        return re.compile(path)
    parts = [re.escape(x) for x in PARAM.split(path)]
    return re.compile("[^/]+".join(parts))


def load(root=CTRL):
    """Return [(METHOD, path, compiled_regex)] for all controllers."""
    files = sorted(Path(root).rglob("*.h"))
    text = {f: f.read_text(encoding="utf-8") for f in files}
    defs = {}
    for src in text.values():
        defs.update(DEFINE.findall(src))
    routes = []
    for src in text.values():
        for kind, expr, verb in ADD.findall(src):
            path = resolve(expr, defs)
            routes.append((verb.upper(), path, to_regex(kind, path)))
        for path in WS.findall(src):
            routes.append(("GET", path, re.compile(re.escape(path))))
    return routes
