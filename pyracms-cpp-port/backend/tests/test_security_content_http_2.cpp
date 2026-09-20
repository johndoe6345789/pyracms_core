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

TEST(SecurityArticles, PrivateAndUnpublishedStayOutOfPublicView) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = signup(s.slug);
    auto name = mkArticle(s, authorToken(s), "secret-draft-text");
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
    auto pub = mkArticle(s, authorToken(s));
    auto priv = mkArticle(s, authorToken(s), "hidden-revision-text");
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
