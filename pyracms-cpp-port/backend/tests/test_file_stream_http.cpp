#include "chunked_fixture.h"

using namespace harness;

// A 2.5 MiB file uploaded in parts, then downloaded through the streaming
// path (STREAM_MIN_MB=0 makes every stored file take it).
TEST(FileStreamHttp, FullAndRangedDownloadsArePiped) {
    REQUIRE_SERVER();
    Chunked c;
    setenv("STREAM_MIN_MB", "0", 1);
    std::string data;
    for (size_t i = 0; i < (5u << 19); ++i)
        data += static_cast<char>(i % 251);
    auto id = c.begin("big.bin", data.size()).json["uploadId"].asString();
    for (int n = 1; n <= 3; ++n)
        ASSERT_EQ(putRaw(Chunked::part(id, n),
                         data.substr((n - 1) << 20, 1 << 20), c.tok())
                      .status, 200);
    auto uuid = post("/api/files/uploads/" + id + "/complete", J({}), c.tok())
                    .json["uuid"].asString();
    auto full = get("/api/files/" + uuid);
    EXPECT_EQ(full.status, 200);
    EXPECT_EQ(full.text.size(), data.size());
    EXPECT_TRUE(full.text == data);
    EXPECT_EQ(full.headers["accept-ranges"], "bytes");
    auto r = get("/api/files/" + uuid, "", {{"Range", "bytes=1000-1999"}});
    EXPECT_EQ(r.status, 206);
    EXPECT_EQ(r.text, data.substr(1000, 1000));
    EXPECT_EQ(r.headers["content-range"],
              "bytes 1000-1999/" + std::to_string(data.size()));
    auto tail = get("/api/files/" + uuid, "", {{"Range", "bytes=-10"}});
    EXPECT_EQ(tail.text, data.substr(data.size() - 10));
    EXPECT_EQ(get("/api/files/" + uuid, "",
                  {{"Range", "bytes=99999999-"}}).status, 416);
    EXPECT_EQ(get("/api/files/" + uuid, "",
                  {{"If-None-Match", full.headers["etag"]}}).status, 304);
    unsetenv("STREAM_MIN_MB");
}
