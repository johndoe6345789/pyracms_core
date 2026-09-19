#include "http_accounts.h"

using namespace harness;

namespace {
std::string tq(const Site &s) { return "?tenant_id=" + std::to_string(s.id); }
const std::string kPng = std::string("\x89PNG\r\n\x1a\n", 8) + "pixels";
} // namespace

TEST(SecurityTenantsAndSnippets, NamesAndCodeAreBounded) {
    REQUIRE_SERVER();
    auto pa = platformAdmin();
    for (const char *slug : {"Bad Slug", "UPPER", "api", "admin", "-x",
                             "a_b", "x.y"})
        EXPECT_EQ(post("/api/tenants",
                       J({{"slug", slug}, {"displayName", "N"}}),
                       pa.token).status, 400) << slug;
    EXPECT_EQ(post("/api/tenants", J({{"slug", std::string(64, 'a')},
                                       {"displayName", "N"}}), pa.token).status,
              400);
    EXPECT_EQ(post("/api/tenants", J({{"slug", uslug("ok")},
                                       {"displayName", 5}}), pa.token).status,
              400);
    auto s = makeSite();
    auto mk = [&](Json::Value b) {
        b["tenant_id"] = s.id;
        return post("/api/snippets", b, s.user.token).status;
    };
    EXPECT_EQ(mk(J({{"title", "t"}, {"code", "c"}, {"language", "py thon"}})),
              400);
    EXPECT_EQ(mk(J({{"title", "t"}, {"code", "c"}, {"visibility", "world"}})),
              400);
    EXPECT_EQ(mk(J({{"title", "t"}, {"code", std::string(100001, 'c')}})), 400);
    EXPECT_EQ(mk(J({{"title", "t"}, {"code", "print(1)"}})), 201);
}

TEST(SecurityUsers, ProfileUpdatesCannotTouchPrivilegedFields) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto path = "/api/users/" + std::to_string(s.user.id);
    // Asking for role/banned on one's own account is refused outright.
    auto bad = put(path, J({{"aboutme", "no"}, {"role", 4}}), s.user.token);
    EXPECT_EQ(bad.status, 403);
    bad = put(path, J({{"aboutme", "no"}, {"banned", true}}), s.user.token);
    EXPECT_EQ(bad.status, 403);
    // Other columns are simply not writable.
    auto r = put(path, J({{"aboutme", "hi"}, {"tenant_id", s.id},
                          {"password_hash", "x"}}),
                 s.user.token);
    EXPECT_EQ(r.status, 200);
    auto row = testDb()->execSqlSync(
        "SELECT role, banned, tenant_id, password_hash, aboutme FROM users "
        "WHERE id = $1", s.user.id);
    EXPECT_EQ(row[0]["role"].as<int>(), 1);
    EXPECT_FALSE(row[0]["banned"].as<bool>());
    EXPECT_EQ(row[0]["tenant_id"].as<int>(), s.id);
    EXPECT_NE(row[0]["password_hash"].as<std::string>(), "x");
    EXPECT_EQ(row[0]["aboutme"].as<std::string>(), "hi");
    EXPECT_EQ(put(path, J({{"website", "javascript:alert(1)"}}), s.user.token)
                  .status, 400);
    EXPECT_EQ(put(path, J({{"email", "bad\r\nx"}}), s.user.token).status, 400);
    EXPECT_EQ(put(path, J({{"aboutme", Json::Value(Json::arrayValue)}}),
                  s.user.token).status, 400);
    EXPECT_EQ(put(path, J({{"timezone", "../etc"}}), s.user.token).status, 400);
    EXPECT_EQ(put(path, J({{"website", "https://ok.example/p"}}), s.user.token)
                  .status, 200);
}
