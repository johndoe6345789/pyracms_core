#include "filters/TenantOfTarget.h"

#include <gtest/gtest.h>

using namespace pyracms;

TEST(AdminTarget, PathsMapToRows) {
    auto t = adminTargetOf("/api/forum/categories/7", 0);
    EXPECT_EQ(t.kind, AdminKind::ForumCategory);
    EXPECT_EQ(t.id, 7);
    EXPECT_EQ(adminTargetOf("/api/forum/forums/8", 0).kind, AdminKind::Forum);
    EXPECT_EQ(adminTargetOf("/api/menu-groups/9/items", 0).id, 9);
    EXPECT_EQ(adminTargetOf("/api/menus/3", 0).kind, AdminKind::MenuItem);
    auto c = adminTargetOf("/api/forum/forums", 5);
    EXPECT_EQ(c.kind, AdminKind::ForumCategory);
    EXPECT_EQ(c.id, 5);
}

TEST(AdminTarget, CreatesAndJunkHaveNoRow) {
    EXPECT_EQ(adminTargetOf("/api/forum/categories", 0).kind,
              AdminKind::None);
    EXPECT_EQ(adminTargetOf("/api/settings/x", 0).kind, AdminKind::None);
    EXPECT_EQ(adminTargetOf("/api/menus/abc", 0).id, 0);
}

TEST(AdminTarget, NamedSiteMayOnlyAgreeWithTheRow) {
    EXPECT_EQ(chooseTenant(true, 4, 0).tenant, 4);
    EXPECT_EQ(chooseTenant(true, 4, 4).status, 0);
    EXPECT_EQ(chooseTenant(true, 4, 9).status, 404);
    EXPECT_EQ(chooseTenant(true, 0, 0).status, 404);
    EXPECT_EQ(chooseTenant(false, 0, 0).status, 403);
    EXPECT_EQ(chooseTenant(false, 0, 6).tenant, 6);
}
