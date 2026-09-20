#include "controllers/UserController.h"
#include "filters/AdminFilter.h"
#include "filters/UserVisibility.h"

namespace pyracms {

// Listing accounts needs a login. Results stay inside the caller's own
// site (only the platform owner spans sites) and email addresses appear
// only for administrators, so the mention box gets names but no emails.
// A site owner (platform token) names the site with ?tenant_id= and then
// sees that site's accounts in full.
void UserController::list(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {
    int viewerId = req->attributes()->get<int>("userId");
    int tenant = req->attributes()->get<int>("tenantId");
    int limit = clampLimit(req->getParameter("limit"), 50, 200);
    int offset = clampOffset(req->getParameter("offset"));
    auto search = req->getParameter("search");
    auto username = req->getParameter("username");
    auto db = drogon::app().getDbClient();
    userService_.getUserRole(
        db, viewerId,
        [=](const std::optional<UserRole> &role) {
            int raw = static_cast<int>(role.value_or(UserRole::User));
            int scope = userListScope(raw, tenant);
            int named = 0;
            try {
                named = std::stoi(req->getParameter("tenant_id"));
            } catch (...) {
            }
            bool ask = named > 0 && scope != -1 && tenant == 0;
            auto run = [=](bool owns) {
                int sc = owns ? named : scope;
                int owned = owns ? named : -1;
                userService_.listUsersScoped(
                    db, sc, search, username, limit, offset,
                    [=](const std::vector<UserDto> &users) {
                        Json::Value out(Json::arrayValue);
                        for (const auto &u : users) {
                            Json::Value item;
                            item["id"] = u.id;
                            item["username"] = u.username;
                            item["fullName"] = u.fullName;
                            item["createdAt"] = u.createdAt;
                            if (canSeeEmail(raw, viewerId, tenant, u.id,
                                            u.tenantId) ||
                                u.tenantId == owned) {
                                item["email"] = u.email;
                                item["banned"] = u.banned;
                                item["role"] = static_cast<int>(u.role);
                                item["siteOwner"] = u.siteOwner;
                                item["lastAdmin"] = u.lastAdmin;
                            }
                            out.append(item);
                        }
                        callback(
                            drogon::HttpResponse::newHttpJsonResponse(out));
                    });
            };
            if (!ask)
                return run(false);
            AdminFilter::ownerLookup()(viewerId, named, run);
        });
}

} // namespace pyracms
