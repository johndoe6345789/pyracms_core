#include "sigv4_vectors.h"
#include "storage/S3Sign.h"

using namespace pyracms;
using namespace sigv4test;

TEST(SigV4Util, Sha256AndHmac) {
    EXPECT_EQ(sha256Hex(""),
              "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b785"
              "2b855");
    EXPECT_EQ(toHex(hmacSha256("key", "The quick brown fox jumps over the "
                                      "lazy dog")),
              "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1"
              "a3cd8");
}

TEST(SigV4Util, UriEncodeOnce) {
    EXPECT_EQ(sigv4UriEncode("a b/c$~-_.", true), "a%20b/c%24~-_.");
    EXPECT_EQ(sigv4UriEncode("a/b", false), "a%2Fb");
    EXPECT_EQ(sigv4UriEncode("\xc3\xa9", true), "%C3%A9");
}

TEST(SigV4Util, CanonicalQuery) {
    EXPECT_EQ(sigv4CanonicalQuery(""), "");
    EXPECT_EQ(sigv4CanonicalQuery("uploads"), "uploads=");
    EXPECT_EQ(sigv4CanonicalQuery("uploadId=U%2B1&partNumber=2"),
              "partNumber=2&uploadId=U%2B1");
    EXPECT_EQ(sigv4CanonicalQuery("b=2&a=z&a=b"), "a=b&a=z&b=2");
    EXPECT_EQ(sigv4CanonicalQuery("k=a+b"), "k=a%2Bb");
}

TEST(SigV4Util, HostHeaderDropsDefaultPort) {
    auto h = [](const char *e) { return s3HostHeader(parseS3Endpoint(e)); };
    EXPECT_EQ(h("http://store:9000"), "store:9000");
    EXPECT_EQ(h("http://store:80"), "store");
    EXPECT_EQ(h("https://store:443/p"), "store");
    EXPECT_EQ(h("https://store:80"), "store:80");
}

TEST(SigV4Util, PresignedGetMatchesAwsExample) {
    StorageConfig c;
    c.accessKey = awsKey().access;
    c.secretKey = awsKey().secret;
    auto url = s3PresignedGetUrl(
        c, parseS3Endpoint("https://examplebucket.s3.amazonaws.com"),
        "/test.txt", 86400, "20130524T000000Z");
    EXPECT_EQ(url,
              "https://examplebucket.s3.amazonaws.com/test.txt?X-Amz-"
              "Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EX"
              "AMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date"
              "=20130524T000000Z&X-Amz-Expires=86400&X-Amz-SignedHeaders="
              "host&X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f99533"
              "0da4c265957d157751f604d404");
}

TEST(SigV4Util, SignedHeadersCarryPayloadHash) {
    StorageConfig c;
    c.accessKey = "a";
    c.secretKey = "s";
    auto ep = parseS3Endpoint("http://store:9000");
    auto h = s3SignedHeaders(c, ep, "PUT", "/b/k?partNumber=1", "hello");
    std::map<std::string, std::string> m(h.begin(), h.end());
    EXPECT_EQ(m["x-amz-content-sha256"], sha256Hex("hello"));
    EXPECT_EQ(m["Host"], "store:9000");
    EXPECT_EQ(m["Authorization"].rfind("AWS4-HMAC-SHA256 Credential=a/", 0),
              0u);
    EXPECT_NE(m["Authorization"].find("SignedHeaders=host;x-amz-content-"
                                      "sha256;x-amz-date,"),
              std::string::npos);
}
