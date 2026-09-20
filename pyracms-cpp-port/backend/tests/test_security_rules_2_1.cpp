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

TEST(SsrfGuardTest, ParsesOnlyPlainHttpUrls) {
    auto u = parseHttpUrl("https://example.com:8443/hook?a=1#frag");
    ASSERT_TRUE(u.ok);
    EXPECT_EQ(u.origin, "https://example.com:8443");
    EXPECT_EQ(u.path, "/hook?a=1");
    EXPECT_EQ(parseHttpUrl("http://h.co").path, "/");
    for (const char *bad :
         {"ftp://h.co/", "file:///etc/passwd", "gopher://h.co", "h.co/x",
          "http://user:pw@h.co/", "http://h.co\\@evil/", "http:///x",
          "http://h.co/a b", "javascript:alert(1)", "http://[::1"})
        EXPECT_FALSE(parseHttpUrl(bad).ok) << bad;
}

TEST(SsrfGuardTest, InternalAddressesAreBlocked) {
    for (const char *ip :
         {"127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.255",
          "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0",
          "224.0.0.1", "255.255.255.255", "::1", "::", "fe80::1",
          "fd00::1", "ff02::1", "::ffff:127.0.0.1", "::ffff:10.0.0.1",
          "64:ff9b::a00:1", "2002:7f00:1::", "not-an-ip"})
        EXPECT_TRUE(isBlockedIp(ip)) << ip;
    for (const char *ip : {"8.8.8.8", "1.1.1.1", "172.32.0.1", "100.63.0.1",
                           "2606:4700:4700::1111", "::ffff:8.8.8.8"})
        EXPECT_FALSE(isBlockedIp(ip)) << ip;
}

TEST(SsrfGuardTest, OutboundCheckRejectsLiteralPrivateHosts) {
    unsetenv("PYRACMS_ALLOW_PRIVATE_URLS");
    EXPECT_NE(checkOutboundUrl("http://127.0.0.1:8080/x"), "");
    EXPECT_NE(checkOutboundUrl("http://169.254.169.254/latest/meta-data"), "");
    EXPECT_NE(checkOutboundUrl("http://[::1]/"), "");
    EXPECT_NE(checkOutboundUrl("http://localhost/"), "");
    EXPECT_NE(checkOutboundUrl("ftp://8.8.8.8/"), "");
    EXPECT_EQ(checkOutboundUrl("http://8.8.8.8/hook"), "");
    setenv("PYRACMS_ALLOW_PRIVATE_URLS", "1", 1);
    EXPECT_EQ(checkOutboundUrl("http://127.0.0.1:8080/x"), "");
    EXPECT_NE(checkOutboundUrl("ftp://127.0.0.1/"), "");
}

TEST(RateLimiterTest, SlidingWindowAndRetryAfter) {
    double t = 100;
    RateLimiter rl([&] { return t; });
    int retry = 0;
    for (int i = 0; i < 3; ++i)
        EXPECT_TRUE(rl.allow("k", 3, 60));
    EXPECT_FALSE(rl.allow("k", 3, 60, &retry));
    EXPECT_GE(retry, 59);
    EXPECT_TRUE(rl.allow("other", 3, 60)); // keys are independent
    t += 61;
    EXPECT_TRUE(rl.allow("k", 3, 60));
}
