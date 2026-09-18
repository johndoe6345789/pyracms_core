#include "http_accounts.h"

using namespace harness;

TEST(GameDepHttp, CatalogIsTenantScoped) {
    REQUIRE_SERVER();
    auto admin = platformAdmin();
    std::string sa, sb;
    int ta = newTenant(admin, sa);
    int tb = newTenant(admin, sb);
    auto owner = signup(sa, 3);
    auto name = uniq("scoped");
    Json::Value page;
    page["name"] = name;
    post("/api/gamedep/game", page, owner.token);
    Json::Value rev;
    rev["version"] = "2.0";
    post("/api/gamedep/game/" + name + "/revisions", rev, owner.token);
    post("/api/gamedep/game/" + name + "/revisions/2.0/publish",
         Json::Value(Json::objectValue), owner.token);
    auto a = get("/api/gamedep/catalog?tenant_id=" + std::to_string(ta));
    auto b = get("/api/gamedep/catalog?tenant_id=" + std::to_string(tb));
    EXPECT_EQ(a.json["gamedep"].size(), 1u);
    EXPECT_EQ(b.json["gamedep"].size(), 0u);
    EXPECT_EQ(get("/api/outputs/json?tenant_id=" + std::to_string(ta))
                  .status,
              200);
    // A foreign-site account cannot write into the other tenant.
    auto other = signup(sb, 3);
    Json::Value tags;
    tags["tags"].append("x");
    tags["tenant_id"] = ta;
    EXPECT_NE(put("/api/gamedep/game/" + name + "/tags", tags, other.token)
                  .status,
              200);
}

TEST(GameDepHttp, ReadsValidateAndListLookups) {
    REQUIRE_SERVER();
    EXPECT_EQ(get("/api/gamedep/bogus").status, 400);
    EXPECT_EQ(get("/api/gamedep/game?limit=x&q=zz&tag=t").status, 200);
    EXPECT_EQ(get("/api/gamedep/game/none-" + uniq("n")).status, 404);
    EXPECT_GT(get("/api/operating-systems").json.size(), 0u);
    EXPECT_GT(get("/api/architectures").json.size(), 0u);
    EXPECT_EQ(post("/api/gamedep/game", Json::Value(Json::objectValue), "")
                  .status,
              401);
    auto u = signup("", 1);
    Json::Value bad;
    bad["name"] = "no spaces allowed";
    EXPECT_EQ(post("/api/gamedep/game", bad, u.token).status, 400);
}
