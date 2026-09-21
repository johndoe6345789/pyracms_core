"""SQL for `user set-password`, kept apart so it can be tested on its own."""
import re

# Same alphabet the backend accepts for usernames and site slugs; nothing
# here can carry a quote, so the values are safe inside SQL literals.
NAME = re.compile(r"^[A-Za-z0-9_.@+-]{1,128}$")


def _lit(value):
    return "'" + value.replace("'", "''") + "'"


def set_password_sql(username, tenant, pw_hash):
    """Sets the hash, ends older sessions, spends open reset tokens.

    Mirrors AuthController::applyReset. `tenant` None means a platform
    account (users.tenant_id IS NULL); a slug that does not exist matches
    nobody rather than falling back to the platform. Prints the row count.
    """
    if not NAME.match(username) or (tenant and not NAME.match(tenant)):
        raise ValueError("username and site may only use letters, digits "
                         "and _ . @ + -")
    if tenant is None:
        scope = "tenant_id IS NULL"
    else:
        scope = (f"tenant_id = (SELECT id FROM tenants "
                 f"WHERE slug = {_lit(tenant)})")
    return (
        "WITH u AS (\n"
        f"  UPDATE users SET password_hash = {_lit(pw_hash)},\n"
        "    token_valid_after = NOW()\n"
        f"  WHERE username = {_lit(username)} AND {scope}\n"
        "  RETURNING id),\n"
        "b AS (\n"
        "  UPDATE password_reset_tokens SET used = TRUE\n"
        "  WHERE user_id IN (SELECT id FROM u))\n"
        "SELECT count(*) FROM u;\n"
    )
