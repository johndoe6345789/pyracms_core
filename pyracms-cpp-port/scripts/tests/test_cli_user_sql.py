import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from cli_pkg.user_sql import set_password_sql  # noqa: E402

H = "00" * 16 + ":" + "ab" * 32


def test_platform_account_matches_null_tenant_only():
    sql = set_password_sql("alice", None, H)
    assert "tenant_id IS NULL" in sql
    assert "tenants" not in sql
    assert f"password_hash = '{H}'" in sql
    assert "username = 'alice'" in sql


def test_site_account_resolves_slug_without_platform_fallback():
    sql = set_password_sql("claudedemo", "claude", H)
    assert "tenant_id = (SELECT id FROM tenants WHERE slug = 'claude')" in sql
    assert "IS NULL" not in sql
    assert "COALESCE" not in sql


def test_ends_sessions_and_spends_reset_tokens():
    sql = set_password_sql("alice", None, H)
    assert "token_valid_after = NOW()" in sql
    assert "UPDATE password_reset_tokens SET used = TRUE" in sql
    assert sql.rstrip().endswith("SELECT count(*) FROM u;")


@pytest.mark.parametrize("name", ["", "a'b", "a b", "a;b", "a\nb", "x" * 129])
def test_rejects_unsafe_usernames(name):
    with pytest.raises(ValueError):
        set_password_sql(name, None, H)


def test_rejects_unsafe_site_slug():
    with pytest.raises(ValueError):
        set_password_sql("alice", "x'; DROP TABLE users;--", H)
