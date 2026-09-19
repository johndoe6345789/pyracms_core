#include "http_accounts.h"

using namespace harness;

namespace {
std::string mkArticle(const Site &s, const std::string &token,
                      const std::string &content = "body") {
    auto name = uniq("sa");
    post("/api/articles", J({{"name", name}, {"displayName", "T"},
                             {"content", content}, {"tenant_id", s.id}}),
         token);
    return name;
}
std::string tq(const Site &s) { return "?tenant_id=" + std::to_string(s.id); }
} // namespace

TEST(SecurityArticles, InputIsValidated) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto mk = [&](Json::Value b) {
        b["tenant_id"] = s.id;
        return post("/api/articles", b, s.user.token).status;
    };
    EXPECT_EQ(mk(J({{"name", "a/b"}, {"displayName", "d"}, {"content", "c"}})),
              400);
    EXPECT_EQ(mk(J({{"name", uniq("n")}, {"displayName", "d"},
                    {"content", "c"}, {"renderer", "php"}})), 400);
    EXPECT_EQ(mk(J({{"name", uniq("n")}, {"displayName", 5},
                    {"content", "c"}})), 400);
    EXPECT_EQ(mk(J({{"name", uniq("n")}, {"displayName", "d"},
                    {"content", std::string(1100000, 'x')}})), 400);
}

TEST(SecurityGallery, AlbumsAndPicturesBelongToTheirAuthor) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = signup(s.slug);
    ASSERT_TRUE(ok(post("/api/gallery/albums", J({{"displayName", "Al"},
                        {"tenantId", s.id}}), s.user.token)));
    auto album =
        "/api/gallery/albums/" + std::to_string(maxId("gallery_albums"));
    auto upd = J({{"displayName", "x"}, {"description", "y"}});
    EXPECT_EQ(put(album, upd, other.token).status, 403);
    EXPECT_EQ(del(album, other.token).status, 403);
    auto pic = J({{"displayName", "P"},
                  {"fileUuid", drogon::utils::getUuid()}});
    EXPECT_EQ(post(album + "/pictures", pic, other.token).status, 403);
    ASSERT_TRUE(ok(post(album + "/pictures", pic, s.user.token)));
    auto picUrl = "/api/gallery/pictures/" +
                  std::to_string(maxId("gallery_pictures"));
    EXPECT_EQ(put(picUrl, upd, other.token).status, 403);
    EXPECT_EQ(del(picUrl, other.token).status, 403);
    EXPECT_EQ(put(picUrl + "/default", Json::Value(Json::objectValue),
                  other.token).status, 403);
    // votes stay open to any signed-in member
    EXPECT_EQ(post(picUrl + "/vote", J({{"isLike", true}}), other.token).status,
              200);
    EXPECT_EQ(post(album + "/pictures",
                   J({{"displayName", "P"}, {"fileUuid", "../../x"}}),
                   s.user.token).status, 400);
    EXPECT_EQ(put(album, J({{"displayName", std::string(300, 'n')}}),
                  s.user.token).status, 400);
    auto mod = signup(s.slug, 2);
    EXPECT_EQ(del(picUrl, mod.token).status, 200);
    EXPECT_EQ(del(album, s.user.token).status, 200);
    auto foreign = makeSite();
    EXPECT_EQ(del("/api/gallery/albums/1", foreign.admin.token).status >= 400,
              true);
}
