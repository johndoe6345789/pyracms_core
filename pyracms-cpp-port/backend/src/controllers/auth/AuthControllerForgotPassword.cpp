#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"
#include "security/Hash.h"
#include "security/RateLimiter.h"
#include "security/Validate.h"

namespace pyracms {

static void sameAnswer(const HttpCb &callback) {
    Json::Value result;
    result["message"] = "If the email exists, a reset link has been sent";
    callback(drogon::HttpResponse::newHttpJsonResponse(result));
}

// Only the SHA-256 of the token is stored; the raw token exists in the
// email alone. Older unused tokens of the account are replaced.
static const char *kStoreToken =
    "WITH d AS (DELETE FROM password_reset_tokens "
    "WHERE user_id = $1 AND used = FALSE) "
    "INSERT INTO password_reset_tokens (user_id, token, expires_at) "
    "VALUES ($1, $2, NOW() + INTERVAL '1 hour')";

// Answers at once and identically whether or not the address exists;
// mail is sent afterwards, so response time reveals nothing.
void AuthController::forgotPassword(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {
    auto json = req->getJsonObject();
    if (!json || !json->isObject() || !(*json)["email"].isString()) {
        sendError(callback, "email is required", drogon::k400BadRequest);
        return;
    }
    auto email = (*json)["email"].asString();
    withTenant(
        *json, callback,
        [this, email, callback](int tenantId, const std::string &) {
            sameAnswer(callback);
            // At most 3 mails per address per hour (no mail-bombing)
            bool room = !RateLimiter::enabled() ||
                        RateLimiter::instance().allow("forgot-mail|" + email,
                                                      3, 3600);
            if (!room || !isValidEmail(email))
                return;
            auto db = drogon::app().getDbClient();
            userService_.findByEmail(
                db, tenantId, email,
                [this, db, email](const std::optional<UserDto> &user) {
                    if (!user)
                        return;
                    auto token = authService_.generateRandomToken();
                    db->execSqlAsync(
                        kStoreToken,
                        [this, email, token](const drogon::orm::Result &) {
                            emailService_.sendPasswordResetEmail(
                                email, token,
                                [](bool, const std::string &) {});
                        },
                        [](const drogon::orm::DrogonDbException &) {},
                        user->id, sha256Hex(token));
                });
        });
}

} // namespace pyracms
