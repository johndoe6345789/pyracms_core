#include "controllers/WsAuth.h"
#include "http_accounts.h"
#include "ws_client.h"

using namespace harness;
using namespace pyracms;
using namespace wsc;

TEST(SecurityWs, TokensSignedWithTheOldDefaultSecretAreRefused) {
    REQUIRE_SERVER();
    setenv("JWT_SECRET", "change-me-in-production", 1);
    AuthService weak;
    auto forged = weak.generateToken(1, "root", 0);
    unsetenv("JWT_SECRET");
    for (const char *ep : {"/api/ws/notifications", "/api/ws/collab"}) {
        auto s = connect(std::string(ep) + "?token=" + forged);
        s->waitMsg(500);
        std::lock_guard<std::mutex> lk(s->mu);
        for (const auto &m : s->got)
            EXPECT_EQ(m.find("connected"), std::string::npos) << ep << m;
        s->client->stop();
    }
}
