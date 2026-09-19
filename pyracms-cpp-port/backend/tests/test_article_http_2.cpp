#include "http_accounts.h"

using namespace harness;

static std::string mk(const Site &s, const std::string &tok) {
    auto name = uniq("st");
    post("/api/articles",
         J({{"name", name}, {"displayName", "A"}, {"content", "c"},
            {"tenant_id", s.id}}),
         tok);
    return "/api/articles/" + name;
}

TEST(ArticleHttp, StateChangingEndpoints) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto tok = s.admin.token;
    auto base = mk(s, tok);
    auto tid = J({{"tenant_id", s.id}});
    EXPECT_EQ(put(base + "/renderer", J({{"renderer", "html"},
                                         {"tenant_id", s.id}}), tok).status,
              200);
    EXPECT_EQ(put(base + "/renderer", tid, tok).status, 400);
    EXPECT_EQ(put(base + "/private", tid, tok).status, 200);
    EXPECT_EQ(put(base + "/private", J({{"a", 1}}), tok).status, 400);
    auto vote = J({{"is_like", true}, {"tenant_id", s.id}});
    EXPECT_EQ(post(base + "/vote", vote, s.user.token).status, 200);
    EXPECT_EQ(post(base + "/vote", tid, s.user.token).status, 400);
    auto tags = J({{"tags", A({"a", "b"})}, {"tenant_id", s.id}});
    EXPECT_EQ(put(base + "/tags", tags, tok).status, 200);
    EXPECT_EQ(put(base + "/tags", tid, tok).status, 400);
    EXPECT_EQ(post(base + "/publish", tid, tok).status, 200);
    EXPECT_EQ(post(base + "/publish", J({{"a", 1}}), tok).status, 400);
    EXPECT_EQ(post(base + "/unpublish", tid, tok).status, 200);
    EXPECT_EQ(post(base + "/unpublish", J({{"a", 1}}), tok).status, 400);
    auto sch = J({{"tenant_id", s.id}, {"scheduled_at", "2099-01-01 00:00"}});
    EXPECT_EQ(post(base + "/schedule", sch, tok).status, 200);
    EXPECT_EQ(post(base + "/schedule", tid, tok).status, 400);
    auto cloud = get("/api/articles/tags/cloud?tenant_id=" +
                     std::to_string(s.id));
    EXPECT_EQ(cloud.status, 200);
    EXPECT_EQ(get("/api/articles/tags/cloud").status, 400);
    EXPECT_EQ(get(base + "?tenant_id=" + std::to_string(s.id)).status, 200);
}

TEST(ArticleHttp, RequiresLoginAndTenantMatch) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = makeSite();
    auto base = mk(s, s.admin.token);
    auto body = J({{"content", "x"}, {"tenant_id", s.id}});
    EXPECT_EQ(put(base, body, "").status, 401);
    EXPECT_EQ(put(base, body, other.admin.token).status, 403);
}
