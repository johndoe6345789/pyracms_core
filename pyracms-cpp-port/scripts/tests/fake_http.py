"""Request plumbing of the fake store: SigV4 check, reply helper."""
import http.server
from urllib.parse import parse_qs, urlparse

from fake_sigv4 import valid


def base(st):
    class Base(http.server.BaseHTTPRequestHandler):
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
            if not valid(self.headers, method, u.path, u.query, body):
                st.denied += 1
                self.reply(403)
                return method, None, q, body
            key = u.path.split("/", 2)[2] if u.path.count("/") > 1 else ""
            st.log.append((method, key, u.query))
            return method, key, q, body
    return Base
