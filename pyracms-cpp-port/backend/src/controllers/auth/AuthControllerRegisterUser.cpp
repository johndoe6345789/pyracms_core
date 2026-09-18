#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

void AuthController::registerUser(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {
    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("username") ||
        !(*json).isMember("password") || !(*json).isMember("email")) {
        sendError(callback, "username, email, and password required",
                  drogon::k400BadRequest);
        return;
    }
    NewAccount acct{(*json)["username"].asString(),
                    (*json).get("fullName", "").asString(),
                    (*json)["email"].asString(), ""};
    auto password = (*json)["password"].asString();
    if (acct.username.length() < 3 || acct.username.length() > 32) {
        sendError(callback, "Username must be 3-32 characters",
                  drogon::k400BadRequest);
        return;
    }
    if (password.length() < 8) {
        sendError(callback, "Password must be at least 8 characters",
                  drogon::k400BadRequest);
        return;
    }
    acct.passwordHash = authService_.hashPassword(password);
    withTenant(*json, callback,
               [this, acct, callback](int tenantId, const std::string &slug) {
                   registerIn(tenantId, slug, acct, callback);
               });
}

} // namespace pyracms
