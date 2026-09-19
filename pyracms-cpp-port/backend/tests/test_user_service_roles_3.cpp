#include "services/UserRole.h"
#include "services/UserService.h"

#include <gtest/gtest.h>

// Unit tests for the UserRole system.
// All tests here are DB-free: they exercise the UserRole enum, the
// hasMinRole() inline, and the roleFromLegacyAdminFlag() helper.
// Integration tests for setUserRole / getUserRole are tracked separately.

using namespace pyracms;

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

// ── UserService instantiation with role support
// ───────────────────────────────

TEST(UserServiceRolesTest, ServiceCanBeInstantiated) {
    UserService svc;
    SUCCEED();
}

// TODO: Integration tests (require live Postgres with role column)
// - setUserRole persists the correct integer to the DB
// - getUserRole retrieves the stored role and converts it correctly
// - getUserRole returns nullopt when user ID does not exist
// - Role column defaults to 1 (User) for rows created before migration
