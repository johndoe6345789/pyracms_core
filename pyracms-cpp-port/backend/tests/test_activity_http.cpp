#include "owner_scope_support.h"

#include <set>

using namespace harness;

static std::set<std::string> kinds(const Json::Value &items) {
    std::set<std::string> out;
    for (const auto &i : items)
        out.insert(i["type"].asString());
    return out;
}

static void seedActivity(const Site &s) {
    auto a = s.admin.token, u = s.user.token;
    authorToken(s); // the author writes articles as a Moderator
    for (auto n : {"pub-a", "priv-a"})
        post("/api/articles", J({{"name", n}, {"displayName", n},
             {"content", "x"}, {"tenant_id", s.id}}), u);
    put("/api/articles/priv-a/private", J({{"tenant_id", s.id},
        {"is_private", true}}), u);
    auto [cid, fid] = seedBoard(s);
    auto th = post("/api/forum/threads", J({{"forumId", fid},
                   {"title", "Thr"}, {"content", "c"}, {"tenantId", s.id}}),
                   u);
    post("/api/forum/posts", J({{"threadId", th.json["id"].asInt()},
         {"content", "reply"}}), a);
    auto art = get("/api/articles/pub-a?tenant_id=" + std::to_string(s.id));
    post("/api/comments/article/" + std::to_string(art.json["id"].asInt()),
         J({{"body", "nice"}}), a);
}

TEST(Activity, PublicItemsOnlyAndScopedToSite) {
    REQUIRE_SERVER();
    auto s = makeSite();
    seedActivity(s);
    auto r = get("/api/activity?tenant_id=" + std::to_string(s.id));
    ASSERT_EQ(r.status, 200);
    auto k = kinds(r.json);
    for (const char *t : {"article", "thread", "post", "comment", "user"})
        EXPECT_TRUE(k.count(t)) << t;
    EXPECT_NE(r.text.find("pub-a"), std::string::npos);
    EXPECT_EQ(r.text.find("priv-a"), std::string::npos);
    EXPECT_EQ(r.text.find("@h.test"), std::string::npos);
    EXPECT_FALSE(r.json[0]["createdAt"].asString().empty());
    auto other = makeSite();
    auto o = get("/api/activity?tenant_id=" + std::to_string(other.id));
    EXPECT_EQ(o.text.find("pub-a"), std::string::npos);
    EXPECT_EQ(o.text.find(s.user.name), std::string::npos);
}

TEST(Activity, LimitClampAndValidation) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto base = "/api/activity?tenant_id=" + std::to_string(s.id);
    EXPECT_EQ(get(base + "&limit=1").json.size(), 1u);
    EXPECT_EQ(get(base + "&limit=0").json.size(), 1u);
    EXPECT_LE(get(base + "&limit=9999").json.size(), 50u);
    EXPECT_EQ(get(base + "&limit=abc").status, 200);
    EXPECT_EQ(get("/api/activity").status, 400);
    EXPECT_EQ(get("/api/activity?tenant_id=x").status, 400);
}
