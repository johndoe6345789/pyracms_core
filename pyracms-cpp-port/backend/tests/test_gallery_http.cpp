#include "http_accounts.h"

using namespace harness;

static std::string mkFile() {
    auto uuid = uniq("gf");
    testDb()->execSqlSync("INSERT INTO files (filename, uuid, size, "
                          "is_picture) VALUES ($1, $1, 10, true)", uuid);
    return uuid;
}

TEST(GalleryHttp, AlbumLifecycle) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto u = s.user.token;
    auto t = "?tenant_id=" + std::to_string(s.id);
    EXPECT_EQ(post("/api/gallery/albums", J({{"x", 1}}), u).status, 400);
    auto c = post("/api/gallery/albums", J({{"displayName", "Al"},
                  {"tenantId", s.id}, {"description", "d"}}), u);
    ASSERT_TRUE(ok(c)) << c.text;
    auto id = std::to_string(maxId("gallery_albums"));
    EXPECT_EQ(get("/api/gallery/albums" + t).status, 200);
    EXPECT_EQ(get("/api/gallery/albums").status, 400);
    EXPECT_EQ(get("/api/gallery/albums/" + id + t).status, 200);
    EXPECT_EQ(get("/api/gallery/albums/999999" + t).status, 404);
    EXPECT_EQ(put("/api/gallery/albums/" + id,
                  J({{"displayName", "A2"}, {"description", "e"}}), u).status,
              200);
    EXPECT_EQ(put("/api/gallery/albums/" + id, J({{"x", 1}}), u).status, 400);
    EXPECT_EQ(del("/api/gallery/albums/" + id, u).status, 200);
}

TEST(GalleryHttp, PicturesVoteAndDefault) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto u = s.user.token;
    post("/api/gallery/albums", J({{"displayName", "Al"},
         {"tenantId", s.id}}), u);
    int aid = maxId("gallery_albums");
    auto ap = "/api/gallery/albums/" + std::to_string(aid) + "/pictures";
    EXPECT_EQ(post(ap, J({{"displayName", "P"}}), u).status, 400);
    auto p = post(ap, J({{"displayName", "P"}, {"fileUuid", mkFile()},
                         {"description", "d"}}), u);
    ASSERT_TRUE(ok(p)) << p.text;
    auto pid = std::to_string(maxId("gallery_pictures"));
    auto pp = "/api/gallery/pictures/" + pid;
    EXPECT_EQ(get(pp).status, 200);
    EXPECT_EQ(get("/api/gallery/pictures/999999").status, 404);
    EXPECT_EQ(put(pp, J({{"displayName", "P2"}, {"description", "z"}}), u)
                  .status, 200);
    EXPECT_EQ(put(pp, J({{"x", 1}}), u).status, 400);
    EXPECT_EQ(put(pp + "/default", J({{"albumId", aid}}), u).status, 200);
    EXPECT_EQ(put(pp + "/default", J({{"x", 1}}), u).status, 400);
    EXPECT_EQ(post(pp + "/vote", J({{"isLike", true}}), s.admin.token)
                  .status, 200);
    EXPECT_EQ(post(pp + "/vote", J({{"x", 1}}), u).status, 400);
    EXPECT_EQ(del(pp, u).status, 200);
}
