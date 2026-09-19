#include "services/UserRole.h"
#include "services/UserService.h"

#include <gtest/gtest.h>

// Unit tests for the UserRole system.
// All tests here are DB-free: they exercise the UserRole enum, the
// and hasMinRole() inline.
// Integration tests for setUserRole / getUserRole are tracked separately.

using namespace pyracms;

TEST(UserRoleTest, GuestFailsUserMinimum) {
    EXPECT_FALSE(hasMinRole(UserRole::Guest, UserRole::User));
}

TEST(UserRoleTest, UserFailsModeratorMinimum) {
    EXPECT_FALSE(hasMinRole(UserRole::User, UserRole::Moderator));
}

TEST(UserRoleTest, ModeratorPassesModeratorMinimum) {
    EXPECT_TRUE(hasMinRole(UserRole::Moderator, UserRole::Moderator));
}

TEST(UserRoleTest, SiteAdminPassesSiteAdminMinimum) {
    EXPECT_TRUE(hasMinRole(UserRole::SiteAdmin, UserRole::SiteAdmin));
}

TEST(UserRoleTest, SiteAdminFailsSuperAdminMinimum) {
    EXPECT_FALSE(hasMinRole(UserRole::SiteAdmin, UserRole::SuperAdmin));
}

TEST(UserRoleTest, SuperAdminPassesSuperAdminMinimum) {
    EXPECT_TRUE(hasMinRole(UserRole::SuperAdmin, UserRole::SuperAdmin));
}

TEST(UserRoleTest, SuperAdminPassesGuestMinimum) {
    EXPECT_TRUE(hasMinRole(UserRole::SuperAdmin, UserRole::Guest));
}

// ── UserDto role field
// ────────────────────────────────────────────────────────

TEST(UserRoleDtoTest, UserDtoDefaultRoleIsUser) {
    UserDto dto{};
    EXPECT_EQ(dto.role, UserRole::User);
}
