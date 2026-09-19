#include "http_accounts.h"

using namespace harness;

static const Json::Value kEmpty(Json::objectValue);

TEST(CommentHttp, ThreadVoteEditDeleteAndNotifications) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto a = s.admin.token;
    auto u = s.user.token;
    auto path = "/api/comments/article/" + std::to_string(s.id);
    EXPECT_EQ(post(path, J({{"x", 1}}), u).status, 400);
    EXPECT_EQ(post(path, J({{"body", ""}}), u).status, 400);
    auto c = post(path, J({{"body", "first"}}), u);
    ASSERT_EQ(c.status, 201);
    int cid = c.json["id"].asInt();
    auto r = post(path, J({{"body", "reply"}, {"parentId", cid}}), a);
    ASSERT_EQ(r.status, 201);
    EXPECT_EQ(get(path + "?limit=10&offset=0").json.size(), 2u);
    auto cs = "/api/comments/" + std::to_string(cid);
    EXPECT_EQ(post(cs + "/vote", J({{"isLike", true}}), a).status, 200);
    EXPECT_EQ(post(cs + "/vote", J({{"isLike", false}}), a).status, 200);
    EXPECT_EQ(post(cs + "/vote", J({{"x", 1}}), a).status, 400);
    EXPECT_EQ(put(cs, J({{"body", "edited"}}), u).status, 200);
    EXPECT_EQ(put(cs, J({{"body", "nope"}}), a).status, 404);
    EXPECT_EQ(put(cs, J({{"x", 1}}), u).status, 400);
    // The reply and the like produced notifications for the author.
    usleep(200000);
    auto n = get("/api/notifications?unread_only=true&limit=10&offset=0", u);
    ASSERT_EQ(n.status, 200);
    ASSERT_GE(n.json.size(), 1u);
    EXPECT_GE(get("/api/notifications/unread-count", u).json["count"]
                  .asInt(), 1);
    auto nid = std::to_string(n.json[0]["id"].asInt());
    EXPECT_EQ(put("/api/notifications/" + nid + "/read", kEmpty, u).status,
              200);
    EXPECT_EQ(put("/api/notifications/read-all", kEmpty, u).status, 200);
    EXPECT_EQ(del("/api/notifications/" + nid, u).status, 200);
    EXPECT_NE(del("/api/notifications/" + nid, u).status, 500);
    EXPECT_EQ(get("/api/notifications").status, 401);
    EXPECT_EQ(del(cs, a).status, 404);
    EXPECT_EQ(del(cs, u).status, 200);
}

TEST(SettingsHttp, ListGetSetAndRemove) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto a = s.admin.token;
    auto t = "?tenant_id=" + std::to_string(s.id);
    EXPECT_EQ(put("/api/settings/site_name", J({{"x", 1}}), a).status, 400);
    EXPECT_EQ(put("/api/settings/site_name",
                  J({{"tenantId", s.id}, {"value", "Hi"}}), a).status, 200);
    EXPECT_EQ(get("/api/settings" + t).json.size(), 1u);
    EXPECT_EQ(get("/api/settings").status, 400);
    EXPECT_EQ(get("/api/settings/site_name" + t).json["value"].asString(),
              "Hi");
    EXPECT_EQ(get("/api/settings/site_name").status, 400);
    EXPECT_EQ(get("/api/settings/missing" + t).status, 404);
    EXPECT_EQ(del("/api/settings/site_name", a, J({{"x", 1}})).status, 400);
    EXPECT_EQ(del("/api/settings/site_name", a,
                  J({{"tenantId", s.id}})).status, 200);
    EXPECT_EQ(del("/api/settings/site_name", a,
                  J({{"tenantId", s.id}})).status, 404);
}
