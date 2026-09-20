#include "http_accounts.h"

using namespace harness;

namespace {
int setRole(const Acct &a, int role) {
    testDb()->execSqlSync("UPDATE users SET role=$1 WHERE id=$2", role,
                          a.id);
    return role;
}
Json::Value article(const Site &s) {
    return J({{"name", uniq("art")}, {"displayName", "A"},
              {"content", "c"}, {"tenant_id", s.id}});
}
} // namespace

TEST(Permissions, OnlyModeratorsAndUpWriteArticles) {
    REQUIRE_SERVER();
    auto s = makeSite();
    EXPECT_EQ(post("/api/articles", article(s), s.user.token).status, 403);
    EXPECT_EQ(post("/api/articles", article(s), "").status, 401);
    auto mod = signup(s.slug, 2);
    EXPECT_EQ(post("/api/articles", article(s), mod.token).status, 201);
    EXPECT_EQ(post("/api/articles", article(s), s.admin.token).status, 201);
}

TEST(Permissions, SiteOwnerWritesArticlesWhateverTheStoredRole) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto owner = signup("", 1);
    testDb()->execSqlSync("UPDATE tenants SET owner_id=$1 WHERE id=$2",
                          owner.id, s.id);
    EXPECT_EQ(post("/api/articles", article(s), owner.token).status, 201);
}

TEST(Permissions, ModeratorOfAnotherSiteCannotWriteHere) {
    REQUIRE_SERVER();
    auto a = makeSite();
    auto b = makeSite();
    auto foreign = signup(b.slug, 2);
    EXPECT_NE(post("/api/articles", article(a), foreign.token).status, 201);
}

TEST(Permissions, ModeratorDeletesAnyCommentOnlyOnOwnSite) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = makeSite();
    auto mod = signup(s.slug, 2);
    auto foreign = signup(other.slug, 2);
    auto path = "/api/comments/article/" + std::to_string(s.id);
    auto mk = [&] {
        auto c = post(path, J({{"body", "hi"}}), s.user.token);
        return "/api/comments/" + std::to_string(c.json["id"].asInt());
    };
    auto c1 = mk();
    EXPECT_EQ(del(c1, foreign.token).status, 404);
    EXPECT_EQ(del(c1, signup(s.slug, 1).token).status, 404);
    EXPECT_EQ(del(c1, mod.token).status, 200);
    auto c2 = mk();
    EXPECT_EQ(del(c2, s.admin.token).status, 200);
    // Editing somebody else's words is not offered, even to moderators.
    auto c3 = mk();
    EXPECT_EQ(put(c3, J({{"body", "x"}}), mod.token).status, 404);
}

TEST(Permissions, ModeratorDeletesAnySnippetOnlyOnOwnSite) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = makeSite();
    auto mod = signup(s.slug, 2);
    auto foreign = signup(other.slug, 2);
    auto mk = [&] {
        auto c = post("/api/snippets",
                      J({{"title", "S"}, {"code", "1"},
                         {"tenant_id", s.id}}), s.user.token);
        return "/api/snippets/" + std::to_string(c.json["id"].asInt());
    };
    auto p1 = mk();
    EXPECT_EQ(del(p1, foreign.token).status, 404);
    EXPECT_EQ(del(p1, mod.token).status, 200);
    EXPECT_EQ(del(mk(), s.admin.token).status, 200);
}

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
