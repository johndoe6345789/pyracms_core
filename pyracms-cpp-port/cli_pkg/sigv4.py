"""AWS Signature Version 4 for S3 (stdlib only): header auth + presign."""
import hashlib
import hmac
import time
from urllib.parse import quote, unquote

EMPTY_SHA = hashlib.sha256(b"").hexdigest()
ALGO = "AWS4-HMAC-SHA256"


def uri_encode(s, keep_slash=False):
    return quote(s, safe="/-_.~" if keep_slash else "-_.~")


def canonical_query(raw):
    """Decode, encode once, sort by name then value; bare key -> key=."""
    pairs = []
    for part in filter(None, raw.split("&")):
        k, _, v = part.partition("=")
        pairs.append((uri_encode(unquote(k)), uri_encode(unquote(v))))
    return "&".join(f"{k}={v}" for k, v in sorted(pairs))


def amz_now():
    return time.strftime("%Y%m%dT%H%M%SZ", time.gmtime())


def _hmac(key, msg):
    return hmac.new(key, msg.encode(), hashlib.sha256).digest()


def sign(key, method, path, query, headers, payload_sha, amzdate,
         presigned=False):
    """Returns (signature, authorization). `headers`: lower-case names
    (must hold host); x-amz-date/x-amz-content-sha256 are added unless
    presigned. `key` = (access, secret, region)."""
    access, secret, region = key
    h = dict(headers)
    if not presigned:
        h["x-amz-date"] = amzdate
        h["x-amz-content-sha256"] = payload_sha
    names = sorted(h)
    canon_h = "".join(f"{n}:{h[n].strip()}\n" for n in names)
    signed = ";".join(names)
    canon = "\n".join([method, uri_encode(unquote(path), True),
                       canonical_query(query), canon_h, signed,
                       payload_sha])
    day = amzdate[:8]
    scope = f"{day}/{region}/s3/aws4_request"
    to_sign = "\n".join([ALGO, amzdate, scope,
                         hashlib.sha256(canon.encode()).hexdigest()])
    k = _hmac(("AWS4" + secret).encode(), day)
    for part in (region, "s3", "aws4_request"):
        k = _hmac(k, part)
    sig = hmac.new(k, to_sign.encode(), hashlib.sha256).hexdigest()
    auth = (f"{ALGO} Credential={access}/{scope}, "
            f"SignedHeaders={signed}, Signature={sig}")
    return sig, auth
