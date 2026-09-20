#include "http_accounts.h"

using namespace harness;

TEST(Permissions, ForumModerationStaysInsideTheSite) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = makeSite();
    auto foreign = signup(other.slug, 2);
    auto mod = signup(s.slug, 2);
    post("/api/forum/categories",
         J({{"name", "C"}, {"tenantId", s.id}}), s.admin.token);
    int cid = maxId("forum_categories");
    post("/api/forum/forums", J({{"categoryId", cid}, {"name", "F"}}),
         s.admin.token);
    int fid = maxId("forums");
    auto th = post("/api/forum/threads",
                   J({{"forumId", fid}, {"title", "T"}, {"content", "b"},
                      {"tenantId", s.id}}), s.user.token);
    ASSERT_TRUE(ok(th)) << th.text;
    auto ts = "/api/forum/threads/" + std::to_string(th.json["id"].asInt());
    auto flags = J({{"pinned", true}, {"locked", false}});
    EXPECT_NE(put(ts + "/flags", flags, foreign.token).status, 200);
    EXPECT_NE(put(ts, J({{"title", "X"}}), foreign.token).status, 200);
    EXPECT_NE(del(ts, foreign.token).status, 200);
    EXPECT_EQ(put(ts + "/flags", flags, mod.token).status, 200);
    EXPECT_EQ(put(ts, J({{"title", "Y"}}), mod.token).status, 200);
    EXPECT_EQ(del(ts, mod.token).status, 200);
}

TEST(Permissions, PlatformOwnerModeratesAnySite) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto po = signup("", 4);
    auto c = post("/api/comments/article/" + std::to_string(s.id),
                  J({{"body", "hi"}}), s.user.token);
    auto path = "/api/comments/" + std::to_string(c.json["id"].asInt());
    EXPECT_EQ(del(path, po.token).status, 200);
}
