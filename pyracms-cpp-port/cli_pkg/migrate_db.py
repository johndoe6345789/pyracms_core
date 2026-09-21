"""`files` table access for migrate-storage, through psql."""
import os
import subprocess

SEP = "|"
ROWS = ("SELECT uuid, COALESCE(tenant_id,0), COALESCE(sha256,''), size "
        "FROM files WHERE storage='local' ORDER BY id")


def psql(sql, db_env):
    r = subprocess.run(
        ["psql", "-X", "-q", "-t", "-A", "-F", SEP, "-v",
         "ON_ERROR_STOP=1", "-c", sql],
        env={**os.environ, **db_env}, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"psql failed: {r.stderr.strip()}")
    return r.stdout


def local_rows(db_env):
    rows = []
    for line in psql(ROWS, db_env).splitlines():
        uuid, tenant, sha, size = line.split(SEP)
        if uuid and not set(uuid) - set("0123456789abcdefABCDEF-"):
            rows.append((uuid, int(tenant), sha.lower(), int(size)))
    return rows


def mark_s3(uuid, db_env):
    # uuid comes from local_rows(), which only passes [0-9a-f-].
    psql(f"UPDATE files SET storage='s3' "
         f"WHERE uuid='{uuid}' AND storage='local'", db_env)
