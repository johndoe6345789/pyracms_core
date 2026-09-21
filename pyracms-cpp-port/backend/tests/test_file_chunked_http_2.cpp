#include "chunked_fixture.h"

using namespace harness;

TEST(FileChunkedHttp, OrderRetriesOwnerAbortAndLimits) {
    REQUIRE_SERVER();
    Chunked c;
    auto id = c.begin("a.bin", 10).json["uploadId"].asString();
    EXPECT_EQ(putRaw(Chunked::part(id, 2), "x", c.tok()).status, 409);
    auto first = putRaw(Chunked::part(id, 1), "12345", c.tok());
    EXPECT_EQ(first.status, 200);
    auto again = putRaw(Chunked::part(id, 1), "12345", c.tok());
    EXPECT_EQ(again.json["etag"], first.json["etag"]);
    EXPECT_EQ(putRaw(Chunked::part(id, 1), "12346", c.tok()).status, 200);
    EXPECT_EQ(putRaw(Chunked::part(id, 2), "123456", c.tok()).status, 400);
    EXPECT_EQ(putRaw(Chunked::part(id, 1), kMiB + "z", c.tok()).status, 413);
    EXPECT_EQ(putRaw(Chunked::part(id, 1), "x", "").status, 401);
    auto other = makeSite();
    EXPECT_EQ(putRaw(Chunked::part(id, 2), "x", other.user.token).status, 404);
    EXPECT_EQ(del("/api/files/uploads/" + id, other.user.token).status, 404);
    EXPECT_EQ(del("/api/files/uploads/" + id, c.tok()).status, 200);
    EXPECT_EQ(FakeS3::openUploads(), 0);
    EXPECT_EQ(c.begin("a.bin", 2000ull << 20).status, 413);
    EXPECT_EQ(c.begin("p.png", 4).status, 200);
    EXPECT_EQ(putRaw(Chunked::part(c.begin("p.png", 4).json["uploadId"]
                                       .asString(), 1), "nope", c.tok())
                  .status, 415);
}
