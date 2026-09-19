#include "filters/UserAdminRules.h"

#include <gtest/gtest.h>

using namespace pyracms;

namespace {
AdminTarget tenantAcct(int role = 1) {
    AdminTarget t;
    t.id = 2;
    t.role = role;
    t.tenant = 5;
    t.actorOwnsTenant = true;
    return t;
}
int st(const AdminTarget &t, AdminAction x, int nr = -1) {
    AdminActor owner{1, 1, 0}; // platform token, stored role User
    return canAdminister(owner, t, x, nr).status;
}
} // namespace

TEST(UserAdminRulesOwner, OwnerAdministersOwnSiteAccounts) {
    for (int role : {1, 2, 3}) {
        EXPECT_EQ(st(tenantAcct(role), AdminAction::Edit), 0);
        EXPECT_EQ(st(tenantAcct(role), AdminAction::Ban), 0);
        EXPECT_EQ(st(tenantAcct(role), AdminAction::Delete), 0);
    }
}

TEST(UserAdminRulesOwner, OwnerGrantsUpToAdministratorOnly) {
    for (int role : {0, 1, 2, 3})
        EXPECT_EQ(st(tenantAcct(), AdminAction::SetRole, role), 0);
    EXPECT_EQ(st(tenantAcct(), AdminAction::SetRole, 4), 403);
    EXPECT_EQ(st(tenantAcct(), AdminAction::SetRole, 9), 400);
}

TEST(UserAdminRulesOwner, OwnerCannotChangeAnotherOwnerOrTopRole) {
    auto o = tenantAcct(3);
    o.siteOwner = true;
    EXPECT_EQ(st(o, AdminAction::Ban), 403);
    EXPECT_EQ(st(o, AdminAction::Delete), 403);
    EXPECT_EQ(st(o, AdminAction::SetRole, 1), 403);
    EXPECT_EQ(st(tenantAcct(4), AdminAction::Ban), 403);
    EXPECT_EQ(st(tenantAcct(4), AdminAction::Edit), 403);
}

TEST(UserAdminRulesOwner, NotOwnerOrPlatformAccountFallsBackToRoleRules) {
    auto t = tenantAcct();
    t.actorOwnsTenant = false;
    EXPECT_EQ(st(t, AdminAction::Ban), 403);
    t.actorOwnsTenant = true;
    t.tenant = 0; // platform accounts are never an owner's to manage
    EXPECT_EQ(st(t, AdminAction::Ban), 403);
}

TEST(UserAdminRulesOwner, OwnerCannotActOnSelf) {
    auto t = tenantAcct();
    t.id = 1;
    EXPECT_EQ(st(t, AdminAction::Ban), 403);
}
