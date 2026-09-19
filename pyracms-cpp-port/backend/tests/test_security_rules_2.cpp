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

TEST(DockerRunnerTest, CodeIsOneArgvEntryAndNeverParsedByAShell) {
    const std::string evil = "'; rm -rf / #\n$(reboot) `id` \"x\"";
    auto argv = DockerExecutionService::buildArgv("img", evil);
    ASSERT_GE(argv.size(), 5u);
    EXPECT_EQ(argv.back(), evil);
    EXPECT_EQ(argv[argv.size() - 2], "img");
    int copies = 0;
    for (const auto &a : argv)
        copies += a.find("rm -rf") != std::string::npos;
    EXPECT_EQ(copies, 1);
    auto has = [&](const char *flag) {
        return std::find(argv.begin(), argv.end(), flag) != argv.end();
    };
    EXPECT_TRUE(has("--network=none"));
    EXPECT_TRUE(has("--cap-drop=ALL"));
    EXPECT_TRUE(has("--read-only"));
    EXPECT_TRUE(has("--security-opt=no-new-privileges"));
}

TEST(DockerRunnerTest, RunArgvCapturesOutputWithoutAShell) {
    std::string out;
    EXPECT_EQ(runArgv({"echo", "$HOME; id"}, 1000, out), 0);
    EXPECT_EQ(out, "$HOME; id\n");
    out.clear();
    EXPECT_EQ(runArgv({"sh", "-c", "exit 3"}, 1000, out), 3);
    out.clear();
    EXPECT_EQ(runArgv({"/no/such/binary"}, 1000, out), 127);
    out.clear();
    runArgv({"sh", "-c", "yes | head -c 100000"}, 500, out);
    EXPECT_LT(out.size(), 700u);
    EXPECT_NE(out.find("truncated"), std::string::npos);
}

TEST(AuthVerdictTest, RevokedBannedAndForeignTokensAreRefused) {
    TokenPayload tok;
    tok.tenantId = 3;
    tok.issuedAt = 1000;
    UserState st;
    st.tenantId = 3;
    EXPECT_EQ(authVerdict(tok, st).status, 0);
    st.validAfter = 1001; // password changed after the token was issued
    EXPECT_EQ(authVerdict(tok, st).status, 401);
    st.validAfter = 1000;
    EXPECT_EQ(authVerdict(tok, st).status, 0);
    st.banned = true;
    EXPECT_EQ(authVerdict(tok, st).status, 403);
    st.banned = false;
    st.tenantId = 4; // token claims a site the account is not on
    EXPECT_EQ(authVerdict(tok, st).status, 401);
}
