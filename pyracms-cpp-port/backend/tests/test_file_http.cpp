#include "http_accounts.h"

using namespace harness;

TEST(FileHttp, UploadDownloadThumbnailListRemove) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto u = s.user.token;
    EXPECT_EQ(upload("/api/files", "", "a.txt", "x").status, 401);
    auto up = upload("/api/files", u, "pic.png", "not-really-a-png");
    ASSERT_EQ(up.status, 200) << up.text;
    auto uuid = up.json["uuid"].asString();
    EXPECT_EQ(up.json["size"].asInt(), 16);
    EXPECT_EQ(up.json["sha256"].asString().size(), 64u);
    auto dl = get("/api/files/" + uuid);
    EXPECT_EQ(dl.status, 200);
    EXPECT_EQ(dl.text, "not-really-a-png");
    EXPECT_EQ(get("/api/files/" + uuid + "/thumbnail").status, 200);
    EXPECT_EQ(get("/api/files/none-" + uuid).status, 404);
    EXPECT_EQ(get("/api/files/none-" + uuid + "/thumbnail").status, 404);
    auto list = get("/api/files?limit=500&offset=0", u);
    ASSERT_EQ(list.status, 200);
    bool found = false;
    for (const auto &f : list.json)
        found = found || f["uuid"].asString() == uuid;
    EXPECT_TRUE(found);
    EXPECT_EQ(get("/api/files").status, 401);
    auto vid = upload("/api/files", u, "clip.mp4", "vvvv");
    EXPECT_EQ(vid.status, 200);
    auto bin = upload("/api/files", u, "noext", "b");
    EXPECT_EQ(bin.status, 200);
    EXPECT_EQ(del("/api/files/" + uuid, u).status, 200);
    EXPECT_EQ(get("/api/files/" + uuid).status, 404);
    EXPECT_EQ(del("/api/files/" + vid.json["uuid"].asString(), "").status,
              401);
}

TEST(FileHttp, MissingOnDiskIs404) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto uuid = uniq("ghost");
    testDb()->execSqlSync("INSERT INTO files (filename, uuid) VALUES ($1, $1)",
                          uuid);
    EXPECT_EQ(get("/api/files/" + uuid).status, 404);
    EXPECT_EQ(get("/api/files/" + uuid + "/thumbnail").status, 404);
}
