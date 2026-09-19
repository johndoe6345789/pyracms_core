#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"
#include "security/Hash.h"

namespace pyracms {

void AuthController::resetPassword(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {
    auto json = req->getJsonObject();
    if (!json || !json->isObject() || !(*json)["token"].isString() ||
        !(*json)["password"].isString()) {
        sendError(callback, "token and password are required",
                  drogon::k400BadRequest);
        return;
    }
    auto token = (*json)["token"].asString();
    auto password = (*json)["password"].asString();
    if (password.length() < 8 ||
        password.length() > AuthService::kMaxPasswordLen) {
        sendError(callback, "Password must be 8-256 characters",
                  drogon::k400BadRequest);
        return;
    }
    // Single statement: spend the token and learn its owner atomically, so
    // a token can never be used twice, even by two simultaneous requests.
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "UPDATE password_reset_tokens SET used = TRUE "
        "WHERE token = $1 AND used = FALSE AND expires_at > NOW() "
        "RETURNING user_id",
        [this, password, callback](const drogon::orm::Result &result) {
            if (result.empty()) {
                sendError(callback, "Invalid or expired token",
                          drogon::k400BadRequest);
                return;
            }
            applyReset(result[0]["user_id"].as<int>(), password, callback);
        },
        [callback](const drogon::orm::DrogonDbException &) {
            sendError(callback, "Database error",
                      drogon::k500InternalServerError);
        },
        sha256Hex(token));
}

} // namespace pyracms
