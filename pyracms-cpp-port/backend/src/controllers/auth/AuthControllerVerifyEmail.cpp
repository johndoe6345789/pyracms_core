#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

void AuthController::verifyEmail(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("token")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "token is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto token = (*json)["token"].asString();
    auto db = drogon::app().getDbClient();

    db->execSqlAsync(
        "SELECT user_id FROM email_verification_tokens "
        "WHERE token = $1 AND used = FALSE AND expires_at > NOW()",
        [db, token, callback](const drogon::orm::Result &result) {
            if (result.empty()) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Invalid or expired token";
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }

            // Mark token as used
            db->execSqlAsync(
                "UPDATE email_verification_tokens SET used = TRUE WHERE token "
                "= $1",
                [callback](const drogon::orm::Result &) {
                    Json::Value result;
                    result["message"] = "Email verified successfully";
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                },
                [callback](const drogon::orm::DrogonDbException &e) {
                    auto resp = drogon::HttpResponse::newHttpJsonResponse(
                        Json::Value{});
                    (*resp->jsonObject())["error"] = "Failed to verify email";
                    resp->setStatusCode(drogon::k500InternalServerError);
                    callback(resp);
                },
                token);
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto resp =
                drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
            (*resp->jsonObject())["error"] = "Database error";
            resp->setStatusCode(drogon::k500InternalServerError);
            callback(resp);
        },
        token);
}

} // namespace pyracms
