#include "http_accounts.h"

using namespace harness;

namespace {
int mkGroup(const Site &s) {
    post("/api/menu-groups", J({{"name", uniq("g")}, {"tenantId", s.id}}),
         s.admin.token);
    return maxId("menu_groups");
}
int mkItem(const Site &s, int group, const char *type, int parent = 0) {
    auto r = post("/api/menu-groups/" + std::to_string(group) + "/items",
                  J({{"name", "n"}, {"type", type}, {"routePath", "/x"},
                     {"parentId", parent}}), s.admin.token);
    return r.status == 200 || r.status == 201 ? maxId("menu_items") : -1;
}
Json::Value items(const Site &s, int group) {
    return get("/api/menu-groups/" + std::to_string(group) + "/items",
               s.admin.token).json;
}
} // namespace

TEST(MenuFolders, LinksGoInFoldersAndComeOutAgain) {
    REQUIRE_SERVER();
    auto s = makeSite();
    int g = mkGroup(s);
    int folder = mkItem(s, g, "folder");
    int link = mkItem(s, g, "route", folder);
    ASSERT_GT(link, 0);
    int parentOf = 0;
    for (const auto &i : items(s, g))
        if (i["id"].asInt() == link)
            parentOf = i["parentId"].asInt();
    EXPECT_EQ(parentOf, folder);
    auto up = "/api/menus/" + std::to_string(link);
    EXPECT_EQ(put(up, J({{"parentId", 0}}), s.admin.token).status, 200);
    EXPECT_EQ(put(up, J({{"parentId", folder}}), s.admin.token).status, 200);
    EXPECT_EQ(del("/api/menus/" + std::to_string(folder), s.admin.token)
                  .status, 200);
    for (const auto &i : items(s, g)) // the link outlives its folder
        if (i["id"].asInt() == link)
            EXPECT_EQ(i["parentId"].asInt(), 0);
}

TEST(MenuFolders, OnlyRealTopLevelFoldersOfTheSameGroupAreParents) {
    REQUIRE_SERVER();
    auto s = makeSite();
    int g = mkGroup(s), other = mkGroup(s);
    int folder = mkItem(s, g, "folder");
    int plain = mkItem(s, g, "route");
    int elsewhere = mkItem(s, other, "folder");
    EXPECT_EQ(mkItem(s, g, "route", plain), -1);      // not a folder
    EXPECT_EQ(mkItem(s, g, "route", elsewhere), -1);  // another group's
    EXPECT_EQ(mkItem(s, g, "folder", folder), -1);    // folders don't nest
    auto up = "/api/menus/" + std::to_string(plain);
    EXPECT_EQ(put(up, J({{"parentId", plain}}), s.admin.token).status, 404);
    EXPECT_EQ(put(up, J({{"parentId", elsewhere}}), s.admin.token).status,
              404);
    EXPECT_EQ(put("/api/menus/" + std::to_string(folder),
                  J({{"parentId", folder}}), s.admin.token).status, 404);
}
