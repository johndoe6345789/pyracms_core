#include "owner_scope_support.h"

using namespace harness;

TEST(ForumStats, PublicScopedAndWithoutEmail) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto [cid, fid] = seedBoard(s);
    auto th = post("/api/forum/threads", J({{"forumId", fid},
                   {"title", "T"}, {"content", "c"}, {"tenantId", s.id}}),
                   s.user.token);
    post("/api/forum/posts", J({{"threadId", th.json["id"].asInt()},
         {"content", "x"}}), s.user.token);
    auto base = "/api/forum/users/" + std::to_string(s.user.id) + "/stats";
    auto ok = get(base + "?tenant_id=" + std::to_string(s.id));
    ASSERT_EQ(ok.status, 200);
    EXPECT_EQ(ok.json["threadCount"].asInt(), 1);
    EXPECT_GE(ok.json["postCount"].asInt(), 1);
    EXPECT_GT(ok.json["reputation"].asInt(), 0);
    EXPECT_FALSE(ok.json["joinedAt"].asString().empty());
    EXPECT_EQ(ok.text.find("@"), std::string::npos);
    EXPECT_EQ(get(base).status, 400);
    auto other = makeSite();
    EXPECT_EQ(get(base + "?tenant_id=" + std::to_string(other.id)).status,
              404);
}
