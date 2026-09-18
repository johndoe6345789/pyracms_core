#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

void AuthController::forgotPassword(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("email")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "email is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto email = (*json)["email"].asString();
    auto db = drogon::app().getDbClient();

    withTenant(
        *json, callback,
        [this, db, email, callback](int tenantId, const std::string &) {
            // Always return success to prevent email enumeration
            userService_.findByEmail(
                db, tenantId, email,
                [this, db, email,
                 callback](const std::optional<UserDto> &user) {
                    if (!user) {
                        // Don't reveal that the email doesn't exist
                        Json::Value result;
                        result["message"] =
                            "If the email exists, a reset link has been sent";
                        callback(
                            drogon::HttpResponse::newHttpJsonResponse(result));
                        return;
                    }

                    auto token = authService_.generateRandomToken();
                    auto userId = user->id;

                    db->execSqlAsync(
                        "INSERT INTO password_reset_tokens (user_id, token, "
                        "expires_at) "
                        "VALUES ($1, $2, NOW() + INTERVAL '1 hour')",
                        [this, email, token,
                         callback](const drogon::orm::Result &) {
                            emailService_.sendPasswordResetEmail(
                                email, token,
                                [callback](bool success,
                                           const std::string &error) {
                                    Json::Value result;
                                    result["message"] =
                                        "If the email exists, a reset link has "
                                        "been sent";
                                    callback(drogon::HttpResponse::
                                                 newHttpJsonResponse(result));
                                });
                        },
                        [callback](const drogon::orm::DrogonDbException &e) {
                            Json::Value result;
                            result["message"] = "If the email exists, a reset "
                                                "link has been sent";
                            callback(drogon::HttpResponse::newHttpJsonResponse(
                                result));
                        },
                        userId, token);
                });
        });
}

} // namespace pyracms
