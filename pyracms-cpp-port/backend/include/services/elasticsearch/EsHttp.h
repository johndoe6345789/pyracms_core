#pragma once

#include <drogon/HttpClient.h>
#include <functional>
#include <json/json.h>
#include <string>

namespace pyracms {

struct EsReply {
    bool ok = false; // an HTTP answer arrived (of any status)
    int status = 0;
    Json::Value json;
};

using EsReplyCb = std::function<void(const EsReply &)>;

// One request on a fresh connection (calls are rare, and a pooled
// connection that the overlay network silently dropped would hang), with a
// hard timeout. `ndjson` is for the _bulk API.
void esRequest(const std::string &baseUrl, drogon::HttpMethod method,
               const std::string &path, const std::string &body,
               double timeoutS, EsReplyCb cb, bool ndjson = false);

std::string esWrite(const Json::Value &v);

} // namespace pyracms
