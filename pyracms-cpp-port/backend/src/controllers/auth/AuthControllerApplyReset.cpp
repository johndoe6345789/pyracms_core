#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

// Burn the reset token, then store the new password hash.
void AuthController::applyReset(int userId, const std::string &token,
                                const std::string &password, HttpCb callback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "UPDATE password_reset_tokens SET used = TRUE WHERE token = $1",
        [](const drogon::orm::Result &) {},
        [](const drogon::orm::DrogonDbException &) {}, token);
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
