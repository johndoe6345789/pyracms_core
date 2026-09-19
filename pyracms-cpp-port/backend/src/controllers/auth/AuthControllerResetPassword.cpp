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
    // A named site (the link's `tenant`) must be the account's own site; a
    // mismatch leaves the token unspent. -1 = no site named (older links).
    auto run = [this, token, password, callback](int tenantId) {
        drogon::app().getDbClient()->execSqlAsync(
            "UPDATE password_reset_tokens SET used = TRUE "
            "WHERE token = $1 AND used = FALSE AND expires_at > NOW() "
            "AND ($2::int < 0 OR EXISTS (SELECT 1 FROM users u WHERE "
            "u.id = password_reset_tokens.user_id "
            "AND COALESCE(u.tenant_id, 0) = $2::int)) RETURNING user_id",
            [this, password, callback](const drogon::orm::Result &result) {
                if (result.empty()) {
                    sendError(callback, "Invalid or expired token",
                              drogon::k400BadRequest);
                    return;
                }
                applyReset(result[0]["user_id"].as<int>(), password,
                           callback);
            },
            [callback](const drogon::orm::DrogonDbException &) {
                sendError(callback, "Database error",
                          drogon::k500InternalServerError);
            },
            sha256Hex(token), tenantId);
    };
    if (json->isMember("tenant") && (*json)["tenant"].isString() &&
        !(*json)["tenant"].asString().empty()) {
        withTenant(*json, callback,
                   [run](int tenantId, const std::string &) { run(tenantId); });
        return;
    }
    run(-1);
}

} // namespace pyracms
