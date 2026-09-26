#include "http_accounts.h"

using namespace harness;

TEST(MenuIcons, StoredOnCreateAndUpdateAndValidated) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto a = s.admin.token;
    post("/api/menu-groups", J({{"name", uniq("g")}, {"tenantId", s.id}}), a);
    auto items = "/api/menu-groups/" + std::to_string(maxId("menu_groups")) +
                 "/items";
    EXPECT_EQ(post(items, J({{"name", "n"}, {"routePath", "/x"},
                             {"icon", "Train Outlined"}}), a).status, 400);
    ASSERT_EQ(post(items, J({{"name", "n"}, {"routePath", "/x"},
                             {"icon", "TrainOutlined"}}), a).status, 200);
    auto id = std::to_string(maxId("menu_items"));
    auto first = get(items, a).json[0];
    EXPECT_EQ(first["icon"].asString(), "TrainOutlined");
    EXPECT_EQ(put("/api/menus/" + id, J({{"icon", "Home<b>"}}), a).status,
              400);
    EXPECT_EQ(put("/api/menus/" + id, J({{"icon", "HomeOutlined"}}), a)
                  .status, 200);
    EXPECT_EQ(get(items, a).json[0]["icon"].asString(), "HomeOutlined");
    EXPECT_EQ(put("/api/menus/" + id, J({{"icon", ""}}), a).status, 200);
    EXPECT_EQ(get(items, a).json[0]["icon"].asString(), "");
}
