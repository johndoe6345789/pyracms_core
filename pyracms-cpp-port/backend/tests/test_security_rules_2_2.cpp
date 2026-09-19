#include "filters/JwtAuthFilter.h"
#include "filters/RateLimitFilter.h"
#include "security/ClientIp.h"
#include "security/HttpSecurity.h"
#include "security/OAuthState.h"
#include "security/RateLimiter.h"
#include "security/SecurityConfig.h"
#include "security/SsrfGuard.h"
#include "services/DockerExecutionService.h"

#include <algorithm>
#include <cstdlib>
#include <gtest/gtest.h>

using namespace pyracms;

TEST(RateLimiterTest, FailureLockoutClearsOnSuccessAndAge) {
    double t = 0;
    RateLimiter rl([&] { return t; });
    for (int i = 0; i < 5; ++i)
        rl.fail("acct");
    EXPECT_TRUE(rl.locked("acct", 5, 900));
    EXPECT_FALSE(rl.locked("acct", 6, 900));
    t += 901;
    EXPECT_FALSE(rl.locked("acct", 5, 900));
    for (int i = 0; i < 5; ++i)
        rl.fail("acct");
    rl.succeed("acct");
    EXPECT_FALSE(rl.locked("acct", 5, 900));
}

TEST(RateLimiterTest, IdleKeysArePrunedSoMemoryStaysBounded) {
    double t = 0;
    RateLimiter rl([&] { return t; });
    for (int i = 0; i < 100; ++i)
        rl.allow("ip" + std::to_string(i), 5, 60);
    EXPECT_EQ(rl.size(), 100u);
    t += 7200;
    rl.allow("fresh", 5, 60);
    EXPECT_EQ(rl.size(), 1u);
}

TEST(RateLimitFilterTest, RulesCoverTheAbuseProneRoutes) {
    for (const char *p :
         {"/api/auth/login", "/api/auth/register", "/api/auth/forgot-password",
          "/api/auth/reset-password", "/api/auth/verify-email",
          "/api/auth/oauth/github/url", "/api/analytics/track", "/api/files",
          "/api/tenants", "/api/snippets/4/run"})
        EXPECT_FALSE(rateRuleFor(p).name.empty()) << p;
    EXPECT_TRUE(rateRuleFor("/api/articles").name.empty());
    EXPECT_LE(rateRuleFor("/api/auth/login").max, 10);
}

TEST(ClientIpTest, ForwardedHeaderOnlyTrustedFromPrivateProxies) {
    EXPECT_EQ(pickClientIp("172.18.0.5", "203.0.113.9"), "203.0.113.9");
    // a client-forged first entry is ignored: the proxy's is the last
    EXPECT_EQ(pickClientIp("172.18.0.5", "6.6.6.6, 203.0.113.9"),
              "203.0.113.9");
    EXPECT_EQ(pickClientIp("203.0.113.50", "6.6.6.6"), "203.0.113.50");
    EXPECT_EQ(pickClientIp("172.18.0.5", ""), "172.18.0.5");
    EXPECT_EQ(pickClientIp("172.18.0.5", "garbage"), "172.18.0.5");
    EXPECT_TRUE(isPrivateAddress("::1"));
    EXPECT_TRUE(isPrivateAddress("fd12::1"));
    EXPECT_TRUE(isPrivateAddress("::ffff:192.168.0.1"));
    EXPECT_FALSE(isPrivateAddress("2001:db8::1"));
}
