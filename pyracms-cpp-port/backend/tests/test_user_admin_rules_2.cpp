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

TEST(UserAdminRules, GrantsStayStrictlyBelowOwnRole) {
    for (int r : {0, 1, 2})
        EXPECT_EQ(st(actor(3), target(1), AdminAction::SetRole, r), 0);
    EXPECT_EQ(st(actor(3), target(1), AdminAction::SetRole, 3), 403);
    EXPECT_EQ(st(actor(3), target(1), AdminAction::SetRole, 4), 403);
    EXPECT_EQ(st(actor(4, 0), target(1), AdminAction::SetRole, 3), 0);
    EXPECT_EQ(st(actor(4, 0), target(1), AdminAction::SetRole, 4), 403);
}

TEST(UserAdminRules, BadRoleValueIs400) {
    EXPECT_EQ(st(actor(4, 0), target(1), AdminAction::SetRole, 7), 400);
    EXPECT_EQ(st(actor(4, 0), target(1), AdminAction::SetRole, -1), 400);
}

TEST(UserAdminRules, LastPlatformOwnerIsSafe) {
    auto t = target(4, 0);
    t.lastPlatformOwner = true;
    for (auto x : {AdminAction::Ban, AdminAction::Delete})
        EXPECT_EQ(st(actor(4, 0), t, x), 403);
    EXPECT_EQ(st(actor(4, 0), t, AdminAction::SetRole, 3), 403);
    t.lastPlatformOwner = false;
    EXPECT_EQ(st(actor(4, 0), t, AdminAction::Ban), 0);
}

TEST(UserAdminRules, SiteOwnerNeedsPlatformOwner) {
    auto t = target(2);
    t.siteOwner = true;
    EXPECT_EQ(st(actor(3), t, AdminAction::Ban), 403);
    EXPECT_EQ(st(actor(3), t, AdminAction::SetRole, 1), 403);
    EXPECT_EQ(st(actor(3), t, AdminAction::Delete), 403);
    EXPECT_EQ(st(actor(4, 0), t, AdminAction::Ban), 0);
}
