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

TEST(SecuritySettings, OnlySiteAdminsWriteAndSecretsStayHidden) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto body = J({{"tenantId", s.id}, {"value", "v"}});
    EXPECT_EQ(put("/api/settings/site_name", body, s.user.token).status, 403);
    EXPECT_EQ(put("/api/settings/site_name", body, "").status, 401);
    EXPECT_EQ(put("/api/settings/site_name", body, s.admin.token).status, 200);
    EXPECT_EQ(put("/api/settings/smtp_password",
                  J({{"tenantId", s.id}, {"value", "hunter2"}}),
                  s.admin.token).status, 200);
    EXPECT_EQ(put("/api/settings/bad name", body, s.admin.token).status, 400);
    EXPECT_EQ(put("/api/settings/x", J({{"tenantId", s.id}, {"value", 5}}),
                  s.admin.token).status, 400);
    EXPECT_EQ(del("/api/settings/site_name", s.user.token,
                  J({{"tenantId", s.id}})).status, 403);
    for (const auto &tok : {std::string(), s.user.token}) {
        auto list = get("/api/settings" + tq(s), tok);
        EXPECT_EQ(list.text.find("hunter2"), std::string::npos);
        EXPECT_EQ(get("/api/settings/smtp_password" + tq(s), tok).status, 404);
        EXPECT_EQ(get("/api/settings/site_name" + tq(s), tok).status, 200);
    }
    EXPECT_EQ(get("/api/settings/smtp_password" + tq(s), s.admin.token)
                  .json["value"].asString(), "hunter2");
    auto other = makeSite();
    EXPECT_EQ(put("/api/settings/site_name", body, other.admin.token).status,
              403);
}
