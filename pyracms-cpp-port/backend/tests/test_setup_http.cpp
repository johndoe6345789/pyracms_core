#include "http_accounts.h"

using namespace harness;

namespace {
Json::Value owner(const std::string &n) {
    return J({{"username", n}, {"email", n + "@h.test"},
              {"password", "password123"}});
}
} // namespace

TEST(Setup, IsClosedOnceThePlatformHasAnOwner) {
    REQUIRE_SERVER();
    platformAdmin();
    EXPECT_FALSE(get("/api/auth/setup").json["needsSetup"].asBool());
    auto r = post("/api/auth/setup", owner(uniq("po")));
    EXPECT_EQ(r.status, 409);
    auto rows = testDb()->execSqlSync(
        "SELECT 1 FROM users WHERE username LIKE 'po%' AND role >= 4 "
        "AND tenant_id IS NULL AND created_at > NOW() - INTERVAL '5 s'");
    EXPECT_TRUE(rows.empty());
}

TEST(Setup, CreatesTheFirstPlatformOwnerAndSignsThemIn) {
    REQUIRE_SERVER();
    // Pretend the platform is brand new: park its Platform Owners.
    auto old = testDb()->execSqlSync(
        "UPDATE users SET role = 3 WHERE tenant_id IS NULL AND role >= 4 "
        "RETURNING id");
    auto firsts = testDb()->execSqlSync(
        "UPDATE users SET is_first = false WHERE tenant_id IS NULL "
        "AND is_first RETURNING id");
    auto name = uniq("first");
    auto r = post("/api/auth/setup", owner(name));
    auto again = post("/api/auth/setup", owner(uniq("late")));
    int made = r.json["user"].get("id", 0).asInt();
    testDb()->execSqlSync("DELETE FROM users WHERE id = $1", made);
    for (const auto &row : old)
        testDb()->execSqlSync("UPDATE users SET role = 4 WHERE id = $1",
                              row["id"].as<int>());
    for (const auto &row : firsts)
        testDb()->execSqlSync("UPDATE users SET is_first = true "
                              "WHERE id = $1", row["id"].as<int>());
    ASSERT_EQ(r.status, 201) << r.text;
    EXPECT_EQ(r.json["user"]["role"].asInt(), 4);
    EXPECT_TRUE(r.json["firstUser"].asBool());
    EXPECT_TRUE(r.json["user"]["tenantSlug"].isNull());
    EXPECT_EQ(again.status, 409);
}

TEST(Setup, RejectsWeakOrMissingDetails) {
    REQUIRE_SERVER();
    EXPECT_EQ(post("/api/auth/setup", J({{"username", "x"}})).status, 400);
    auto weak = owner(uniq("po"));
    weak["password"] = "short";
    EXPECT_EQ(post("/api/auth/setup", weak).status, 400);
}
