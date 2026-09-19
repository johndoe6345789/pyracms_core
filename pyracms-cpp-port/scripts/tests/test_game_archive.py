import hashlib
import zipfile

from game_archive import build_zip, game_files


def make_game(root):
    g = root / "snake"
    (g / "tests").mkdir(parents=True)
    (g / "__pycache__").mkdir()
    (g / "sub").mkdir()
    files = {"main.py": b"a\r\nb\r\n", "game.json": b"{}",
             "requirements.txt": b"pygame\n", "sub/x.png": b"\r\n",
             "build.py": b"x", ".coveragerc": b"x", "pytest.ini": b"x",
             "tests/test_a.py": b"x", "__pycache__/m.pyc": b"x",
             "m.pyc": b"x"}
    for rel, data in files.items():
        (g / rel).write_bytes(data)
    return str(g)


def test_game_files_excludes_test_and_build_artifacts(tmp_path):
    assert game_files(make_game(tmp_path)) == [
        "game.json", "main.py", "requirements.txt", "sub/x.png"]


def test_zip_layout_modes_and_crlf(tmp_path):
    out = tmp_path / "o.zip"
    sha, size = build_zip(make_game(tmp_path), str(out), "snake")
    assert sha == hashlib.sha256(out.read_bytes()).hexdigest()
    assert size == out.stat().st_size
    with zipfile.ZipFile(out) as z:
        assert z.namelist() == ["snake/game.json", "snake/main.py",
                                "snake/requirements.txt", "snake/sub/x.png"]
        assert z.read("snake/main.py") == b"a\nb\n"
        assert z.read("snake/sub/x.png") == b"\r\n"  # binary untouched
        assert z.getinfo("snake/main.py").external_attr >> 16 == 0o100755
        assert z.getinfo("snake/game.json").external_attr >> 16 == 0o100644


def test_zip_is_deterministic(tmp_path):
    g = make_game(tmp_path)
    a = build_zip(g, str(tmp_path / "a.zip"), "snake")
    b = build_zip(g, str(tmp_path / "b.zip"), "snake")
    assert a == b
