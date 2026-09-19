#include "services/UserRole.h"

#include <gtest/gtest.h>

using namespace pyracms;

TEST(HasMinRoleTest, ModeratorMeetsSiteAdminFalse) {
    EXPECT_FALSE(hasMinRole(UserRole::Moderator, UserRole::SiteAdmin));
}

TEST(HasMinRoleTest, ModeratorMeeetsModeratorTrue) {
    EXPECT_TRUE(hasMinRole(UserRole::Moderator, UserRole::Moderator));
}

// ── roleFromLegacyAdminFlag
// ───────────────────────────────────────────────────

TEST(LegacyFlagTest, AdminFlagMapsToSiteAdmin) {
    EXPECT_EQ(roleFromLegacyAdminFlag(true), UserRole::SiteAdmin);
}

TEST(LegacyFlagTest, NonAdminFlagMapsToUser) {
    EXPECT_EQ(roleFromLegacyAdminFlag(false), UserRole::User);
}

TEST(LegacyFlagTest, SiteAdminPassesAdminMinimum) {
    EXPECT_TRUE(hasMinRole(roleFromLegacyAdminFlag(true), UserRole::SiteAdmin));
}

TEST(LegacyFlagTest, SiteAdminFailsSuperAdminMinimum) {
    EXPECT_FALSE(
        hasMinRole(roleFromLegacyAdminFlag(true), UserRole::SuperAdmin));
}

TEST(LegacyFlagTest, UserPassesUserMinimum) {
    EXPECT_TRUE(hasMinRole(roleFromLegacyAdminFlag(false), UserRole::User));
}

TEST(LegacyFlagTest, UserFailsModeratorMinimum) {
    EXPECT_FALSE(
        hasMinRole(roleFromLegacyAdminFlag(false), UserRole::Moderator));
}
