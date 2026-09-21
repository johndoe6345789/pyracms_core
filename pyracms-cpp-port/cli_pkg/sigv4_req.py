"""SigV4 for whole requests: headers for a URL, presigned GET URLs."""
import hashlib
from urllib.parse import unquote, urlsplit

from .sigv4 import ALGO, EMPTY_SHA, amz_now, sign, uri_encode


def host_header(url):
    """Host as the HTTP client sends it: default port dropped."""
    u = urlsplit(url)
    default = {"http": 80, "https": 443}.get(u.scheme)
    return u.netloc if u.port != default or u.port is None \
        else u.hostname


def signed_headers(key, method, url, body=b"", amzdate=None):
    """Headers (Host, x-amz-*, Authorization) for one request to `url`."""
    u = urlsplit(url)
    date = amzdate or amz_now()
    sha = hashlib.sha256(body).hexdigest() if body else EMPTY_SHA
    host = host_header(url)
    _, auth = sign(key, method, u.path or "/", u.query,
                   {"host": host}, sha, date)
    return {"Host": host, "x-amz-date": date,
            "x-amz-content-sha256": sha, "Authorization": auth}


def presign_get(key, url, expires=300, amzdate=None):
    """Presigned GET URL (query auth) for `url`."""
    u = urlsplit(url)
    date = amzdate or amz_now()
    scope = f"{date[:8]}/{key[2]}/s3/aws4_request"
    q = (f"X-Amz-Algorithm={ALGO}&X-Amz-Credential="
         f"{uri_encode(key[0] + '/' + scope)}&X-Amz-Date={date}"
         f"&X-Amz-Expires={expires}&X-Amz-SignedHeaders=host")
    sig, _ = sign(key, "GET", u.path or "/", q,
                  {"host": host_header(url)}, "UNSIGNED-PAYLOAD", date,
                  presigned=True)
    path = uri_encode(unquote(u.path or "/"), True)
    return f"{u.scheme}://{u.netloc}{path}?{q}&X-Amz-Signature={sig}"
