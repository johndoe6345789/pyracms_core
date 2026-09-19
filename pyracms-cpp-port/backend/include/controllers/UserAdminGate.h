#pragma once

#include "services/UserAdminService.h"
#include "services/UserService.h"

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>
#include <memory>
#include <vector>

namespace pyracms {

using ReplyFn = std::function<void(const drogon::HttpResponsePtr &)>;

struct AdminCtx {
    AdminActor actor;
    AdminTarget target;
    bool banned{false};
};

// The caller as an actor, from the JwtAuthFilter attributes.
AdminActor actorOf(const drogon::HttpRequestPtr &req);

// Loads the target (404 if missing) and hands it on; the route decides
// which rule applies.
void withAdminTarget(const drogon::HttpRequestPtr &req, int id, ReplyFn reply,
                     std::function<void(const AdminCtx &)> go);

// PUT /api/users/{id} for anything beyond the plain self-profile edit.
void adminUpdate(const drogon::HttpRequestPtr &req, int id,
                 const Json::Value &body, ReplyFn reply, UserService &users);

using Step = std::function<void(UserAdminService::BoolCb)>;

// Runs the steps in order; the first failure is the reply (400).
void runSteps(std::shared_ptr<std::vector<Step>> steps, size_t i,
              ReplyFn reply);

// The body fields `self` (all profile fields) or an administrator (name
// and email only) may write.
Json::Value profileOf(const Json::Value &body, bool self);

// Sends a refusal, or {"success":true} when v is ok.
void replyVerdict(const AdminVerdict &v, const ReplyFn &reply);
void replyOk(const ReplyFn &reply);

} // namespace pyracms
