#include "services/UserRole.h"

#include <gtest/gtest.h>

using namespace pyracms;

TEST(HasMinRoleTest, ModeratorMeetsSiteAdminFalse) {
    EXPECT_FALSE(hasMinRole(UserRole::Moderator, UserRole::SiteAdmin));
}

TEST(HasMinRoleTest, ModeratorMeeetsModeratorTrue) {
    EXPECT_TRUE(hasMinRole(UserRole::Moderator, UserRole::Moderator));
}
