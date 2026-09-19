#include "filters/TenantRules.h"

#include <gtest/gtest.h>

using namespace pyracms;

TEST(TenantRulesTest, PlatformTokenNeverNamesForeign) {
    EXPECT_FALSE(namesOtherTenant(0, "7"));
}

TEST(TenantRulesTest, SameTenantIsNotForeign) {
    EXPECT_FALSE(namesOtherTenant(3, "3"));
}

TEST(TenantRulesTest, OtherTenantIsForeign) {
    EXPECT_TRUE(namesOtherTenant(3, "4"));
}

TEST(TenantRulesTest, EmptyNameIsNotForeign) {
    EXPECT_FALSE(namesOtherTenant(3, ""));
}

TEST(TenantRulesTest, AnyForeignNameInListRejects) {
    EXPECT_TRUE(namesForeignTenant(3, {"", "3", "9"}));
    EXPECT_FALSE(namesForeignTenant(3, {"", "3"}));
    EXPECT_FALSE(namesForeignTenant(3, {}));
}

TEST(TenantRulesTest, TenantMatchesRules) {
    EXPECT_TRUE(tenantMatches(0, 5));
    EXPECT_TRUE(tenantMatches(5, 5));
    EXPECT_FALSE(tenantMatches(5, 6));
}

TEST(TenantRulesTest, EffectiveScopePrefersToken) {
    EXPECT_EQ(effectiveScope(3, "9"), 3);
    EXPECT_EQ(effectiveScope(0, "9"), 9);
    EXPECT_EQ(effectiveScope(0, ""), 0);
    EXPECT_EQ(effectiveScope(0, "junk"), 0);
}

TEST(TenantRulesTest, FirstNamedTenantSkipsEmptyAndGarbage) {
    EXPECT_EQ(firstNamedTenant({"", "x", "7", "9"}), 7);
    EXPECT_EQ(firstNamedTenant({"", ""}), 0);
    EXPECT_EQ(firstNamedTenant({"-2"}), 0);
}
