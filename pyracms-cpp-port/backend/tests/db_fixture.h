#pragma once

#include <atomic>
#include <cstdlib>
#include <drogon/orm/DbClient.h>
#include <functional>
#include <future>
#include <gtest/gtest.h>
#include "port.h"

// Integration tests need PostgreSQL with backend/sql applied. They skip
// themselves unless TEST_DB_HOST is set (see backend/run-tests.sh).
inline std::string dbEnv(const char *key, const char *fallback) {
    const char *v = std::getenv(key);
    return v ? v : fallback;
}

inline drogon::orm::DbClientPtr testDb() {
    static drogon::orm::DbClientPtr db = [] {
        if (!std::getenv("TEST_DB_HOST"))
            return drogon::orm::DbClientPtr();
        return drogon::orm::DbClient::newPgClient(
            "host=" + dbEnv("TEST_DB_HOST", "") +
                " port=" + dbEnv("TEST_DB_PORT", "5432") +
                " dbname=" + dbEnv("TEST_DB_NAME", "pyracms_test") +
                " user=" + dbEnv("TEST_DB_USER", "pyracms") +
                " password=" + dbEnv("TEST_DB_PASSWORD", "pyracms"),
            2);
    }();
    return db;
}

#define REQUIRE_DB()                                                           \
    auto db = testDb();                                                        \
    if (!db)                                                                   \
    GTEST_SKIP() << "TEST_DB_HOST not set"

// Unique suffix so tests never collide on unique indexes.
inline std::string uniq(const std::string &base) {
    static std::atomic<int> n{0};
    return base + std::to_string(getpid()) + "_" + std::to_string(++n);
}

// A unique site slug (lowercase letters, digits, hyphens).
inline std::string uslug(const std::string &base) {
    auto s = uniq(base);
    for (auto &c : s) {
        if (c == '_')
            c = '-';
    }
    return s;
}

#include "db_await.h"
#include "db_rows.h"
