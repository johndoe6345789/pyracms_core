#pragma once

#include <drogon/drogon.h>
#include <map>
#include <mutex>
#include <set>
#include <string>

// Shared state of the fake object store (fake_s3*.cpp).
namespace harness::fake {

extern std::mutex mu;
extern std::set<std::string> buckets;
extern std::map<std::string, std::string> objects;
extern int created;
extern int failStatus;

drogon::HttpResponsePtr handle(const drogon::HttpRequestPtr &req);

} // namespace harness::fake
