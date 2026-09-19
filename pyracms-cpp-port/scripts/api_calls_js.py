"""API calls found in ts/tsx source (axios, RTK Query, fetch)."""

import re

from api_paths import normalise

LIT = re.compile(r"""(['"`])((?:\$\{[^}]*\})?/api/[^'"`\n]*)\1""")
RTK = re.compile(r"""(?:\burl:|=>)\s*(['"`])(/(?!api/)[^'"`\n]*)\1""")
BASE = re.compile(r"const (\w+)\s*=\s*`(/api/[^`]*)`")
USE = re.compile(r"`\$\{(\w+)\}(/[^`\n]*)`")
VERB = re.compile(r"\.(get|post|put|patch|delete)\(\s*[\w.$()]*\s*\+?\s*$")


def verb_at(src, start, end):
    before = src[max(0, start - 70):start].split(";")[-1]
    m = VERB.search(before)
    if m:
        return m.group(1).upper()
    after = src[end:end + 90].split(";")[0]
    m = re.search(r"method:\s*['\"](\w+)['\"]", after)
    return m.group(1).upper() if m else None


def js_calls(path):
    src = path.read_text(encoding="utf-8")
    for m in LIT.finditer(src):
        raw = m.group(2)
        if src[m.end():m.end() + 3].strip().startswith("+"):
            raw += "{}"
        if raw.endswith("/") and "{}" not in raw:
            continue  # a prefix test such as url.includes('/api/auth/')
        yield verb_at(src, m.start(), m.end()), normalise(raw), m.start()
    bases = dict(BASE.findall(src))
    for m in USE.finditer(src):
        if m.group(1) in bases:
            raw = bases[m.group(1)].split("?")[0] + m.group(2)
            yield verb_at(src, m.start(), m.end()), normalise(raw), m.start()
    rtk = "store/endpoints" in path.as_posix()
    for m in RTK.finditer(src if rtk else ""):
        yield verb_at(src, m.start(), m.end()), normalise(m.group(2)), m.start()
