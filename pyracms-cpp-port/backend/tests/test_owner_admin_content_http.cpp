#include "owner_scope_support.h"

using namespace harness;

TEST(OwnerAdminFiles, OwnerListsEveryFileOfOwnSiteOnly) {
    REQUIRE_SERVER();
    auto o = ownedSite();
    auto other = makeSite();
    const std::string png = std::string("\x89PNG\r\n\x1a\n", 8) + "d1";
    auto mine = upload("/api/files", o.site.user.token, "a.png", png);
    auto theirs = upload("/api/files", other.user.token, "b.png", png + "2");
    ASSERT_EQ(mine.status, 200) << mine.text;
    ASSERT_EQ(theirs.status, 200);
    auto q = "/api/files?limit=200&tenant_id=" + std::to_string(o.site.id);
    auto r = get(q, o.owner.token);
    ASSERT_EQ(r.status, 200);
    bool m = false, x = false;
    for (const auto &f : r.json) {
        m = m || f["uuid"].asString() == mine.json["uuid"].asString();
        x = x || f["uuid"].asString() == theirs.json["uuid"].asString();
    }
    EXPECT_TRUE(m);
    EXPECT_FALSE(x);
    auto foreign = get("/api/files?limit=200&tenant_id=" +
                           std::to_string(other.id), o.owner.token);
    for (const auto &f : foreign.json)
        EXPECT_NE(f["uuid"].asString(), theirs.json["uuid"].asString());
}

TEST(OwnerAdminGameDep, OwnerEditsMembersPage) {
    REQUIRE_SERVER();
    auto o = ownedSite();
    auto game = uniq("game");
    Json::Value page;
    page["name"] = game;
    page["displayName"] = "G";
    page["description"] = "d";
    ASSERT_EQ(post("/api/gamedep/game", page, o.site.user.token).status,
              201);
    auto base = "/api/gamedep/game/" + game;
    auto q = "?tenant_id=" + std::to_string(o.site.id);
    EXPECT_EQ(put(base + "/tags" + q, J({{"tags", A({"a"})}}),
                  o.owner.token).status, 200);
    auto other = ownedSite();
    EXPECT_NE(put(base + "/tags" + q, J({{"tags", A({"z"})}}),
                  other.owner.token).status, 200);
}

TEST(OwnerAdminSettings, OwnerReadsCredentialLikeSettingsOfOwnSite) {
    REQUIRE_SERVER();
    auto o = ownedSite();
    auto other = ownedSite();
    auto q = "?tenant_id=" + std::to_string(o.site.id);
    ASSERT_EQ(put("/api/settings/smtp_password" + q,
                  J({{"tenantId", o.site.id}, {"value", "s3"}}),
                  o.owner.token).status, 200);
    EXPECT_EQ(get("/api/settings/smtp_password" + q, o.owner.token)
                  .json["value"].asString(), "s3");
    EXPECT_EQ(get("/api/settings" + q, o.owner.token).json.size(), 1u);
    EXPECT_EQ(get("/api/settings/smtp_password" + q, other.owner.token)
                  .status, 404);
    EXPECT_EQ(get("/api/settings" + q, other.owner.token).json.size(), 0u);
    EXPECT_EQ(get("/api/settings" + q).json.size(), 0u);
}
