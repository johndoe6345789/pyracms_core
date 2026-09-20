#include "controllers/SiteSignupController.h"
#include "filters/TenantGuard.h"

#include <drogon/drogon.h>

namespace pyracms {

// Reply with the new administrator's session, so creating a site also
// signs the creator in to it.
void SiteSignupController::finish(int tenantId, const std::string &slug,
                                  const std::string &username,
                                  HttpCb callback) {
    userService_.findByUsername(
        drogon::app().getDbClient(), tenantId, username,
        [=](const std::optional<UserDto> &u) {
            if (!u)
                return callback(filterError("Site created; please sign in",
                                            drogon::k500InternalServerError));
            Json::Value out, user, site;
            user["id"] = u->id;
            user["username"] = u->username;
            user["role"] = static_cast<int>(u->role);
            user["roleName"] = roleName(u->role);
            user["tenantId"] = tenantId;
            user["tenantSlug"] = slug;
            site["id"] = tenantId;
            site["slug"] = slug;
            out["token"] =
                authService_.generateToken(u->id, u->username, tenantId);
            out["user"] = user;
            out["site"] = site;
            auto resp = drogon::HttpResponse::newHttpJsonResponse(out);
            resp->setStatusCode(drogon::k201Created);
            callback(resp);
        });
}

} // namespace pyracms
