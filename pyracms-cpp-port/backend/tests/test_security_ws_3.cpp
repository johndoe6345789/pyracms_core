#include "controllers/WsAuth.h"
#include "http_accounts.h"
#include "ws_client.h"

using namespace harness;
using namespace pyracms;
using namespace wsc;

TEST(SecurityWs, NotificationSocketAcceptsARealToken) {
    REQUIRE_SERVER();
    auto u = signup("");
    auto s = connect("/api/ws/notifications?token=" + u.token);
    ASSERT_TRUE(s->waitMsg(2000));
    EXPECT_NE(s->got[0].find("connected"), std::string::npos);
    s->client->getConnection()->send("{\"type\":\"ping\"}");
    s->client->getConnection()->send("{\"type\":\"thread_subscribe\","
                                     "\"threadId\":999999}");
    s->client->getConnection()->send("{\"type\":\"typing_start\","
                                     "\"threadId\":999999}");
    s->client->getConnection()->send("not json");
    usleep(300000);
    {
        std::lock_guard<std::mutex> lk(s->mu);
        EXPECT_GE(s->got.size(), 2u); // welcome + pong
        for (const auto &m : s->got)
            EXPECT_EQ(m.find("thread_subscribed"), std::string::npos);
    }
    s->client->stop();
    auto anon = connect("/api/ws/notifications");
    anon->waitMsg(500);
    std::lock_guard<std::mutex> lk(anon->mu);
    ASSERT_FALSE(anon->got.empty());
    EXPECT_NE(anon->got[0].find("error"), std::string::npos);
}
