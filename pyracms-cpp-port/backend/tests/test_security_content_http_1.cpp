#include "http_accounts.h"

using namespace harness;

namespace {
std::string mkArticle(const Site &s, const std::string &token,
                      const std::string &content = "body") {
    auto name = uniq("sa");
    post("/api/articles", J({{"name", name}, {"displayName", "T"},
                             {"content", content}, {"tenant_id", s.id}}),
         token);
    return name;
}
std::string tq(const Site &s) { return "?tenant_id=" + std::to_string(s.id); }
} // namespace

TEST(SecurityArticles, OnlyAuthorsAndStaffMayChangeAnArticle) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = signup(s.slug);
    auto name = mkArticle(s, s.user.token);
    auto base = "/api/articles/" + name;
    auto upd = J({{"content", "hijack"}, {"tenant_id", s.id}});
    EXPECT_EQ(put(base, upd, other.token).status, 403);
    EXPECT_EQ(put(base + "/renderer", J({{"renderer", "html"},
                                          {"tenant_id", s.id}}),
                  other.token).status, 403);
    EXPECT_EQ(put(base + "/private", J({{"tenant_id", s.id}}),
                  other.token).status, 403);
    EXPECT_EQ(post(base + "/unpublish", J({{"tenant_id", s.id}}),
                   other.token).status, 403);
    EXPECT_EQ(del(base + tq(s), other.token).status, 403);
    EXPECT_EQ(put(base, upd, "").status, 401);
    EXPECT_EQ(put(base, upd, s.user.token).status, 200);
    auto mod = signup(s.slug, 2);
    EXPECT_EQ(put(base, upd, mod.token).status, 200);
    EXPECT_EQ(del(base + tq(s), other.token).status, 403);
    EXPECT_EQ(del(base + tq(s), s.user.token).status, 200);
}

TEST(SecurityArticles, TenantAccountsCannotReachOtherSites) {
    REQUIRE_SERVER();
    auto a = makeSite();
    auto b = makeSite();
    auto name = mkArticle(a, a.user.token);
    auto upd = J({{"content", "x"}, {"tenant_id", a.id}});
    EXPECT_EQ(put("/api/articles/" + name, upd, b.admin.token).status, 403);
    EXPECT_EQ(del("/api/articles/" + name + tq(a), b.admin.token).status, 403);
    // the other site's own article name does not resolve inside site a
    EXPECT_EQ(put("/api/articles/" + name,
                  J({{"content", "x"}, {"tenant_id", b.id}}),
                  b.admin.token).status, 404);
}
