#include "http_accounts.h"

using namespace harness;

TEST(ArticleHttp, CreateReadUpdateAndRevisions) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto tok = s.admin.token;
    auto t = std::to_string(s.id);
    auto name = uniq("art");
    auto base = "/api/articles/" + name;
    auto c = J({{"name", name}, {"displayName", "A"}, {"content", "v1"},
                {"tenant_id", s.id}});
    EXPECT_EQ(post("/api/articles", c, tok).status, 201);
    EXPECT_NE(post("/api/articles", c, tok).status, 201);
    EXPECT_EQ(post("/api/articles", J({{"name", "x"}}), tok).status, 400);
    auto g = get(base + "?tenant_id=" + t);
    ASSERT_EQ(g.status, 200);
    EXPECT_EQ(g.json["name"].asString(), name);
    EXPECT_EQ(get(base).status, 400);
    EXPECT_EQ(get("/api/articles/nope?tenant_id=" + t).status, 404);
    auto u = J({{"content", "v2"}, {"summary", "s"}, {"tenant_id", s.id}});
    EXPECT_EQ(put(base, u, tok).status, 200);
    EXPECT_EQ(put(base, J({{"x", 1}}), tok).status, 400);
    auto list = get("/api/articles?tenant_id=" + t + "&limit=5&offset=0");
    EXPECT_EQ(list.status, 200);
    EXPECT_EQ(get("/api/articles").status, 400);
    auto revs = get(base + "/revisions?tenant_id=" + t);
    ASSERT_EQ(revs.status, 200);
    ASSERT_GE(revs.json.size(), 2u);
    auto rid = std::to_string(revs.json[revs.json.size() - 1]["id"].asInt());
    EXPECT_EQ(get(base + "/revisions/" + rid + "?tenant_id=" + t).status,
              200);
    EXPECT_EQ(get(base + "/revisions/999999?tenant_id=" + t).status, 404);
    EXPECT_EQ(get(base + "/revisions?x=1").status, 400);
    EXPECT_EQ(post(base + "/revert/" + rid + "?tenant_id=" + t,
                   Json::Value(Json::objectValue), tok)
                  .status,
              200);
    EXPECT_NE(post(base + "/revert/999999?tenant_id=" + t,
                   Json::Value(Json::objectValue), tok)
                  .status,
              200);
    EXPECT_EQ(del(base + "?tenant_id=" + t, tok).status, 200);
    EXPECT_EQ(del(base + "?tenant_id=" + t, tok).status, 404);
}
