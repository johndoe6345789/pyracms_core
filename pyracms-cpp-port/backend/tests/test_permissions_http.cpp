#include "http_accounts.h"

using namespace harness;

namespace {
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
