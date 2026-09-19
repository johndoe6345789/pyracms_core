#include "gamedep_public_support.h"

#include <chrono>
#include <thread>

using namespace harness;

TEST(GamedepPublicFiles, OnlyPublicGameFilesOpenToAnonymous) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto o = s.admin.token;
    auto pub = mkPublicGd(o, false, true);
    for (const auto &u : {pub.bin, pub.src, pub.shot}) {
        EXPECT_EQ(get("/api/files/" + u).status, 200) << u;
        EXPECT_EQ(get("/api/files/" + u + "/thumbnail").status, 200) << u;
    }
    EXPECT_EQ(get("/api/files/" + pub.bin).text, kBin);
    auto priv = mkPublicGd(o, true, true);
    auto draft = mkPublicGd(o, false, false);
    for (const auto &g : {priv, draft}) {
        for (const auto &u : {g.bin, g.src, g.shot}) {
            EXPECT_EQ(get("/api/files/" + u).status, 404) << u;
            EXPECT_EQ(get("/api/files/" + u + "/thumbnail").status, 404);
            EXPECT_EQ(get("/api/files/" + u, s.user.token).status, 404);
            EXPECT_EQ(get("/api/files/" + u, o).status, 200);
        }
    }
    // A token of another site gains nothing over an anonymous caller.
    auto other = makeSite();
    EXPECT_EQ(get("/api/files/" + priv.bin, other.admin.token).status, 404);
    // Files outside the game catalog keep their uuid-capability rules.
    auto plain = uploadBytes(o, "n.txt", "note");
    EXPECT_EQ(get("/api/files/" + plain).status, 200);
    EXPECT_EQ(get("/api/files/..%2Fetc%2Fpasswd").status, 404);
}

TEST(GamedepPublicFiles, RangeResumeEtagAndLength) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto g = mkPublicGd(s.admin.token, false, true);
    auto url = "/api/files/" + g.bin;
    auto full = get(url);
    ASSERT_EQ(full.status, 200);
    EXPECT_EQ(full.headers["accept-ranges"], "bytes");
    EXPECT_EQ(full.headers["content-length"], "303");
    auto etag = full.headers["etag"];
    EXPECT_GE(etag.size(), 10u);
    auto part = get(url, "", {{"Range", "bytes=300-"}});
    EXPECT_EQ(part.status, 206);
    EXPECT_EQ(part.text, "END");
    EXPECT_EQ(part.headers["content-range"], "bytes 300-302/303");
    EXPECT_EQ(part.headers["content-length"], "3");
    EXPECT_EQ(get(url, "", {{"Range", "bytes=-3"}}).text, "END");
    EXPECT_EQ(get(url, "", {{"Range", "bytes=0-9"}}).text.size(), 10u);
    auto bad = get(url, "", {{"Range", "bytes=999-"}});
    EXPECT_EQ(bad.status, 416);
    EXPECT_EQ(bad.headers["content-range"], "bytes */303");
    EXPECT_EQ(get(url, "", {{"Range", "bytes=0-1,5-6"}}).status, 200);
    EXPECT_EQ(get(url, "", {{"Range", "junk"}}).status, 200);
    EXPECT_EQ(get(url, "", {{"If-None-Match", etag}}).status, 304);
    EXPECT_EQ(get(url, "", {{"Range", "bytes=300-"}, {"If-Range", etag}})
                  .status, 206);
    EXPECT_EQ(get(url, "", {{"Range", "bytes=300-"},
                            {"If-Range", "\"stale\""}}).status, 200);
}

TEST(GamedepPublicFiles, ResumedDownloadsAreNotRecounted) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto g = mkPublicGd(s.admin.token, false, true);
    auto count = [&] {
        return testDb()->execSqlSync("SELECT download_count AS c FROM "
                                     "files WHERE uuid = $1", g.bin)[0]["c"]
            .as<int>();
    };
    get("/api/files/" + g.bin);
    get("/api/files/" + g.bin, "", {{"Range", "bytes=100-"}});
    std::this_thread::sleep_for(std::chrono::milliseconds(200));
    EXPECT_EQ(count(), 1);
}
