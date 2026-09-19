#include "http_accounts.h"

using namespace harness;

TEST(ArticleHttp, UnknownArticleIs404OnEveryWrite) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto a = s.admin.token;
    auto base = "/api/articles/ghost-" + uniq("g");
    auto t = J({{"tenant_id", s.id}});
    for (auto action : {"publish", "unpublish"})
        EXPECT_EQ(post(base + "/" + action, t, a).status, 404) << action;
    EXPECT_EQ(put(base + "/private", t, a).status, 404);
    EXPECT_EQ(put(base + "/renderer",
                  J({{"renderer", "html"}, {"tenant_id", s.id}}), a).status,
              404);
    EXPECT_EQ(post(base + "/vote", J({{"is_like", true},
                   {"tenant_id", s.id}}), a).status, 404);
    EXPECT_EQ(put(base + "/tags", J({{"tags", A({"a"})},
                  {"tenant_id", s.id}}), a).status, 404);
    EXPECT_EQ(post(base + "/schedule", J({{"tenant_id", s.id},
                   {"scheduled_at", "2099-01-01 00:00"}}), a).status, 404);
    EXPECT_EQ(put(base, J({{"content", "x"}, {"tenant_id", s.id}}), a)
                  .status, 404);
    EXPECT_EQ(post(base + "/revert/1", t, a).status, 404);
    EXPECT_EQ(post(base + "/revert/1", Json::Value(Json::objectValue), a)
                  .status, 400);
    EXPECT_EQ(del(base, a, t).status, 404);
    EXPECT_EQ(del(base, a).status, 400);
    EXPECT_EQ(get(base + "/revisions?tenant_id=" + std::to_string(s.id))
                  .status, 404);
}

TEST(ArticleHttp, DeleteWithBodyAndListCategoriesWithForums) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto a = s.admin.token;
    auto name = uniq("del");
    post("/api/articles", J({{"name", name}, {"displayName", "d"},
         {"content", "c"}, {"tenant_id", s.id}}), a);
    EXPECT_EQ(del("/api/articles/" + name, a, J({{"tenant_id", s.id}}))
                  .status, 200);
    post("/api/forum/categories", J({{"name", "C"}, {"tenantId", s.id}}), a);
    post("/api/forum/forums", J({{"categoryId", maxId("forum_categories")},
         {"name", "F"}}), a);
    auto r = get("/api/forum/categories?tenant_id=" + std::to_string(s.id));
    ASSERT_EQ(r.status, 200);
    EXPECT_EQ(r.json[0]["forums"].size(), 1u);
    EXPECT_EQ(get("/api/forum/categories").status, 400);
}
