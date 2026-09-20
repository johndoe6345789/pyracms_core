#include "http_accounts.h"

using namespace harness;

namespace {
Json::Value siteBody(const std::string &slug, const std::string &admin) {
    Json::Value a = J({{"username", admin}, {"email", admin + "@h.test"},
                       {"password", "password123"}});
    Json::Value b = J({{"slug", slug}, {"displayName", "S"}});
    b["admin"] = a;
    return b;
}
Json::Value member(const std::string &slug) {
    auto n = uniq("mb");
    return J({{"username", n}, {"email", n + "@h.test"},
              {"password", "password123"}, {"tenant", slug}});
}
} // namespace

TEST(AccountModel, CreatingASiteCreatesItsAdministrator) {
    REQUIRE_SERVER();
    auto slug = uslug("as"), admin = uniq("ad");
    auto r = post("/api/sites", siteBody(slug, admin));
    ASSERT_EQ(r.status, 201) << r.text;
    EXPECT_EQ(r.json["user"]["role"].asInt(), 3);
    EXPECT_EQ(r.json["user"]["tenantSlug"].asString(), slug);
    int site = r.json["site"]["id"].asInt();
    auto row = testDb()->execSqlSync(
        "SELECT owner_id FROM tenants WHERE id=$1", site);
    EXPECT_EQ(row[0]["owner_id"].as<int>(), r.json["user"]["id"].asInt());
    auto users = get("/api/users?tenant_id=" + std::to_string(site), "");
    EXPECT_EQ(users.status, 401);
    auto mine = get("/api/users?tenant_id=" + std::to_string(site),
                    r.json["token"].asString());
    EXPECT_EQ(mine.status, 200);
}

TEST(AccountModel, SiteCreationRejectsBadInputAndLeavesNothingBehind) {
    REQUIRE_SERVER();
    auto slug = uslug("bad");
    auto noAdmin = J({{"slug", slug}, {"displayName", "S"}});
    EXPECT_EQ(post("/api/sites", noAdmin).status, 400);
    auto weak = siteBody(slug, uniq("ad"));
    weak["admin"]["password"] = "short";
    EXPECT_EQ(post("/api/sites", weak).status, 400);
    auto gone = testDb()->execSqlSync(
        "SELECT 1 FROM tenants WHERE slug=$1", slug);
    EXPECT_TRUE(gone.empty());
    ASSERT_EQ(post("/api/sites", siteBody(slug, uniq("ad"))).status, 201);
    EXPECT_EQ(post("/api/sites", siteBody(slug, uniq("ad"))).status, 409);
}

TEST(AccountModel, RegisteringOnASiteAlwaysMakesANormalUser) {
    REQUIRE_SERVER();
    auto slug = uslug("rg");
    ASSERT_EQ(post("/api/sites", siteBody(slug, uniq("ad"))).status, 201);
    for (int i = 0; i < 3; ++i) {
        auto r = post("/api/auth/register", member(slug));
        ASSERT_EQ(r.status, 201) << r.text;
        EXPECT_EQ(r.json["user"]["role"].asInt(), 1);
        EXPECT_FALSE(r.json["firstUser"].asBool());
    }
}

TEST(AccountModel, ThePlatformHasNoPublicSignUp) {
    REQUIRE_SERVER();
    auto n = uniq("pl");
    auto r = post("/api/auth/register",
                  J({{"username", n}, {"email", n + "@h.test"},
                     {"password", "password123"}}));
    EXPECT_EQ(r.status, 403);
}

TEST(AccountModel, OnlyTheSiteAdministratorMakesModerators) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto id = std::to_string(s.user.id);
    auto body = J({{"role", 2}});
    EXPECT_EQ(put("/api/users/" + id + "/role", body, s.user.token).status,
              403);
    EXPECT_EQ(put("/api/users/" + id + "/role", body, s.admin.token).status,
              200);
}
