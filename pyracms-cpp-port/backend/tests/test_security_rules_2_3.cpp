#include "port.h"
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

TEST(OAuthStateTest, SignedAndExpiring) {
    auto s = makeOAuthState(1000, 600);
    EXPECT_TRUE(verifyOAuthState(s, 1000));
    EXPECT_TRUE(verifyOAuthState(s, 1600));
    EXPECT_FALSE(verifyOAuthState(s, 1601));
    auto forged = s;
    forged[forged.size() - 1] = forged.back() == 'a' ? 'b' : 'a';
    EXPECT_FALSE(verifyOAuthState(forged, 1000));
    for (const char *bad : {"", "pyracms", "a.b", "a.9999999999.deadbeef"})
        EXPECT_FALSE(verifyOAuthState(bad, 1000)) << bad;
    EXPECT_NE(makeOAuthState(1000), makeOAuthState(1000));
}

TEST(SecurityConfigTest, ProductionRefusesWeakSecrets) {
    EXPECT_NE(weakSecretReason(nullptr), "");
    EXPECT_NE(weakSecretReason(""), "");
    EXPECT_NE(weakSecretReason("change-me-in-production"), "");
    EXPECT_NE(weakSecretReason("pyracms-dev-secret-change-in-production"), "");
    EXPECT_NE(weakSecretReason("dev-only-insecure-jwt-secret-do-not-use"),
              "");
    EXPECT_NE(weakSecretReason("short"), "");
    EXPECT_EQ(weakSecretReason("k9Zp2mQx7vLw4nRt8cYb1sHd6fGj3aEu5o"), "");
}

TEST(SecurityConfigTest, StartupGateOnlyBitesInProduction) {
    setenv("JWT_SECRET", "x", 1);
    unsetenv("PYRACMS_ENV");
    EXPECT_EQ(startupSecurityError(), "");
    setenv("PYRACMS_ENV", "production", 1);
    EXPECT_TRUE(isProduction());
    EXPECT_NE(startupSecurityError(), "");
    setenv("JWT_SECRET", "k9Zp2mQx7vLw4nRt8cYb1sHd6fGj3aEu5o", 1);
    EXPECT_EQ(startupSecurityError(), "");
    unsetenv("PYRACMS_ENV");
    unsetenv("JWT_SECRET");
    // no environment secret: a random per-process one, never a constant
    auto a = resolveJwtSecret();
    EXPECT_EQ(a, resolveJwtSecret());
    EXPECT_EQ(a.find("dev-secret"), std::string::npos);
    EXPECT_GE(a.size(), 32u);
}

TEST(HttpSecurityTest, CorsOriginSelection) {
    EXPECT_EQ(corsOriginFor("", "https://a.example"), "*");
    EXPECT_EQ(corsOriginFor("https://a.example,https://b.example",
                            "https://b.example"), "https://b.example");
    EXPECT_EQ(corsOriginFor("https://a.example", "https://evil.example"), "");
    EXPECT_EQ(corsOriginFor("https://a.example", ""), "");
    EXPECT_EQ(corsOriginFor("https://a.example, *", "https://x"), "*");
}
