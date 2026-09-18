#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

void AuthController::resetPassword(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {
    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("token") || !(*json).isMember("password")) {
        sendError(callback, "token and password are required",
                  drogon::k400BadRequest);
        return;
    }
    auto token = (*json)["token"].asString();
    auto password = (*json)["password"].asString();
    if (password.length() < 8) {
        sendError(callback, "Password must be at least 8 characters",
                  drogon::k400BadRequest);
        return;
    }
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "SELECT user_id FROM password_reset_tokens "
        "WHERE token = $1 AND used = FALSE AND expires_at > NOW()",
        [this, token, password, callback](const drogon::orm::Result &result) {
            if (result.empty()) {
                sendError(callback, "Invalid or expired token",
                          drogon::k400BadRequest);
                return;
            }
            applyReset(result[0]["user_id"].as<int>(), token, password,
                       callback);
        },
        [callback](const drogon::orm::DrogonDbException &) {
            sendError(callback, "Database error",
                      drogon::k500InternalServerError);
        },
        token);
}

} // namespace pyracms
