"""In-process fake object store (http.server) and fake files table."""
import hashlib
import http.server
import threading

from fake_http import base


class State:
    def __init__(self):
        self.objects, self.parts, self.log = {}, {}, []
        self.denied = 0
        self.fail_part = False


def handler(st):
    class H(base(st)):
        def do_PUT(self):
            m, key, q, body = self.do("PUT")
            if key is None:
                return
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
            if key is None:
                return
            if "uploads" in q:
                xml = b"<InitiateMultipartUploadResult><UploadId>U1" \
                      b"</UploadId></InitiateMultipartUploadResult>"
                return self.reply(200, xml)
            st.objects[key] = b"".join(st.parts.pop(q["uploadId"][0]))
            self.reply(200, b"<Complete/>")

        def do_DELETE(self):
            m, key, q, _ = self.do("DELETE")
            if key is None:
                return
            st.parts.pop(q["uploadId"][0], None)
            self.reply(204)

        def do_GET(self):
            m, key, q, _ = self.do("GET")
            if key is None:
                return
            if key in st.objects:
                return self.reply(200, st.objects[key])
            self.reply(404)
    return H


def start():
    st = State()
    srv = http.server.HTTPServer(("127.0.0.1", 0), handler(st))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return st, srv, f"http://127.0.0.1:{srv.server_port}"
