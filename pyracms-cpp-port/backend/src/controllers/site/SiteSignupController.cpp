#include "controllers/SiteSignupController.h"
#include "controllers/SiteInput.h"
#include "controllers/auth/AccountInput.h"
#include "filters/TenantGuard.h"

#include <drogon/drogon.h>

namespace pyracms {

// Site + its founding Administrator, created together; a failed second
// step removes the first so no empty site is left behind.
void SiteSignupController::create(HttpReq req, HttpCbRef callback) {
    auto json = req->getJsonObject();
    auto problem = json ? siteProblem(*json) : "slug and displayName required";
    if (problem.empty())
        problem = accountProblem((*json)["admin"]);
    if (!problem.empty())
        return callback(filterError(problem, drogon::k400BadRequest));
    auto slug = (*json)["slug"].asString();
    auto admin = (*json)["admin"];
    auto username = admin["username"].asString();
    auto db = drogon::app().getDbClient();
    tenantService_.createEmpty(
        db, slug, (*json)["displayName"].asString(),
        (*json).get("description", "").asString(),
        [=](int id, const std::string &) {
            if (!id)
                return callback(filterError("That site address is taken",
                                            drogon::k409Conflict));
            userService_.createFounder(
                db, id, username, admin.get("fullName", "").asString(),
                admin["email"].asString(),
                authService_.hashPassword(admin["password"].asString()),
                [=](bool ok, const std::string &) {
                    if (!ok) {
                        tenantService_.discard(db, id);
                        return callback(filterError(
                            "Could not create the administrator account",
                            drogon::k409Conflict));
                    }
                    tenantService_.adoptFounder(
                        db, id, [=](bool, const std::string &) {
                            finish(id, slug, username, callback);
                        });
                });
        });
}

} // namespace pyracms
