#include "controllers/UserAdminGate.h"
#include "controllers/UserController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

// Own account: profile fields. Someone else's account (administrators
// only, decided by canAdminister): fullName, email, banned and role.
void UserController::update(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {
    auto json = req->getJsonObject();
    if (!json || !json->isObject()) {
        callback(filterError("Invalid JSON body", drogon::k400BadRequest));
        return;
    }
    bool self = req->attributes()->get<int>("userId") == id;
    if (self && !json->isMember("role") && !json->isMember("banned")) {
        userService_.updateUser(
            drogon::app().getDbClient(), id, *json,
            [callback](bool success, const std::string &error) {
                if (!success)
                    return callback(
                        filterError(error, drogon::k400BadRequest));
                replyOk(callback);
            });
        return;
    }
    adminUpdate(req, id, *json, callback, userService_);
}

} // namespace pyracms
