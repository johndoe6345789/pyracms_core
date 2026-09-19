#include "filters/UserAdminRules.h"

#include <gtest/gtest.h>

using namespace pyracms;

namespace {
AdminActor actor(int role, int tenant = 5, int id = 1) {
    return {id, role, tenant};
}
AdminTarget target(int role, int tenant = 5, int id = 2) {
    AdminTarget t;
    t.id = id;
    t.role = role;
    t.tenant = tenant;
    return t;
}
int st(const AdminActor &a, const AdminTarget &t, AdminAction x,
       int nr = -1) {
    return canAdminister(a, t, x, nr).status;
}
} // namespace

TEST(UserAdminRules, NonAdminsAreRefused) {
    for (int r : {0, 1, 2})
        EXPECT_EQ(st(actor(r), target(1), AdminAction::Edit), 403);
}

TEST(UserAdminRules, AdminActsInOwnTenantOnly) {
    EXPECT_EQ(st(actor(3), target(1), AdminAction::Ban), 0);
    EXPECT_EQ(st(actor(3), target(1, 6), AdminAction::Ban), 404);
    EXPECT_EQ(st(actor(3), target(1, 0), AdminAction::Delete), 404);
    EXPECT_EQ(st(actor(3, 0), target(1, 5), AdminAction::Ban), 404);
}

TEST(UserAdminRules, PlatformOwnerActsAnywhere) {
    EXPECT_EQ(st(actor(4, 0), target(1, 5), AdminAction::Delete), 0);
    EXPECT_EQ(st(actor(4, 0), target(3, 9), AdminAction::Ban), 0);
}

TEST(UserAdminRules, EqualOrHigherRoleIsProtected) {
    EXPECT_EQ(st(actor(3), target(3), AdminAction::Ban), 403);
    EXPECT_EQ(st(actor(3), target(3), AdminAction::Delete), 403);
    EXPECT_EQ(st(actor(3), target(3), AdminAction::SetRole, 1), 403);
    EXPECT_EQ(st(actor(3), target(3), AdminAction::Edit), 403);
    EXPECT_EQ(st(actor(3), target(4, 0), AdminAction::Ban), 404);
    EXPECT_EQ(st(actor(3), target(2), AdminAction::Ban), 0);
}

TEST(UserAdminRules, AnyoneMayEditOwnProfile) {
    EXPECT_EQ(st(actor(1), target(1, 5, 1), AdminAction::Edit), 0);
}

TEST(UserAdminRules, SelfMayOnlyEditProfile) {
    EXPECT_EQ(st(actor(3), target(3, 5, 1), AdminAction::Edit), 0);
    EXPECT_EQ(st(actor(3), target(3, 5, 1), AdminAction::SetRole, 1), 403);
    EXPECT_EQ(st(actor(3), target(3, 5, 1), AdminAction::Ban), 403);
    EXPECT_EQ(st(actor(4, 0), target(4, 0, 1), AdminAction::Delete), 403);
    EXPECT_EQ(st(actor(4, 0), target(4, 0, 1), AdminAction::SetRole, 2), 403);
}
