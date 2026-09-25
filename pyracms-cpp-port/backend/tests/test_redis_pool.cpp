#include "fake_redis.h"
#include "services/cache/RedisPool.h"

#include <chrono>
#include <gtest/gtest.h>

using namespace pyracms;
using fake::FakeRedis;


TEST(RedisPool, ReadsSimpleBigAndArrayReplies) {
    FakeRedis srv;
    RedisPool pool("127.0.0.1", srv.port, 2);
    auto ping = pool.command({"PING"});
    EXPECT_TRUE(ping.ok);
    EXPECT_EQ(ping.text, "PONG");
    auto big = pool.command({"GET", "k"});
    ASSERT_TRUE(big.ok);
    EXPECT_EQ(big.text.size(), 40000u); // beyond one recv()
    auto scan = pool.command({"SCAN", "0"});
    ASSERT_EQ(scan.kind, RespReply::Array);
    EXPECT_EQ(scan.items, (std::vector<std::string>{"0", "a", "b"}));
}

TEST(RedisPool, ReplacesAConnectionTheServerDropped) {
    FakeRedis srv;
    RedisPool pool("127.0.0.1", srv.port, 1);
    ASSERT_TRUE(pool.command({"PING"}).ok);
    ASSERT_TRUE(pool.command({"BYE"}).ok); // and now the server hangs up
    EXPECT_TRUE(pool.command({"PING"}).ok); // fresh connection, no error
}

TEST(RedisPool, AnUnreachableRedisFailsFastAndStaysQuiet) {
    RedisPool pool("127.0.0.1", 1, 2); // nothing listens on port 1
    auto t0 = std::chrono::steady_clock::now();
    EXPECT_FALSE(pool.command({"PING"}).ok);
    EXPECT_FALSE(pool.command({"PING"}).ok); // inside the retry pause
    EXPECT_LT(std::chrono::steady_clock::now() - t0,
              std::chrono::seconds(2));
}
