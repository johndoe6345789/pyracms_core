#include "chunked_fixture.h"

using namespace harness;

TEST(FileChunkedHttp, ThreePartsBecomeOneVerifiedS3File) {
    REQUIRE_SERVER();
    Chunked c;
    std::string data = kMiB + std::string(1 << 20, 'b') + "tail";
    auto b = c.begin("game.bin", data.size(), sha256Of(data));
    ASSERT_EQ(b.status, 200) << b.text;
    EXPECT_EQ(b.json["partSize"].asUInt64(), 1u << 20);
    EXPECT_EQ(b.json["maxParts"].asInt(), 3);
    auto id = b.json["uploadId"].asString();
    for (int n = 1; n <= 3; ++n) {
        auto chunk = data.substr((n - 1) << 20, 1 << 20);
        EXPECT_EQ(putRaw(Chunked::part(id, n), chunk, c.tok()).status, 200);
    }
    auto done = post("/api/files/uploads/" + id + "/complete", J({}), c.tok());
    ASSERT_EQ(done.status, 200) << done.text;
    EXPECT_EQ(done.json["sha256"].asString(), sha256Of(data));
    EXPECT_EQ(done.json["size"].asInt64(), (int64_t)data.size());
    auto uuid = done.json["uuid"].asString();
    EXPECT_EQ(storageOf(uuid), "s3");
    EXPECT_EQ(FakeS3::objects()[s3Key(uuid)], data);
    EXPECT_EQ(FakeS3::openUploads(), 0);
    EXPECT_EQ(get("/api/files/" + uuid).text, data);
}

TEST(FileChunkedHttp, ShaMismatchAndSizeMismatchCleanUp) {
    REQUIRE_SERVER();
    Chunked c;
    auto id = c.begin("a.bin", 5, sha256Of("other")).json["uploadId"];
    EXPECT_EQ(putRaw(Chunked::part(id.asString(), 1), "hello", c.tok())
                  .status, 200);
    EXPECT_EQ(post("/api/files/uploads/" + id.asString() + "/complete",
                   J({}), c.tok()).status, 400);
    EXPECT_EQ(FakeS3::openUploads(), 0);
    EXPECT_TRUE(FakeS3::objects().empty());
    auto id2 = c.begin("b.bin", 9).json["uploadId"].asString();
    putRaw(Chunked::part(id2, 1), "hello", c.tok());
    EXPECT_EQ(post("/api/files/uploads/" + id2 + "/complete", J({}),
                   c.tok()).status, 400);
    EXPECT_EQ(FakeS3::openUploads(), 0);
}

