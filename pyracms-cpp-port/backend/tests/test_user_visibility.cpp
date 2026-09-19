#include "filters/UserVisibility.h"

#include <gtest/gtest.h>

using namespace pyracms;

constexpr int kUser = 1, kMod = 2, kAdmin = 3, kOwner = 4;

TEST(UserVisibilityTest, PlatformOwnerListsEveryScope) {
    EXPECT_EQ(userListScope(kOwner, 0), -1);
}

TEST(UserVisibilityTest, EveryoneElseListsOnlyOwnScope) {
    EXPECT_EQ(userListScope(kAdmin, 0), 0);
    EXPECT_EQ(userListScope(kAdmin, 5), 5);
    EXPECT_EQ(userListScope(kOwner, 5), 5);
}

TEST(UserVisibilityTest, EmailVisibleToSelf) {
    EXPECT_TRUE(canSeeEmail(kUser, 7, 2, 7, 2));
}

TEST(UserVisibilityTest, EmailHiddenFromOrdinaryUsers) {
    EXPECT_FALSE(canSeeEmail(kUser, 7, 2, 8, 2));
    EXPECT_FALSE(canSeeEmail(kMod, 7, 2, 8, 2));
}

TEST(UserVisibilityTest, AdminSeesEmailsInOwnTenantOnly) {
    EXPECT_TRUE(canSeeEmail(kAdmin, 7, 2, 8, 2));
    EXPECT_FALSE(canSeeEmail(kAdmin, 7, 2, 8, 3));
}

TEST(UserVisibilityTest, PlatformOwnerSeesAnyEmail) {
    EXPECT_TRUE(canSeeEmail(kOwner, 1, 0, 8, 3));
}

TEST(UserVisibilityTest, ViewingIsConfinedToOwnTenant) {
    EXPECT_TRUE(canViewUser(kUser, 2, 2));
    EXPECT_FALSE(canViewUser(kUser, 2, 3));
    EXPECT_FALSE(canViewUser(kUser, 0, 3));
    EXPECT_TRUE(canViewUser(kOwner, 0, 3));
}

TEST(UserVisibilityTest, LimitDefaultsAndClamps) {
    EXPECT_EQ(clampLimit("", 50, 200), 50);
    EXPECT_EQ(clampLimit("abc", 50, 200), 50);
    EXPECT_EQ(clampLimit("-3", 50, 200), 50);
    EXPECT_EQ(clampLimit("9999", 50, 200), 200);
    EXPECT_EQ(clampLimit("20", 50, 200), 20);
}

TEST(UserVisibilityTest, OffsetNeverNegativeOrGarbage) {
    EXPECT_EQ(clampOffset(""), 0);
    EXPECT_EQ(clampOffset("x"), 0);
    EXPECT_EQ(clampOffset("-4"), 0);
    EXPECT_EQ(clampOffset("30"), 30);
}
