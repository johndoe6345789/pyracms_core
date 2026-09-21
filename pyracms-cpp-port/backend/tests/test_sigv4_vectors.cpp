#include "sigv4_vectors.h"

using namespace pyracms;
using namespace sigv4test;

// Signatures below are copied from "Signature Calculations for the
// Authorization Header" in the AWS S3 documentation.
TEST(SigV4Vectors, GetObjectWithRange) {
    auto r = awsReq("GET", "/test.txt", "");
    r.headers["range"] = "bytes=0-9";
    std::string auth;
    EXPECT_EQ(sigv4Sign(awsKey(), r, &auth),
              "f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036"
              "bdb41");
    EXPECT_EQ(auth,
              "AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/"
              "us-east-1/s3/aws4_request, SignedHeaders=host;range;"
              "x-amz-content-sha256;x-amz-date, Signature=f0e8bdb87c964420e"
              "857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41");
}

TEST(SigV4Vectors, PutObject) {
    auto r = awsReq("PUT", "/test%24file.text", "");
    r.payloadSha = sha256Hex("Welcome to Amazon S3.");
    EXPECT_EQ(r.payloadSha,
              "44ce7dd67c959e0d3524ffac1771dfbba87d2b6b4b4e99e42034a8b803f"
              "8b072");
    r.headers["date"] = "Fri, 24 May 2013 00:00:00 GMT";
    r.headers["x-amz-storage-class"] = "REDUCED_REDUNDANCY";
    EXPECT_EQ(sigv4Sign(awsKey(), r),
              "98ad721746da40c64f1a55b78f14c238d841ea1380cd77a1b5971af0ece"
              "108bd");
}

TEST(SigV4Vectors, GetBucketLifecycle) {
    EXPECT_EQ(sigv4Sign(awsKey(), awsReq("GET", "/", "lifecycle")),
              "fea454ca298b7da1c68078a5d1bdbfbbe0d65c699e0f91ac7a200a01367"
              "83543");
}

TEST(SigV4Vectors, ListBucketWithQuery) {
    EXPECT_EQ(sigv4Sign(awsKey(), awsReq("GET", "/", "max-keys=2&prefix=J")),
              "34b48302e7b5fa45bde8084f4b7868a86f0a534bc59db6670ed5711ef69"
              "dc6f7");
    // Parameter order on the wire does not matter.
    EXPECT_EQ(sigv4Sign(awsKey(), awsReq("GET", "/", "prefix=J&max-keys=2")),
              "34b48302e7b5fa45bde8084f4b7868a86f0a534bc59db6670ed5711ef69"
              "dc6f7");
}
