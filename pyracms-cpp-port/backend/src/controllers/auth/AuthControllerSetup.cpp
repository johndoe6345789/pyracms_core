#include "controllers/AuthController.h"
#include "controllers/auth/AccountInput.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

// Does the platform still need its first account? Public, so the first
// visitor is sent to the setup screen.
void AuthController::setupStatus(HttpReq, HttpCbRef callback) {
    drogon::app().getDbClient()->execSqlAsync(
        "SELECT NOT EXISTS (SELECT 1 FROM users WHERE tenant_id IS NULL "
        "AND role >= 4) AS needs",
        [callback](const drogon::orm::Result &r) {
            Json::Value out;
            out["needsSetup"] = r[0]["needs"].as<bool>();
            callback(drogon::HttpResponse::newHttpJsonResponse(out));
        },
        [callback](const drogon::orm::DrogonDbException &) {
            sendError(callback, "Database error",
                      drogon::k500InternalServerError);
        });
}

// First-run setup: creates the Platform Owner once, and signs them in.
void AuthController::setup(HttpReq req, HttpCbRef callback) {
    auto json = req->getJsonObject();
    auto problem = json ? accountProblem(*json) : "username, email, and "
                                                   "password required";
    if (!problem.empty())
        return sendError(callback, problem, drogon::k400BadRequest);
    auto username = (*json)["username"].asString();
    userService_.createFounder(
        drogon::app().getDbClient(), 0, username,
        (*json).get("fullName", "").asString(),
        (*json)["email"].asString(),
        authService_.hashPassword((*json)["password"].asString()),
        [=](bool ok, const std::string &err) {
            if (!ok)
                return sendError(callback,
                                 err == "Already has an administrator"
                                     ? "Setup has already been completed"
                                     : err,
                                 drogon::k409Conflict);
            registerDone(0, "", username, true, callback);
        });
}

} // namespace pyracms
