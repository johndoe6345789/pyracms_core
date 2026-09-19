#include "http_accounts.h"

using namespace harness;


TEST(ForumHttp, AdminBuildsBoardAndMembersPost) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto a = s.admin.token;
    auto u = s.user.token;
    auto t = "?tenant_id=" + std::to_string(s.id);
    EXPECT_EQ(post("/api/forum/categories", J({{"name", "c"}}), a).status,
              400);
    auto cat = post("/api/forum/categories",
                    J({{"name", "Cat"}, {"tenantId", s.id}}), a);
    ASSERT_TRUE(ok(cat)) << cat.text;
    EXPECT_EQ(post("/api/forum/categories",
                   J({{"name", "x"}, {"tenantId", s.id}}), u).status, 403);
    int cid = maxId("forum_categories");
    auto cs = std::to_string(cid);
    EXPECT_EQ(put("/api/forum/categories/" + cs, J({{"name", "C2"}}), a)
                  .status, 200);
    EXPECT_EQ(put("/api/forum/categories/" + cs, J({{"x", 1}}), a).status,
              400);
    EXPECT_EQ(get("/api/forum/categories" + t).status, 200);
    EXPECT_EQ(post("/api/forum/forums", J({{"name", "f"}}), a).status, 400);
    auto fr = post("/api/forum/forums",
                   J({{"categoryId", cid}, {"name", "F"},
                      {"description", "d"}}), a);
    ASSERT_TRUE(ok(fr)) << fr.text;
    int fid = maxId("forums");
    auto fs = std::to_string(fid);
    EXPECT_EQ(put("/api/forum/forums/" + fs,
                  J({{"name", "F2"}, {"description", "e"}}), a).status, 200);
    EXPECT_EQ(put("/api/forum/forums/" + fs, J({{"x", 1}}), a).status, 400);
    auto th = post("/api/forum/threads",
                   J({{"forumId", fid}, {"title", "T"},
                      {"content", "body"}, {"tenantId", s.id}}), u);
    ASSERT_TRUE(ok(th)) << th.text;
    auto ts = std::to_string(th.json["id"].asInt());
    EXPECT_EQ(post("/api/forum/threads", J({{"title", "x"}}), u).status,
              400);
    EXPECT_EQ(get("/api/forum/forums/" + fs + t).status, 200);
    EXPECT_EQ(get("/api/forum/threads/" + ts + t).status, 200);
    EXPECT_EQ(put("/api/forum/threads/" + ts, J({{"title", "T2"}}), u)
                  .status, 200);
    EXPECT_EQ(put("/api/forum/threads/" + ts, J({{"x", 1}}), u).status, 400);
    EXPECT_EQ(put("/api/forum/threads/" + ts + "/flags",
                  J({{"pinned", true}, {"locked", false}}), a).status, 200);
    EXPECT_EQ(put("/api/forum/threads/" + ts + "/flags", J({{"x", 1}}), a)
                  .status, 400);
}
