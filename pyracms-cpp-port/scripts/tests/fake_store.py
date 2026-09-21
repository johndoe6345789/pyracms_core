"""In-process fake object store (http.server) and fake files table."""
import hashlib
import http.server
import threading
from urllib.parse import parse_qs, urlparse


class State:
    def __init__(self):
        self.objects, self.parts, self.log = {}, {}, []
        self.fail_part = False


def handler(st):
    class H(http.server.BaseHTTPRequestHandler):
        def log_message(self, *a):
            pass

        def reply(self, code, body=b"", headers=()):
            self.send_response(code)
            self.send_header("Content-Length", str(len(body)))
            for k, v in headers:
                self.send_header(k, v)
            self.end_headers()
            self.wfile.write(body)

        def do(self, method):
            u = urlparse(self.path)
            q = parse_qs(u.query, keep_blank_values=True)
            n = int(self.headers.get("Content-Length") or 0)
            body = self.rfile.read(n) if n else b""
            key = u.path.split("/", 2)[2] if u.path.count("/") > 1 else ""
            st.log.append((method, key, u.query))
            return method, key, q, body

        def do_PUT(self):
            m, key, q, body = self.do("PUT")
            if "partNumber" in q:
                if st.fail_part:
                    return self.reply(500)
                st.parts.setdefault(q["uploadId"][0], []).append(body)
                md5 = hashlib.md5(body).hexdigest()
                return self.reply(200, headers=[("ETag", f'"{md5}"')])
            if key:
                st.objects[key] = body
            self.reply(200 if key else 409)

        def do_POST(self):
            m, key, q, body = self.do("POST")
            if "uploads" in q:
                xml = b"<InitiateMultipartUploadResult><UploadId>U1" \
                      b"</UploadId></InitiateMultipartUploadResult>"
                return self.reply(200, xml)
            st.objects[key] = b"".join(st.parts.pop(q["uploadId"][0]))
            self.reply(200, b"<Complete/>")

        def do_DELETE(self):
            m, key, q, _ = self.do("DELETE")
            st.parts.pop(q["uploadId"][0], None)
            self.reply(204)

        def do_GET(self):
            m, key, q, _ = self.do("GET")
            if key in st.objects:
                return self.reply(200, st.objects[key])
            self.reply(404)
    return H


def start():
    st = State()
    srv = http.server.HTTPServer(("127.0.0.1", 0), handler(st))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return st, srv, f"http://127.0.0.1:{srv.server_port}"


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
