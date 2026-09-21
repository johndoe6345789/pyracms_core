"""SigV4 signer vs the official AWS S3 documentation examples."""
import hashlib
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from cli_pkg import sigv4, sigv4_req  # noqa: E402

KEY = ("AKIAIOSFODNN7EXAMPLE", "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
       "us-east-1")
DATE = "20130524T000000Z"
HOST = {"host": "examplebucket.s3.amazonaws.com"}


def test_get_object_with_range():
    sig, auth = sigv4.sign(KEY, "GET", "/test.txt", "",
                           {**HOST, "range": "bytes=0-9"},
                           sigv4.EMPTY_SHA, DATE)
    assert sig == ("f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd910"
                   "39c6036bdb41")
    assert "SignedHeaders=host;range;x-amz-content-sha256;x-amz-date," in auth


def test_put_object():
    body = b"Welcome to Amazon S3."
    sha = hashlib.sha256(body).hexdigest()
    assert sha == ("44ce7dd67c959e0d3524ffac1771dfbba87d2b6b4b4e99e42034"
                   "a8b803f8b072")
    h = {**HOST, "date": "Fri, 24 May 2013 00:00:00 GMT",
         "x-amz-storage-class": "REDUCED_REDUNDANCY"}
    sig, _ = sigv4.sign(KEY, "PUT", "/test%24file.text", "", h, sha, DATE)
    assert sig == ("98ad721746da40c64f1a55b78f14c238d841ea1380cd77a1b597"
                   "1af0ece108bd")


def test_get_bucket_lifecycle():
    sig, _ = sigv4.sign(KEY, "GET", "/", "lifecycle", HOST,
                        sigv4.EMPTY_SHA, DATE)
    assert sig == ("fea454ca298b7da1c68078a5d1bdbfbbe0d65c699e0f91ac7a20"
                   "0a0136783543")


def test_list_bucket_query_order_is_irrelevant():
    for q in ("max-keys=2&prefix=J", "prefix=J&max-keys=2"):
        sig, _ = sigv4.sign(KEY, "GET", "/", q, HOST, sigv4.EMPTY_SHA, DATE)
        assert sig == ("34b48302e7b5fa45bde8084f4b7868a86f0a534bc59db667"
                       "0ed5711ef69dc6f7")


def test_presigned_get_matches_aws_example():
    url = sigv4_req.presign_get(
        KEY, "https://examplebucket.s3.amazonaws.com/test.txt", 86400, DATE)
    assert url.endswith("&X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835"
                        "f995330da4c265957d157751f604d404")
    assert "X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1" \
        "%2Fs3%2Faws4_request" in url


def test_canonical_query_and_host():
    assert sigv4.canonical_query("uploads") == "uploads="
    assert sigv4.canonical_query("uploadId=U%2B1&partNumber=2") == \
        "partNumber=2&uploadId=U%2B1"
    assert sigv4_req.host_header("http://s:9000/b") == "s:9000"
    assert sigv4_req.host_header("http://s:80/b") == "s"
    assert sigv4_req.host_header("https://s:443") == "s"


def test_signed_headers_hash_the_body():
    h = sigv4_req.signed_headers(KEY, "PUT", "http://s:9000/b/k?x=1", b"hi")
    assert h["x-amz-content-sha256"] == hashlib.sha256(b"hi").hexdigest()
    assert h["Host"] == "s:9000"
    assert h["Authorization"].startswith(
        "AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/")
