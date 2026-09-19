#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

// One atomic statement: a verification token can be spent exactly once.
void AuthController::verifyEmail(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {
    auto json = req->getJsonObject();
    if (!json || !json->isObject() || !(*json)["token"].isString()) {
        sendError(callback, "token is required", drogon::k400BadRequest);
        return;
    }
    drogon::app().getDbClient()->execSqlAsync(
        "UPDATE email_verification_tokens SET used = TRUE "
        "WHERE token = $1 AND used = FALSE AND expires_at > NOW() "
        "RETURNING user_id",
        [callback](const drogon::orm::Result &result) {
            if (result.empty()) {
                sendError(callback, "Invalid or expired token",
                          drogon::k400BadRequest);
                return;
            }
            Json::Value ok;
            ok["message"] = "Email verified successfully";
            callback(drogon::HttpResponse::newHttpJsonResponse(ok));
        },
        [callback](const drogon::orm::DrogonDbException &) {
            sendError(callback, "Database error",
                      drogon::k500InternalServerError);
        },
        (*json)["token"].asString());
}

} // namespace pyracms
