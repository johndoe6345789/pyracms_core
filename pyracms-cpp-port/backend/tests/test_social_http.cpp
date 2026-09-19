#include "http_accounts.h"

using namespace harness;

static const Json::Value kEmpty(Json::objectValue);

TEST(SocialHttp, FollowActivityAndReputation) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto a = s.admin.token;
    auto base = "/api/users/" + std::to_string(s.user.id);
    EXPECT_EQ(post(base + "/follow", kEmpty, a).status, 200);
    EXPECT_NE(post(base + "/follow", kEmpty, a).status, 500);
    EXPECT_EQ(post(base + "/follow", kEmpty, s.user.token).status, 400);
    EXPECT_EQ(get(base + "/followers?limit=5").json["total"].asInt(), 1);
    EXPECT_EQ(get("/api/users/" + std::to_string(s.admin.id) +
                  "/following?limit=5").json["total"].asInt(), 1);
    EXPECT_EQ(get(base + "/activity?limit=5").status, 200);
    EXPECT_EQ(get(base + "/achievements").status, 200);
    EXPECT_EQ(get(base + "/reputation").status, 200);
    EXPECT_EQ(del(base + "/follow", a).status, 200);
    EXPECT_EQ(post(base + "/follow", kEmpty).status, 401);
}

TEST(UserHttp, ListGetUpdateAndPassword) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto u = s.user;
    auto base = "/api/users/" + std::to_string(u.id);
    EXPECT_EQ(get("/api/users?limit=3&offset=0", u.token).status, 200);
    EXPECT_EQ(get(base, u.token).status, 200);
    EXPECT_EQ(get("/api/users/999999", u.token).status, 404);
    EXPECT_EQ(put(base, J({{"website", "https://x.test"}, {"aboutme", "a"}}),
                  u.token).status, 200);
    EXPECT_EQ(put(base, J({{"aboutme", "b"}}), s.admin.token).status, 403);
    EXPECT_EQ(put(base + "/password", J({{"x", 1}}), u.token).status, 400);
    EXPECT_EQ(put(base + "/password", J({{"currentPassword", "wrongwrong"},
                  {"newPassword", "brandnew123"}}), u.token).status, 401);
    EXPECT_EQ(put(base + "/password", J({{"currentPassword", "password123"},
                  {"newPassword", "short"}}), u.token).status, 400);
    EXPECT_EQ(put(base + "/password", J({{"currentPassword", "password123"},
                  {"newPassword", "brandnew123"}}), u.token).status, 200);
    EXPECT_EQ(put(base + "/password", J({{"currentPassword", "x"},
                  {"newPassword", "brandnew123"}}), s.admin.token).status,
              403);
}
