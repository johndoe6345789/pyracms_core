"""Source must not hide U+2028/2029, control bytes or a stray CR."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DIRS = ["frontend/src", "client/src", "scripts", "games", "docker",
        "backend/src", "backend/include"]
EXTS = {".ts", ".tsx", ".js", ".py", ".cpp", ".h", ".qml", ".sh", ".yml",
        ".json", ".md"}
SKIP = ("node_modules", "__pycache__", ".next")
BAD = re.compile("[" + "".join(map(chr, [0x2028, 0x2029, 0x200b, 0x200c, 0x200d,
                                          0x202a, 0x202e, 0x2060, 0xfeff])) +
                 "\\x00-\\x08\\x0b\\x0c\\x0e-\\x1f\\x7f]")


def sources():
    for d in DIRS:
        for f in (ROOT / d).rglob("*"):
            if f.is_file() and f.suffix in EXTS:
                if not any(s in f.as_posix() for s in SKIP):
                    yield f


def test_no_hidden_or_control_characters():
    hits = []
    for f in sources():
        text = f.read_bytes().decode("utf-8")  # also proves valid UTF-8
        text = text.replace("\r\n", "\n")
        for n, line in enumerate(text.split("\n"), 1):
            if BAD.search(line) or "\r" in line:
                hits.append(f"{f.relative_to(ROOT)}:{n}")
    assert not hits, hits
