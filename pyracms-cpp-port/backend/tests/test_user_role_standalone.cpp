#include "services/UserRole.h"

#include <gtest/gtest.h>

using namespace pyracms;

// ── Enum values ──────────────────────────────────────────────────────────────

TEST(UserRoleTest, GuestHasValueZero) {
    EXPECT_EQ(static_cast<int>(UserRole::Guest), 0);
}

TEST(UserRoleTest, UserHasValueOne) {
    EXPECT_EQ(static_cast<int>(UserRole::User), 1);
}

TEST(UserRoleTest, ModeratorHasValueTwo) {
    EXPECT_EQ(static_cast<int>(UserRole::Moderator), 2);
}

TEST(UserRoleTest, SiteAdminHasValueThree) {
    EXPECT_EQ(static_cast<int>(UserRole::SiteAdmin), 3);
}

TEST(UserRoleTest, SuperAdminHasValueFour) {
    EXPECT_EQ(static_cast<int>(UserRole::SuperAdmin), 4);
}

// ── Ordering ─────────────────────────────────────────────────────────────────

TEST(UserRoleTest, SuperAdminOutranksAll) {
    EXPECT_GT(static_cast<int>(UserRole::SuperAdmin),
              static_cast<int>(UserRole::SiteAdmin));
}

TEST(UserRoleTest, SiteAdminOutranksModerator) {
    EXPECT_GT(static_cast<int>(UserRole::SiteAdmin),
              static_cast<int>(UserRole::Moderator));
}

TEST(UserRoleTest, ModeratorOutranksUser) {
    EXPECT_GT(static_cast<int>(UserRole::Moderator),
              static_cast<int>(UserRole::User));
}

TEST(UserRoleTest, UserOutranksGuest) {
    EXPECT_GT(static_cast<int>(UserRole::User),
              static_cast<int>(UserRole::Guest));
}

// ── hasMinRole ───────────────────────────────────────────────────────────────

TEST(HasMinRoleTest, SameRoleReturnsTrue) {
    EXPECT_TRUE(hasMinRole(UserRole::User, UserRole::User));
}

TEST(HasMinRoleTest, HigherRoleReturnsTrue) {
    EXPECT_TRUE(hasMinRole(UserRole::SuperAdmin, UserRole::User));
}

TEST(HasMinRoleTest, LowerRoleReturnsFalse) {
    EXPECT_FALSE(hasMinRole(UserRole::Guest, UserRole::User));
}

TEST(HasMinRoleTest, GuestMeetsGuestMinimum) {
    EXPECT_TRUE(hasMinRole(UserRole::Guest, UserRole::Guest));
}

TEST(HasMinRoleTest, SuperAdminMeetsSuperAdminMinimum) {
    EXPECT_TRUE(hasMinRole(UserRole::SuperAdmin, UserRole::SuperAdmin));
}

TEST(HasMinRoleTest, SiteAdminDoesNotMeetSuperAdmin) {
    EXPECT_FALSE(hasMinRole(UserRole::SiteAdmin, UserRole::SuperAdmin));
}
