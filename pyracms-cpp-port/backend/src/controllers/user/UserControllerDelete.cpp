#include "controllers/UserAdminGate.h"
#include "controllers/UserController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

void UserController::remove(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {
    withAdminTarget(req, id, callback, [this, callback, id](auto &c) {
        auto v = canAdminister(c.actor, c.target, AdminAction::Delete);
        if (!v.ok())
            return replyVerdict(v, callback);
        userService_.deleteUser(
            drogon::app().getDbClient(), id,
            [callback](bool ok, const std::string &err) {
                if (!ok)
                    return callback(filterError(
                        "Cannot delete: " + err, drogon::k409Conflict));
                replyOk(callback);
            });
    });
}

} // namespace pyracms
