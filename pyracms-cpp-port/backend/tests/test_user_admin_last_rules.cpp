#include "filters/UserAdminRules.h"

#include <gtest/gtest.h>

using namespace pyracms;

namespace {
AdminTarget last(int role) {
    AdminTarget t;
    t.id = 2;
    t.role = role;
    t.tenant = 5;
    t.lastAdmin = true;
    return t;
}
int st(const AdminActor &a, const AdminTarget &t, AdminAction x,
       int nr = -1) {
    return canAdminister(a, t, x, nr).status;
}
const AdminActor kPlatform{1, 4, 0};
} // namespace

TEST(UserAdminLast, LastAdminCannotBeBannedDeletedOrDemoted) {
    auto t = last(3);
    EXPECT_EQ(st(kPlatform, t, AdminAction::Ban), 409);
    EXPECT_EQ(st(kPlatform, t, AdminAction::Delete), 409);
    for (int r : {0, 1, 2})
        EXPECT_EQ(st(kPlatform, t, AdminAction::SetRole, r), 409);
}

TEST(UserAdminLast, MessageNamesTheProblem) {
    auto v = canAdminister(kPlatform, last(3), AdminAction::Ban);
    EXPECT_NE(v.message.find("last administrator"), std::string::npos);
}

TEST(UserAdminLast, LastAdminMayStayAdministratorOrBeEdited) {
    auto t = last(3);
    EXPECT_EQ(st(kPlatform, t, AdminAction::Edit), 0);
    EXPECT_EQ(st(kPlatform, t, AdminAction::SetRole, 3), 0);
}

TEST(UserAdminLast, NotLastAdminIsFree) {
    auto t = last(3);
    t.lastAdmin = false;
    EXPECT_EQ(st(kPlatform, t, AdminAction::Ban), 0);
    EXPECT_EQ(st(kPlatform, t, AdminAction::SetRole, 1), 0);
}

TEST(UserAdminLast, SiteOwnerStillNeedsPlatformOwnerFirst) {
    auto t = last(1);
    t.siteOwner = true;
    EXPECT_EQ(st({9, 3, 5}, t, AdminAction::Ban), 403);
    EXPECT_EQ(st(kPlatform, t, AdminAction::Ban), 409);
}

TEST(UserAdminLast, OwnerActorAlsoCannotRemoveLastAdmin) {
    AdminActor owner{1, 1, 0};
    auto t = last(3);
    t.actorOwnsTenant = true;
    EXPECT_EQ(st(owner, t, AdminAction::Delete), 409);
    EXPECT_EQ(st(owner, t, AdminAction::SetRole, 2), 409);
    EXPECT_EQ(st(owner, t, AdminAction::SetRole, 3), 0);
}
