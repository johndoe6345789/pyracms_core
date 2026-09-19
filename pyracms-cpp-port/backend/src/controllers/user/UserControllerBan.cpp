#include "controllers/UserAdminGate.h"
#include "controllers/UserController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

// Body {"banned": true|false}. Ending the account's sessions is part of
// UserAdminService::setBanned.
void UserController::ban(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {
    auto json = req->getJsonObject();
    if (!json || !json->isObject() || !(*json)["banned"].isBool()) {
        callback(filterError("banned (true/false) required",
                             drogon::k400BadRequest));
        return;
    }
    bool banned = (*json)["banned"].asBool();
    withAdminTarget(req, id, callback, [callback, id, banned](auto &c) {
        auto v = canAdminister(c.actor, c.target, AdminAction::Ban);
        if (!v.ok())
            return replyVerdict(v, callback);
        UserAdminService().setBanned(
            drogon::app().getDbClient(), id, banned,
            [callback](bool ok, const std::string &err) {
                if (!ok)
                    return callback(
                        filterError(err, drogon::k500InternalServerError));
                replyOk(callback);
            });
    });
}

} // namespace pyracms
