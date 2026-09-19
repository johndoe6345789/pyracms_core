#include "gamedep_public_support.h"
#include "s3_mode.h"

using namespace harness;

// Range/ETag work the same when the bytes come from the object store.
TEST(FileS3Range, PublicGameBinaryResumesFromS3) {
    REQUIRE_SERVER();
    auto s = makeSite();
    S3Mode mode;
    auto g = mkPublicGd(s.admin.token, false, true);
    auto url = "/api/files/" + g.bin;
    auto full = get(url);
    ASSERT_EQ(full.status, 200);
    EXPECT_EQ(full.text, kBin);
    auto part = get(url, "", {{"Range", "bytes=300-"}});
    EXPECT_EQ(part.status, 206);
    EXPECT_EQ(part.text, "END");
    EXPECT_EQ(part.headers["content-range"], "bytes 300-302/303");
    EXPECT_EQ(get(url, "", {{"Range", "bytes=500-"}}).status, 416);
    EXPECT_EQ(get(url, "", {{"If-None-Match", full.headers["etag"]}}).status,
              304);
    auto priv = mkPublicGd(s.admin.token, true, true);
    EXPECT_EQ(get("/api/files/" + priv.bin).status, 404);
}
