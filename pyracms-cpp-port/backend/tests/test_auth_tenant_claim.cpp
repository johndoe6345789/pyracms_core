#include "services/AuthService.h"

#include <cstdlib>
#include <gtest/gtest.h>

using namespace pyracms;

TEST(AuthTenantClaimTest, PlatformTokenHasTenantZero) {
    AuthService auth;
    auto p = auth.verifyToken(auth.generateToken(1, "root"));
    ASSERT_TRUE(p);
    EXPECT_EQ(p->tenantId, 0);
}

TEST(AuthTenantClaimTest, TenantClaimRoundTrips) {
    AuthService auth;
    auto p = auth.verifyToken(auth.generateToken(7, "richard", 42));
    ASSERT_TRUE(p);
    EXPECT_EQ(p->userId, 7);
    EXPECT_EQ(p->username, "richard");
    EXPECT_EQ(p->tenantId, 42);
}

TEST(AuthTenantClaimTest, TokensForDifferentTenantsDiffer) {
    AuthService auth;
    EXPECT_NE(auth.generateToken(7, "richard", 1),
              auth.generateToken(7, "richard", 2));
}

TEST(AuthTenantClaimTest, TamperedTokenRejected) {
    AuthService auth;
    auto t = auth.generateToken(7, "richard", 42);
    t[t.size() - 3] = t[t.size() - 3] == 'A' ? 'B' : 'A';
    EXPECT_FALSE(auth.verifyToken(t));
}

TEST(AuthTenantClaimTest, TokenFromOtherSecretRejected) {
    setenv("JWT_SECRET", "other-secret", 1);
    AuthService other;
    auto t = other.generateToken(7, "richard", 42);
    unsetenv("JWT_SECRET");
    AuthService def;
    EXPECT_FALSE(def.verifyToken(t));
}
