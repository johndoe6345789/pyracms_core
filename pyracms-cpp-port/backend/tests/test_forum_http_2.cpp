#include "http_accounts.h"

using namespace harness;

TEST(ForumHttp, PostsVotesAndDeletes) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto a = s.admin.token;
    auto u = s.user.token;
    auto t = "?tenant_id=" + std::to_string(s.id);
    auto cat = post("/api/forum/categories",
                    J({{"name", "Cat"}, {"tenantId", s.id}}), a);
    auto fr = post("/api/forum/forums",
                   J({{"categoryId", cat.json["id"]}, {"name", "F"}}), a);
    auto th = post("/api/forum/threads",
                   J({{"forumId", fr.json["id"]}, {"title", "T"},
                      {"content", "c"}, {"tenantId", s.id}}), u);
    auto tid = th.json["id"].asInt();
    auto p = post("/api/forum/posts",
                  J({{"threadId", tid}, {"content", "hi"},
                     {"title", "re"}}), u);
    ASSERT_TRUE(ok(p)) << p.text;
    auto ps = std::to_string(p.json["id"].asInt());
    EXPECT_EQ(post("/api/forum/posts", J({{"threadId", tid}}), u).status,
              400);
    EXPECT_EQ(get("/api/forum/posts/" + ps + t).status, 200);
    EXPECT_EQ(get("/api/forum/posts/999999" + t).status, 404);
    EXPECT_EQ(put("/api/forum/posts/" + ps,
                  J({{"content", "ed"}, {"title", "x"}}), u).status, 200);
    EXPECT_EQ(put("/api/forum/posts/" + ps, J({{"x", 1}}), u).status, 400);
    EXPECT_EQ(post("/api/forum/posts/" + ps + "/vote",
                   J({{"isLike", true}}), a).status, 200);
    EXPECT_EQ(post("/api/forum/posts/" + ps + "/vote", J({{"x", 1}}), a)
                  .status, 400);
    EXPECT_EQ(del("/api/forum/posts/" + ps, u).status, 200);
    EXPECT_EQ(del("/api/forum/threads/" + std::to_string(tid), u).status,
              200);
    EXPECT_EQ(del("/api/forum/forums/" + std::to_string(
                      fr.json["id"].asInt()), a).status, 200);
    EXPECT_EQ(del("/api/forum/categories/" + std::to_string(
                      cat.json["id"].asInt()), a).status, 200);
    EXPECT_EQ(del("/api/forum/categories/999999", a).status, 404);
}
