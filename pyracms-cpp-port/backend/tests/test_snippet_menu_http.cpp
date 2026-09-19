#include "http_accounts.h"

using namespace harness;

TEST(SnippetHttp, CrudForkAndList) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto u = s.user.token;
    auto t = std::to_string(s.id);
    auto c = post("/api/snippets",
                  J({{"title", "S"}, {"code", "print(1)"},
                     {"tenant_id", s.id}}), u);
    ASSERT_TRUE(ok(c)) << c.text;
    EXPECT_EQ(post("/api/snippets", J({{"title", "S"}}), u).status, 400);
    auto id = std::to_string(c.json["id"].asInt());
    EXPECT_EQ(get("/api/snippets/" + id + "?tenant_id=" + t, u).status, 200);
    EXPECT_EQ(get("/api/snippets?tenant_id=" + t +
                  "&language=python&limit=2&offset=0&author_id=" +
                  std::to_string(s.user.id)).status, 200);
    EXPECT_EQ(get("/api/snippets").status, 400);
    EXPECT_EQ(put("/api/snippets/" + id, J({{"title", "S2"},
                  {"code", "x"}, {"tenant_id", s.id}}), u).status, 200);
    auto f = post("/api/snippets/" + id + "/fork",
                  J({{"tenant_id", s.id}}), s.admin.token);
    EXPECT_EQ(f.status, 201);
    EXPECT_EQ(post("/api/snippets/" + id + "/fork", J({{"x", 1}}), u)
                  .status, 400);
    EXPECT_NE(post("/api/snippets/" + id + "/run",
                   J({{"tenant_id", s.id}}), u).status, 0);
    EXPECT_EQ(del("/api/snippets/" + id + "?tenant_id=" + t, u).status, 200);
}

TEST(MenuHttp, GroupsAndItems) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto a = s.admin.token;
    auto g = post("/api/menu-groups",
                  J({{"name", "main"}, {"tenantId", s.id}}), a);
    ASSERT_TRUE(ok(g)) << g.text;
    auto gs = std::to_string(maxId("menu_groups"));
    EXPECT_EQ(post("/api/menu-groups", J({{"name", "x"}}), a).status, 400);
    EXPECT_EQ(get("/api/menu-groups?tenant_id=" + std::to_string(s.id))
                  .status, 200);
    auto it = post("/api/menu-groups/" + gs + "/items",
                   J({{"name", "Home"}, {"routePath", "/"}}), a);
    ASSERT_TRUE(ok(it)) << it.text;
    EXPECT_EQ(post("/api/menu-groups/" + gs + "/items", J({{"x", 1}}), a)
                  .status, 400);
    EXPECT_EQ(get("/api/menu-groups/" + gs + "/items").status, 200);
    auto is = std::to_string(maxId("menu_items"));
    EXPECT_EQ(put("/api/menus/" + is, J({{"name", "H2"}}), a).status, 200);
    EXPECT_EQ(del("/api/menus/" + is, a).status, 200);
    EXPECT_EQ(del("/api/menu-groups/" + gs, a).status, 200);
}
