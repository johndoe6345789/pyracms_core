#pragma once

#include "db_fixture.h"
#include <drogon/drogon.h>
#include <map>
#include <thread>
#include <trantor/net/EventLoopThread.h>

// Boots the real Drogon app (all controllers + filters) in-process on a
// loopback port, wired to the scratch test database, and drives it over
// HTTP. Every test using it skips itself without TEST_DB_HOST.
namespace harness {

struct Reply {
    int status{0};
    Json::Value json;
    std::string text;
    std::map<std::string, std::string> headers; // lower-case names
};

class Server {
  public:
    Server();
    ~Server();
    drogon::HttpClientPtr client;

  private:
    std::thread thread_;
    trantor::EventLoopThread loop_;
};

Server &server();

// Method + path (with query) + optional JSON body + optional bearer token.
using Hdrs = std::map<std::string, std::string>; // extra request headers
Reply call(drogon::HttpMethod m, const std::string &path,
           const Json::Value &body = Json::Value(),
           const std::string &token = "", const Hdrs &extra = {});
Reply get(const std::string &path, const std::string &token = "",
          const Hdrs &extra = {});
Reply post(const std::string &path, const Json::Value &b,
           const std::string &token = "");
Reply put(const std::string &path, const Json::Value &b,
          const std::string &token = "");
Reply del(const std::string &path, const std::string &token = "",
          const Json::Value &b = Json::Value());

using KV = std::initializer_list<std::pair<const char *, Json::Value>>;
inline Json::Value J(KV kv) {
    Json::Value j(Json::objectValue);
    for (const auto &p : kv)
        j[p.first] = p.second;
    return j;
}
inline Json::Value A(std::initializer_list<const char *> items) {
    Json::Value j(Json::arrayValue);
    for (const char *i : items)
        j.append(i);
    return j;
}
inline bool ok(const Reply &r) { return r.status >= 200 && r.status < 300; }

// Newest row id of a table (creates that only answer {"success":true}).
inline int maxId(const std::string &table) {
    auto r = testDb()->execSqlSync("SELECT COALESCE(MAX(id), 0) AS m FROM " +
                                   table);
    return r[0]["m"].as<int>();
}

// Multipart file upload (field "file").
Reply upload(const std::string &path, const std::string &token,
             const std::string &filename, const std::string &content);

} // namespace harness

#define REQUIRE_SERVER()                                                       \
    if (!std::getenv("TEST_DB_HOST"))                                          \
        GTEST_SKIP() << "TEST_DB_HOST not set";                                \
    harness::server()
