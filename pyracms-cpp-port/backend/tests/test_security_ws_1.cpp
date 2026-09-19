#include "controllers/WsAuth.h"
#include "http_accounts.h"
#include "ws_client.h"

using namespace harness;
using namespace pyracms;
using namespace wsc;

TEST(SecurityWs, SanitizeRoomAndTokenParsing) {
    EXPECT_EQ(sanitizeRoom("doc-1_a.b:c"), "doc-1_a.b:c");
    EXPECT_EQ(sanitizeRoom(""), "");
    EXPECT_EQ(sanitizeRoom("a b"), "");
    EXPECT_EQ(sanitizeRoom("../x"), "");
    EXPECT_EQ(sanitizeRoom(std::string(65, 'a')), "");
    auto req = drogon::HttpRequest::newHttpRequest();
    EXPECT_FALSE(wsAuthenticate(req));
    req->setParameter("token", "junk");
    EXPECT_FALSE(wsAuthenticate(req));
    AuthService a;
    auto ok = drogon::HttpRequest::newHttpRequest();
    ok->addHeader("Authorization", "Bearer " + a.generateToken(9, "x", 4));
    auto who = wsAuthenticate(ok);
    ASSERT_TRUE(who);
    EXPECT_EQ(who->userId, 9);
    EXPECT_EQ(who->tenantId, 4);
}
