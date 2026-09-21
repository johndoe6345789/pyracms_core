"""Server-side SigV4 check for the in-process fake store."""
import hashlib
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from cli_pkg import sigv4  # noqa: E402

KEY = ("a", "s", "us-east-1")  # what the tests' Store is built with


def valid(headers, method, path, query, body):
    """True when the request carries a correct SigV4 header signature."""
    auth = headers.get("Authorization", "")
    if not auth.startswith(sigv4.ALGO + " Credential=a/"):
        return False
    names = auth.split("SignedHeaders=")[1].split(",")[0].split(";")
    hdrs = {n: headers.get(n, "") for n in names
            if not n.startswith("x-amz-")}
    date = headers.get("x-amz-date", "")
    sha = headers.get("x-amz-content-sha256", "")
    _, want = sigv4.sign(KEY, method, path, query, hdrs, sha, date)
    return want == auth and sha == hashlib.sha256(body).hexdigest()
