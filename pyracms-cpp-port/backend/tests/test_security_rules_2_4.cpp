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
