#include "owner_scope_support.h"

using namespace harness;

namespace {
int seedItem(const Site &s, int &group) {
    post("/api/menu-groups", J({{"name", "G"}, {"tenantId", s.id}}),
         s.admin.token);
    group = maxId("menu_groups");
    post("/api/menu-groups/" + std::to_string(group) + "/items",
         J({{"name", "I"}, {"url", "/x"}}), s.admin.token);
    return maxId("menu_items");
}
} // namespace

TEST(OwnerScopeMenu, OwnerEditsOwnMenusWithoutNamingTenant) {
    REQUIRE_SERVER();
    auto o = ownedSite();
    auto t = o.owner.token;
    int g = 0;
    auto is = std::to_string(seedItem(o.site, g));
    auto gs = std::to_string(g);
    EXPECT_EQ(post("/api/menu-groups/" + gs + "/items",
                   J({{"name", "J"}, {"url", "/y"}}), t).status, 200);
    EXPECT_EQ(put("/api/menus/" + is, J({{"url", "/z"}}), t).status, 200);
    EXPECT_EQ(del("/api/menus/" + is, t).status, 200);
    EXPECT_EQ(del("/api/menu-groups/" + gs, t).status, 200);
}

TEST(OwnerScopeMenu, OwnerCannotReachAnotherSitesMenus) {
    REQUIRE_SERVER();
    auto o = ownedSite();
    auto t = o.owner.token;
    auto other = makeSite();
    int g = 0;
    int item = seedItem(other, g);
    auto is = std::to_string(item), gs = std::to_string(g);
    auto mine = J({{"url", "/z"}, {"tenantId", o.site.id}});
    EXPECT_EQ(put("/api/menus/" + is, mine, t).status, 404);
    EXPECT_EQ(post("/api/menu-groups/" + gs + "/items",
                   J({{"name", "J"}, {"tenantId", o.site.id}}), t).status,
              404);
    EXPECT_EQ(del("/api/menu-groups/" + gs, t,
                  J({{"tenantId", o.site.id}})).status, 404);
    EXPECT_EQ(put("/api/menus/" + is, J({{"url", "/z"}}), t).status, 403);
    EXPECT_EQ(del("/api/menus/" + is, t).status, 403);
    EXPECT_EQ(del("/api/menus/" + is, o.site.user.token).status, 403);
}
