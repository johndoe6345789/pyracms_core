#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"
#include "controllers/auth/AccountInput.h"

namespace pyracms {

void AuthController::registerUser(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {
    auto json = req->getJsonObject();
    if (!json || !json->isObject()) {
        sendError(callback, "username, email, and password required",
                  drogon::k400BadRequest);
        return;
    }
    auto problem = accountProblem(*json);
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
