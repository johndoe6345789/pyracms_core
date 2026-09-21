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
// Open multipart uploads: id -> (bucket/key, part number -> bytes).
using Parts = std::map<int, std::string>;
extern std::map<std::string, std::pair<std::string, Parts>> uploads;
drogon::HttpResponsePtr multipart(const drogon::HttpRequestPtr &req,
                                  const std::string &full);
extern int failStatus;
// True when the request carries a valid AWS Signature V4 for `secret`.
bool verifySigV4(const drogon::HttpRequestPtr &r, const std::string &secret);

drogon::HttpResponsePtr handle(const drogon::HttpRequestPtr &req);

} // namespace harness::fake
