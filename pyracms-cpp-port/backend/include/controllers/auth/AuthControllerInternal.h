#pragma once

#include "controllers/AuthController.h"

namespace pyracms {

namespace {

using Callback = std::function<void(const drogon::HttpResponsePtr &)>;

void sendError(const Callback &callback, const std::string &message,
               drogon::HttpStatusCode code) {
    auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
    (*resp->jsonObject())["error"] = message;
    resp->setStatusCode(code);
    callback(resp);
}

// Shape shared by login / register / me. `tenantSlug` is empty for
// platform accounts.
Json::Value userJson(const UserDto &user, const std::string &tenantSlug) {
    Json::Value j;
    j["id"] = user.id;
    j["username"] = user.username;
    j["fullName"] = user.fullName;
    j["email"] = user.email;
    j["role"] = static_cast<int>(user.role);
    j["tenantId"] = user.tenantId;
    j["tenantSlug"] =
        tenantSlug.empty() ? Json::Value() : Json::Value(tenantSlug);
    return j;
}

} // namespace

} // namespace pyracms
