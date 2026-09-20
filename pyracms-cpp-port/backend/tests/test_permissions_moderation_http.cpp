#include "http_accounts.h"

using namespace harness;

TEST(Permissions, ModeratorDeletesAnyCommentOnlyOnOwnSite) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = makeSite();
    auto mod = signup(s.slug, 2);
    auto foreign = signup(other.slug, 2);
    auto path = "/api/comments/article/" + std::to_string(s.id);
    auto mk = [&] {
        auto c = post(path, J({{"body", "hi"}}), s.user.token);
        return "/api/comments/" + std::to_string(c.json["id"].asInt());
    };
    auto c1 = mk();
    EXPECT_EQ(del(c1, foreign.token).status, 404);
    EXPECT_EQ(del(c1, signup(s.slug, 1).token).status, 404);
    EXPECT_EQ(del(c1, mod.token).status, 200);
    auto c2 = mk();
    EXPECT_EQ(del(c2, s.admin.token).status, 200);
    // Editing somebody else's words is not offered, even to moderators.
    auto c3 = mk();
    EXPECT_EQ(put(c3, J({{"body", "x"}}), mod.token).status, 404);
}

TEST(Permissions, ModeratorDeletesAnySnippetOnlyOnOwnSite) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = makeSite();
    auto mod = signup(s.slug, 2);
    auto foreign = signup(other.slug, 2);
    auto mk = [&] {
        auto c = post("/api/snippets",
                      J({{"title", "S"}, {"code", "1"},
                         {"tenant_id", s.id}}), s.user.token);
        return "/api/snippets/" + std::to_string(c.json["id"].asInt());
    };
    auto p1 = mk();
    EXPECT_EQ(del(p1, foreign.token).status, 404);
    EXPECT_EQ(del(p1, mod.token).status, 200);
    EXPECT_EQ(del(mk(), s.admin.token).status, 200);
}
