#include "http_accounts.h"

using namespace harness;

namespace {
std::string tq(const Site &s) { return "?tenant_id=" + std::to_string(s.id); }
const std::string kPng = std::string("\x89PNG\r\n\x1a\n", 8) + "pixels";
} // namespace

TEST(SecurityAnalytics, ReadsAreForAdminsAndTrackingIsBounded) {
    REQUIRE_SERVER();
    auto s = makeSite();
    for (const char *p : {"page-views", "top-content", "traffic-sources",
                          "search-queries"}) {
        auto url = std::string("/api/analytics/") + p + tq(s);
        EXPECT_EQ(get(url, s.user.token).status, 403) << p;
        EXPECT_EQ(get(url).status, 401) << p;
        EXPECT_EQ(get(url, s.admin.token).status, 200) << p;
    }
    auto other = makeSite();
    EXPECT_EQ(get("/api/analytics/page-views" + tq(s), other.admin.token)
                  .status, 403);
    auto bad = post("/api/analytics/track",
                    J({{"path", "/x"}, {"tenant_id", 999999}}));
    EXPECT_EQ(bad.status, 400);
    EXPECT_EQ(bad.text.find("violates"), std::string::npos);
    EXPECT_EQ(bad.text.find("constraint"), std::string::npos);
    EXPECT_EQ(post("/api/analytics/track",
                   J({{"path", "/" + std::string(900, 'p')},
                     {"tenant_id", s.id}}))
                  .status, 200);
    EXPECT_EQ(post("/api/analytics/track",
                   J({{"path", 5}, {"tenant_id", s.id}})).status, 400);
}

TEST(SecuritySocial, RepliesStayInTheirThreadAndFollowsStayOnTheirSite) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto c1 = post("/api/comments/article/1", J({{"body", "one"}}),
                   s.user.token);
    ASSERT_EQ(c1.status, 201);
    auto c2 = post("/api/comments/article/2", J({{"body", "two"}}),
                   s.user.token);
    ASSERT_EQ(c2.status, 201);
    auto reply = [&](const char *thread, int parent) {
        return post(std::string("/api/comments/") + thread,
                    J({{"body", "r"}, {"parentId", parent}}), s.user.token);
    };
    EXPECT_EQ(reply("article/1", c1.json["id"].asInt()).status, 201);
    EXPECT_EQ(reply("article/1", c2.json["id"].asInt()).status, 400);
    EXPECT_EQ(reply("article/1", 999999).status, 400);
    EXPECT_EQ(post("/api/comments/article/1",
                   J({{"body", std::string(10001, 'x')}}), s.user.token).status,
              400);
    EXPECT_EQ(post("/api/comments/article/1", J({{"body", 5}}), s.user.token)
                  .status, 400);
    auto other = makeSite();
    auto path = "/api/users/" + std::to_string(other.user.id) + "/follow";
    EXPECT_EQ(post(path, Json::Value(Json::objectValue), s.user.token).status,
              400);
    auto own = signup(s.slug);
    EXPECT_EQ(post("/api/users/" + std::to_string(own.id) + "/follow",
                   Json::Value(Json::objectValue), s.user.token).status, 200);
    EXPECT_EQ(get("/api/users/" + std::to_string(s.user.id) +
                  "/followers?limit=100000").status, 200);
}
