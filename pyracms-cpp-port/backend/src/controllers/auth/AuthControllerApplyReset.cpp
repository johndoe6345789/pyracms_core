#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

// The token is already spent. Store the new password (which also ends every
// older session) and burn the account's remaining reset tokens.
void AuthController::applyReset(int userId, const std::string &password,
                                HttpCb callback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1",
        [](const drogon::orm::Result &) {},
        [](const drogon::orm::DrogonDbException &) {}, userId);
    userService_.updatePassword(
        db, userId, authService_.hashPassword(password),
        [callback](bool ok, const std::string &) {
            if (!ok) {
                sendError(callback, "Failed to update password",
                          drogon::k500InternalServerError);
                return;
            }
            Json::Value result;
            result["message"] = "Password has been reset successfully";
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
