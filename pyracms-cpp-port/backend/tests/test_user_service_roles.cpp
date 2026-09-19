#include "services/UserRole.h"
#include "services/UserService.h"

#include <gtest/gtest.h>

// Unit tests for the UserRole system.
// All tests here are DB-free: they exercise the UserRole enum, the
// hasMinRole() inline, and the roleFromLegacyAdminFlag() helper.
// Integration tests for setUserRole / getUserRole are tracked separately.

using namespace pyracms;

// ── Enum existence and numeric values ────────────────────────────────────────

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

// ── Role ordering
// ─────────────────────────────────────────────────────────────

TEST(UserRoleTest, SuperAdminOutranksAll) {
    EXPECT_GT(static_cast<int>(UserRole::SuperAdmin),
              static_cast<int>(UserRole::SiteAdmin));
    EXPECT_GT(static_cast<int>(UserRole::SuperAdmin),
              static_cast<int>(UserRole::Moderator));
    EXPECT_GT(static_cast<int>(UserRole::SuperAdmin),
              static_cast<int>(UserRole::User));
    EXPECT_GT(static_cast<int>(UserRole::SuperAdmin),
              static_cast<int>(UserRole::Guest));
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

// ── hasMinRole
// ────────────────────────────────────────────────────────────────

TEST(UserRoleTest, HasMinRoleSameRoleReturnsTrue) {
    EXPECT_TRUE(hasMinRole(UserRole::User, UserRole::User));
}

TEST(UserRoleTest, HasMinRoleHigherActualReturnsTrue) {
    EXPECT_TRUE(hasMinRole(UserRole::SuperAdmin, UserRole::User));
}

TEST(UserRoleTest, HasMinRoleLowerActualReturnsFalse) {
    EXPECT_FALSE(hasMinRole(UserRole::Guest, UserRole::User));
}
