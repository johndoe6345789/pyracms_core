#include "controllers/WsAuth.h"
#include "http_accounts.h"
#include "ws_client.h"

using namespace harness;
using namespace pyracms;
using namespace wsc;

TEST(SecurityWs, CollabRoomsDoNotCrossSites) {
    REQUIRE_SERVER();
    auto a = makeSite();
    auto b = makeSite();
    auto a1 = connect("/api/ws/collab?room=doc&token=" + a.user.token);
    auto a2 = connect("/api/ws/collab?room=doc&token=" + a.admin.token);
    auto b1 = connect("/api/ws/collab?room=doc&token=" + b.user.token);
    ASSERT_TRUE(a1->opened && a2->opened && b1->opened);
    ASSERT_TRUE(a1->waitMsg(2000));
    ASSERT_TRUE(a2->waitMsg(2000));
    ASSERT_TRUE(b1->waitMsg(2000));
    a1->client->getConnection()->send("edit-from-site-a");
    usleep(500000);
    auto has = [](const std::shared_ptr<Sock> &s, const char *text) {
        std::lock_guard<std::mutex> lk(s->mu);
        for (const auto &m : s->got)
            if (m == text)
                return true;
        return false;
    };
    EXPECT_TRUE(has(a2, "edit-from-site-a"));
    EXPECT_FALSE(has(b1, "edit-from-site-a"));
    // room names with odd characters are refused outright
    auto bad = connect("/api/ws/collab?room=../x&token=" + a.user.token);
    usleep(300000);
    EXPECT_TRUE(bad->closed);
    for (auto &s : {a1, a2, b1})
        s->client->stop();
}
