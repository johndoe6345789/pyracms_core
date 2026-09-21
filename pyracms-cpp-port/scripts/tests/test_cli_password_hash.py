import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from cli_pkg import password_hash as ph  # noqa: E402


def test_backend_parameters_are_pinned():
    # Must equal AuthServiceInternal.h; changing one breaks every login.
    assert (ph.SALT_LEN, ph.HASH_LEN, ph.ITERATIONS) == (16, 32, 100000)
    assert ph.MAX_LEN == 256


def test_format_is_lowercase_salt_colon_hash():
    stored = ph.hash_password("correct horse")
    assert re.fullmatch(r"[0-9a-f]{32}:[0-9a-f]{64}", stored)


def test_round_trip_and_wrong_password():
    stored = ph.hash_password("correct horse")
    assert ph.verify_password("correct horse", stored)
    assert not ph.verify_password("correct horsf", stored)


def test_salt_is_random_per_call():
    assert ph.hash_password("same") != ph.hash_password("same")


def test_fixed_salt_is_deterministic():
    salt = bytes(range(16))
    assert ph.hash_password("x", salt) == ph.hash_password("x", salt)
    assert ph.hash_password("x", salt).startswith(salt.hex() + ":")


def test_verify_rejects_malformed_hashes():
    for bad in ["", "nocolon", "zz:00", "00:00", "00" * 16 + ":"]:
        assert not ph.verify_password("x", bad)


def test_length_rules_count_bytes():
    assert ph.length_problem("1234567")
    assert ph.length_problem("12345678") is None
    assert ph.length_problem("a" * 256) is None
    assert ph.length_problem("a" * 257)
    assert ph.length_problem("é" * 129)  # 258 bytes
