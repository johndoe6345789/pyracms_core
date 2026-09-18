import lint_cpp


def setup(tmp_path, monkeypatch, text):
    src = tmp_path / "backend" / "src"
    src.mkdir(parents=True, exist_ok=True)
    (src / "a.cpp").write_text(text)
    (src / "notes.txt").write_text("x" * 500)
    monkeypatch.setattr(lint_cpp, "ROOT", tmp_path)
    monkeypatch.setattr(lint_cpp, "PATHS", [src, tmp_path / "missing"])


def test_clean_file_passes(tmp_path, monkeypatch, capsys):
    setup(tmp_path, monkeypatch, "int x;\n")
    assert lint_cpp.main() == 0
    assert "passed" in capsys.readouterr().out


def test_long_line_is_an_error(tmp_path, monkeypatch, capsys):
    setup(tmp_path, monkeypatch, "x" * 81 + "\n")
    assert lint_cpp.main() == 1
    assert "81 columns" in capsys.readouterr().err


def test_soft_and_hard_line_limits(tmp_path, monkeypatch, capsys):
    setup(tmp_path, monkeypatch, "int x;\n" * 100)
    assert lint_cpp.main() == 0
    assert "soft target" in capsys.readouterr().out
    setup(tmp_path, monkeypatch, "int x;\n" * 200)
    assert lint_cpp.main() == 1
