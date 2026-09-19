#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"
#include "security/Validate.h"

namespace pyracms {

// Empty string when fine, else the message for a 400.
static std::string registerProblem(const Json::Value &j) {
    if (!j["username"].isString() || !j["email"].isString() ||
        !j["password"].isString())
        return "username, email, and password required";
    if (j.isMember("fullName") && !j["fullName"].isString())
        return "fullName must be text";
    if (!isValidUsername(j["username"].asString()))
        return "Username must be 3-32 letters, digits, '_', '.' or '-'";
    if (!isValidEmail(j["email"].asString()))
        return "A valid email address is required";
    auto password = j["password"].asString();
    if (password.length() < 8)
        return "Password must be at least 8 characters";
    if (password.length() > AuthService::kMaxPasswordLen)
        return "Password is too long";
    auto full = j.get("fullName", "").asString();
    if (full.size() > 128 || hasControlChars(full))
        return "Invalid full name";
    return "";
}

void AuthController::registerUser(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {
    auto json = req->getJsonObject();
    if (!json || !json->isObject()) {
        sendError(callback, "username, email, and password required",
                  drogon::k400BadRequest);
        return;
    }
    auto problem = registerProblem(*json);
    if (!problem.empty()) {
        sendError(callback, problem, drogon::k400BadRequest);
        return;
    }
    NewAccount acct{(*json)["username"].asString(),
                    (*json).get("fullName", "").asString(),
                    (*json)["email"].asString(),
                    authService_.hashPassword((*json)["password"].asString())};
    withTenant(*json, callback,
               [this, acct, callback](int tenantId, const std::string &slug) {
                   registerIn(tenantId, slug, acct, callback);
               });
}

} // namespace pyracms
