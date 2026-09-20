#pragma once

#include "filters/TenantGuard.h"

namespace pyracms {

namespace comment_replies {
using Reply = std::function<void(const drogon::HttpResponsePtr &)>;

inline void errorReply(const Reply &cb, const std::string &msg,
                drogon::HttpStatusCode c) {
    cb(filterError(msg, c));
}

inline void createdReply(const Reply &cb, int commentId) {
    Json::Value result;
    result["success"] = true;
    result["id"] = commentId;
    auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
    resp->setStatusCode(drogon::k201Created);
    cb(resp);
}
} // namespace comment_replies

using namespace comment_replies;

} // namespace pyracms
