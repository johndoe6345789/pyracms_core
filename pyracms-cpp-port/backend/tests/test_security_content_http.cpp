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

TEST(SecurityArticles, OnlyAuthorsAndStaffMayChangeAnArticle) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = signup(s.slug);
    auto name = mkArticle(s, s.user.token);
    auto base = "/api/articles/" + name;
    auto upd = J({{"content", "hijack"}, {"tenant_id", s.id}});
    EXPECT_EQ(put(base, upd, other.token).status, 403);
    EXPECT_EQ(put(base + "/renderer", J({{"renderer", "html"},
                                          {"tenant_id", s.id}}),
                  other.token).status, 403);
    EXPECT_EQ(put(base + "/private", J({{"tenant_id", s.id}}),
                  other.token).status, 403);
    EXPECT_EQ(post(base + "/unpublish", J({{"tenant_id", s.id}}),
                   other.token).status, 403);
    EXPECT_EQ(del(base + tq(s), other.token).status, 403);
    EXPECT_EQ(put(base, upd, "").status, 401);
    EXPECT_EQ(put(base, upd, s.user.token).status, 200);
    auto mod = signup(s.slug, 2);
    EXPECT_EQ(put(base, upd, mod.token).status, 200);
    EXPECT_EQ(del(base + tq(s), other.token).status, 403);
    EXPECT_EQ(del(base + tq(s), s.user.token).status, 200);
}

TEST(SecurityArticles, TenantAccountsCannotReachOtherSites) {
    REQUIRE_SERVER();
    auto a = makeSite();
    auto b = makeSite();
    auto name = mkArticle(a, a.user.token);
    auto upd = J({{"content", "x"}, {"tenant_id", a.id}});
    EXPECT_EQ(put("/api/articles/" + name, upd, b.admin.token).status, 403);
    EXPECT_EQ(del("/api/articles/" + name + tq(a), b.admin.token).status, 403);
    // the other site's own article name does not resolve inside site a
    EXPECT_EQ(put("/api/articles/" + name,
                  J({{"content", "x"}, {"tenant_id", b.id}}),
                  b.admin.token).status, 404);
}

TEST(SecurityArticles, PrivateAndUnpublishedStayOutOfPublicView) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = signup(s.slug);
    auto name = mkArticle(s, s.user.token, "secret-draft-text");
    auto base = "/api/articles/" + name;
    ASSERT_EQ(put(base + "/private", J({{"tenant_id", s.id}}),
                  s.user.token).status, 200);
    // SEO metadata only ever describes public articles
    for (const char *suffix : {"/jsonld", "/opengraph"})
        EXPECT_EQ(get(base + suffix + tq(s), s.user.token).status, 404);
    for (const char *suffix : {"", "/revisions"}) {
        auto url = base + suffix + tq(s);
        EXPECT_EQ(get(url).status, 404) << url;
        EXPECT_EQ(get(url, other.token).status, 404) << url;
        EXPECT_EQ(get(url, s.user.token).status, 200) << url;
        EXPECT_EQ(get(url, s.admin.token).status, 200) << url;
    }
    auto list = get("/api/articles" + tq(s) + "&limit=100");
    for (const auto &a : list.json)
        EXPECT_NE(a["name"].asString(), name);
    auto mine = get("/api/articles" + tq(s) + "&limit=100", s.user.token);
    bool found = false;
    for (const auto &a : mine.json)
        found = found || a["name"].asString() == name;
    EXPECT_TRUE(found);
    auto found_in_search = get("/api/search" + tq(s) + "&q=" + name);
    EXPECT_EQ(found_in_search.json["totalCount"].asInt(), 0);
    EXPECT_EQ(get("/api/sitemap.xml" + tq(s)).text.find(name),
              std::string::npos);
}

TEST(SecurityArticles, RevisionsCannotBeReadThroughAnotherArticle) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto pub = mkArticle(s, s.user.token);
    auto priv = mkArticle(s, s.user.token, "hidden-revision-text");
    put("/api/articles/" + priv + "/private", J({{"tenant_id", s.id}}),
        s.user.token);
    auto rows = testDb()->execSqlSync(
        "SELECT r.id FROM article_revisions r JOIN articles a ON "
        "a.id = r.article_id WHERE a.name = $1 AND a.tenant_id = $2", priv,
        s.id);
    ASSERT_FALSE(rows.empty());
    auto rid = std::to_string(rows[0]["id"].as<int>());
    auto r = get("/api/articles/" + pub + "/revisions/" + rid + tq(s));
    EXPECT_EQ(r.status, 404);
    EXPECT_EQ(r.text.find("hidden-revision-text"), std::string::npos);
    EXPECT_EQ(get("/api/articles/" + priv + "/revisions/" + rid + tq(s)).status,
              404);
    EXPECT_EQ(get("/api/articles/" + pub + "/revisions/" + rid).status, 400);
}

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
    auto album = "/api/gallery/albums/" + std::to_string(maxId("gallery_albums"));
    auto upd = J({{"displayName", "x"}, {"description", "y"}});
    EXPECT_EQ(put(album, upd, other.token).status, 403);
    EXPECT_EQ(del(album, other.token).status, 403);
    auto pic = J({{"displayName", "P"},
                  {"fileUuid", drogon::utils::getUuid()}});
    EXPECT_EQ(post(album + "/pictures", pic, other.token).status, 403);
    ASSERT_TRUE(ok(post(album + "/pictures", pic, s.user.token)));
    auto picUrl = "/api/gallery/pictures/" + std::to_string(maxId("gallery_pictures"));
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

TEST(SecuritySettings, OnlySiteAdminsWriteAndSecretsStayHidden) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto body = J({{"tenantId", s.id}, {"value", "v"}});
    EXPECT_EQ(put("/api/settings/site_name", body, s.user.token).status, 403);
    EXPECT_EQ(put("/api/settings/site_name", body, "").status, 401);
    EXPECT_EQ(put("/api/settings/site_name", body, s.admin.token).status, 200);
    EXPECT_EQ(put("/api/settings/smtp_password",
                  J({{"tenantId", s.id}, {"value", "hunter2"}}),
                  s.admin.token).status, 200);
    EXPECT_EQ(put("/api/settings/bad name", body, s.admin.token).status, 400);
    EXPECT_EQ(put("/api/settings/x", J({{"tenantId", s.id}, {"value", 5}}),
                  s.admin.token).status, 400);
    EXPECT_EQ(del("/api/settings/site_name", s.user.token,
                  J({{"tenantId", s.id}})).status, 403);
    for (const auto &tok : {std::string(), s.user.token}) {
        auto list = get("/api/settings" + tq(s), tok);
        EXPECT_EQ(list.text.find("hunter2"), std::string::npos);
        EXPECT_EQ(get("/api/settings/smtp_password" + tq(s), tok).status, 404);
        EXPECT_EQ(get("/api/settings/site_name" + tq(s), tok).status, 200);
    }
    EXPECT_EQ(get("/api/settings/smtp_password" + tq(s), s.admin.token)
                  .json["value"].asString(), "hunter2");
    auto other = makeSite();
    EXPECT_EQ(put("/api/settings/site_name", body, other.admin.token).status,
              403);
}
