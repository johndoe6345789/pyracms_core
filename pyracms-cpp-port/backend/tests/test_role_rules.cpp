#include "filters/RoleRules.h"

#include <gtest/gtest.h>

using namespace pyracms;

TEST(RoleRulesTest, OutOfRangeClampsToUser) {
    EXPECT_EQ(roleFromRaw(-1), UserRole::User);
    EXPECT_EQ(roleFromRaw(99), UserRole::User);
    EXPECT_EQ(roleFromRaw(3), UserRole::SiteAdmin);
}

TEST(RoleRulesTest, SiteAdminGateAllowsAdminsOnly) {
    EXPECT_FALSE(roleAllows(0, UserRole::SiteAdmin));
    EXPECT_FALSE(roleAllows(1, UserRole::SiteAdmin));
    EXPECT_FALSE(roleAllows(2, UserRole::SiteAdmin));
    EXPECT_TRUE(roleAllows(3, UserRole::SiteAdmin));
    EXPECT_TRUE(roleAllows(4, UserRole::SiteAdmin));
}

TEST(RoleRulesTest, CorruptRoleIsNeverAdmin) {
    EXPECT_FALSE(roleAllows(-5, UserRole::SiteAdmin));
    EXPECT_FALSE(roleAllows(100, UserRole::SiteAdmin));
}

TEST(RoleRulesTest, ModeratorGate) {
    EXPECT_TRUE(roleAllows(2, UserRole::Moderator));
    EXPECT_FALSE(roleAllows(1, UserRole::Moderator));
}
