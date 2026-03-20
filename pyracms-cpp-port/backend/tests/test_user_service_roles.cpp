#include <gtest/gtest.h>
#include "services/UserRole.h"
#include "services/UserService.h"

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

// ── Role ordering ─────────────────────────────────────────────────────────────

TEST(UserRoleTest, SuperAdminOutranksAll) {
    EXPECT_GT(
        static_cast<int>(UserRole::SuperAdmin),
        static_cast<int>(UserRole::SiteAdmin));
    EXPECT_GT(
        static_cast<int>(UserRole::SuperAdmin),
        static_cast<int>(UserRole::Moderator));
    EXPECT_GT(
        static_cast<int>(UserRole::SuperAdmin),
        static_cast<int>(UserRole::User));
    EXPECT_GT(
        static_cast<int>(UserRole::SuperAdmin),
        static_cast<int>(UserRole::Guest));
}

TEST(UserRoleTest, SiteAdminOutranksModerator) {
    EXPECT_GT(
        static_cast<int>(UserRole::SiteAdmin),
        static_cast<int>(UserRole::Moderator));
}

TEST(UserRoleTest, ModeratorOutranksUser) {
    EXPECT_GT(
        static_cast<int>(UserRole::Moderator),
        static_cast<int>(UserRole::User));
}

TEST(UserRoleTest, UserOutranksGuest) {
    EXPECT_GT(
        static_cast<int>(UserRole::User),
        static_cast<int>(UserRole::Guest));
}

// ── hasMinRole ────────────────────────────────────────────────────────────────

TEST(UserRoleTest, HasMinRoleSameRoleReturnsTrue) {
    EXPECT_TRUE(hasMinRole(UserRole::User, UserRole::User));
}

TEST(UserRoleTest, HasMinRoleHigherActualReturnsTrue) {
    EXPECT_TRUE(hasMinRole(UserRole::SuperAdmin, UserRole::User));
}

TEST(UserRoleTest, HasMinRoleLowerActualReturnsFalse) {
    EXPECT_FALSE(hasMinRole(UserRole::Guest, UserRole::User));
}

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

// ── Legacy admin-flag migration ───────────────────────────────────────────────

TEST(UserRoleTest, LegacyAdminTrueMapsTOSiteAdmin) {
    EXPECT_EQ(roleFromLegacyAdminFlag(true), UserRole::SiteAdmin);
}

TEST(UserRoleTest, LegacyAdminFalseMapsToUser) {
    EXPECT_EQ(roleFromLegacyAdminFlag(false), UserRole::User);
}

TEST(UserRoleTest, LegacyAdminSiteAdminPassesAdminMinimum) {
    auto role = roleFromLegacyAdminFlag(true);
    EXPECT_TRUE(hasMinRole(role, UserRole::SiteAdmin));
}

TEST(UserRoleTest, LegacyAdminSiteAdminFailsSuperAdminMinimum) {
    auto role = roleFromLegacyAdminFlag(true);
    EXPECT_FALSE(hasMinRole(role, UserRole::SuperAdmin));
}

TEST(UserRoleTest, LegacyNonAdminUserPassesUserMinimum) {
    auto role = roleFromLegacyAdminFlag(false);
    EXPECT_TRUE(hasMinRole(role, UserRole::User));
}

TEST(UserRoleTest, LegacyNonAdminUserFailsModeratorMinimum) {
    auto role = roleFromLegacyAdminFlag(false);
    EXPECT_FALSE(hasMinRole(role, UserRole::Moderator));
}

// ── UserDto role field ────────────────────────────────────────────────────────

TEST(UserRoleDtoTest, UserDtoDefaultRoleIsUser) {
    UserDto dto{};
    EXPECT_EQ(dto.role, UserRole::User);
}

TEST(UserRoleDtoTest, UserDtoRoleCanBeSetToSiteAdmin) {
    UserDto dto{};
    dto.role = UserRole::SiteAdmin;
    EXPECT_EQ(dto.role, UserRole::SiteAdmin);
}

TEST(UserRoleDtoTest, UserDtoRoleCanBeSetToSuperAdmin) {
    UserDto dto{};
    dto.role = UserRole::SuperAdmin;
    EXPECT_TRUE(hasMinRole(dto.role, UserRole::SuperAdmin));
}

// ── UserService instantiation with role support ───────────────────────────────

TEST(UserServiceRolesTest, ServiceCanBeInstantiated) {
    UserService svc;
    SUCCEED();
}

// TODO: Integration tests (require live Postgres with role column)
// - setUserRole persists the correct integer to the DB
// - getUserRole retrieves the stored role and converts it correctly
// - getUserRole returns nullopt when user ID does not exist
// - Role column defaults to 1 (User) for rows created before migration
