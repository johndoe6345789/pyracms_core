#include "owner_scope_support.h"

using namespace harness;

TEST(OwnerScopeForum, OwnerAdminsOwnBoardWithoutNamingTenant) {
    REQUIRE_SERVER();
    auto o = ownedSite();
    auto t = o.owner.token;
    auto [cid, fid] = seedBoard(o.site);
    auto cs = std::to_string(cid), fs = std::to_string(fid);
    EXPECT_EQ(put("/api/forum/categories/" + cs, J({{"name", "N"}}), t)
                  .status, 200);
    EXPECT_EQ(put("/api/forum/forums/" + fs,
                  J({{"name", "G"}, {"description", "d"}}), t).status, 200);
    EXPECT_EQ(post("/api/forum/forums",
                   J({{"categoryId", cid}, {"name", "H"}}), t).status, 200);
    EXPECT_EQ(del("/api/forum/forums/" + fs, t).status, 200);
    EXPECT_EQ(del("/api/forum/categories/" + cs, t).status, 200);
}

TEST(OwnerScopeForum, OwnerCannotReachAnotherSitesBoard) {
    REQUIRE_SERVER();
    auto o = ownedSite();
    auto t = o.owner.token;
    auto other = makeSite();
    auto [cid, fid] = seedBoard(other);
    auto cs = std::to_string(cid), fs = std::to_string(fid);
    auto mine = J({{"name", "X"}, {"tenantId", o.site.id}});
    EXPECT_EQ(put("/api/forum/categories/" + cs, mine, t).status, 404);
    EXPECT_EQ(put("/api/forum/forums/" + fs, mine, t).status, 404);
    EXPECT_EQ(del("/api/forum/categories/" + cs, t,
                  J({{"tenantId", o.site.id}})).status, 404);
    EXPECT_EQ(post("/api/forum/forums",
                   J({{"categoryId", cid}, {"name", "Z"},
                      {"tenantId", o.site.id}}), t).status, 404);
    EXPECT_EQ(put("/api/forum/categories/" + cs, J({{"name", "X"}}), t)
                  .status, 403);
    EXPECT_EQ(del("/api/forum/forums/" + fs, t).status, 403);
    auto n = testDb()->execSqlSync(
        "SELECT name FROM forum_categories WHERE id=$1", cid);
    ASSERT_EQ(n.size(), 1u);
    EXPECT_EQ(n[0]["name"].as<std::string>(), "Cat");
}

TEST(OwnerScopeForum, PlainMemberAndStrangerAreRefused) {
    REQUIRE_SERVER();
    auto o = ownedSite();
    auto [cid, fid] = seedBoard(o.site);
    auto cs = std::to_string(cid);
    auto body = J({{"name", "X"}});
    EXPECT_EQ(put("/api/forum/categories/" + cs, body, o.site.user.token)
                  .status, 403);
    auto stranger = signup("", 1);
    EXPECT_EQ(put("/api/forum/categories/" + cs, body, stranger.token)
                  .status, 403);
    body["tenantId"] = o.site.id;
    EXPECT_EQ(put("/api/forum/categories/" + cs, body, stranger.token)
                  .status, 403);
    EXPECT_EQ(put("/api/forum/categories/999999", body, o.owner.token)
                  .status, 404);
}
