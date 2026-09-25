#include "services/cache/WsRelay.h"

#include <gtest/gtest.h>

using namespace pyracms;

TEST(WsRelay, PacksAnyKeyAndBinaryPayloadsIntact) {
    auto msg = WsRelay::pack("n1", "collab", "room\nwith odd key", true,
                             std::string("\0\1\2 payload", 11));
    std::string key, payload;
    bool binary = false;
    auto &r = WsRelay::instance();
    r.on("collab", [&](const std::string &k, bool b, const std::string &p) {
        key = k;
        binary = b;
        payload = p;
    });
    r.deliver(msg);
    EXPECT_EQ(key, "room\nwith odd key");
    EXPECT_TRUE(binary);
    EXPECT_EQ(payload, std::string("\0\1\2 payload", 11));
}

TEST(WsRelay, IgnoresItsOwnMessagesAndGarbage) {
    auto &r = WsRelay::instance();
    int calls = 0;
    r.on("thread", [&](const std::string &, bool, const std::string &) {
        ++calls;
    });
    r.deliver("no newline at all");
    r.deliver("n thread t 99\nshort"); // key longer than the message
    r.deliver(WsRelay::pack("x", "unknown-kind", "k", false, "p"));
    EXPECT_EQ(calls, 0);
    r.deliver(WsRelay::pack("x", "thread", "7", false, "{}"));
    EXPECT_EQ(calls, 1);
}
