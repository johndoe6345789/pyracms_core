#pragma once

#include <drogon/HttpResponse.h>
#include <string>

namespace pyracms {

constexpr size_t kMaxArticleBytes = 1000000;

inline drogon::HttpResponsePtr articleBad(const std::string &msg) {
    auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
    (*resp->jsonObject())["error"] = msg;
    resp->setStatusCode(drogon::k400BadRequest);
    return resp;
}

} // namespace pyracms
