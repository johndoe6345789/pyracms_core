"""Fake files table for migrate-storage tests."""


class FakeDb:
    """Stands in for migrate_db.psql; rows: uuid -> [tenant, sha, size]."""

    def __init__(self, rows):
        self.rows, self.storage, self.sql = rows, {}, []

    def __call__(self, sql, db_env):
        self.sql.append(sql)
        if sql.startswith("UPDATE"):
            self.storage[sql.split("uuid='")[1].split("'")[0]] = "s3"
            return ""
        return "".join(f"{u}|{t}|{s}|{n}\n" for u, (t, s, n)
                       in self.rows.items() if u not in self.storage)
