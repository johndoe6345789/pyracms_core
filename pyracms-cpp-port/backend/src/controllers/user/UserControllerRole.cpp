#include "controllers/UserAdminGate.h"
#include "controllers/UserController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

// Body {"role": 0..4}. Who may grant what is decided by canAdminister.
void UserController::setRole(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {
    auto json = req->getJsonObject();
    if (!json || !json->isObject() || !(*json)["role"].isInt()) {
        callback(filterError("role (integer) required",
                             drogon::k400BadRequest));
        return;
    }
    int role = (*json)["role"].asInt();
    withAdminTarget(req, id, callback, [callback, id, role](auto &c) {
        auto v = canAdminister(c.actor, c.target, AdminAction::SetRole, role);
        if (!v.ok())
            return replyVerdict(v, callback);
        UserAdminService().setRole(
            drogon::app().getDbClient(), id, role,
            [callback](bool ok, const std::string &err) {
                if (!ok)
                    return callback(
                        filterError(err, drogon::k500InternalServerError));
                replyOk(callback);
            });
    });
}

} // namespace pyracms
