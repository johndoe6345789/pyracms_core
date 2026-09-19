#include "controllers/UserController.h"
#include "filters/UserVisibility.h"

namespace pyracms {

// Listing accounts needs a login. Results stay inside the caller's own
// site (only the platform owner spans sites) and email addresses appear
// only for administrators, so the mention box gets names but no emails.
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
        [=, this](const std::optional<UserRole> &role) {
            int raw = static_cast<int>(role.value_or(UserRole::User));
            int scope = userListScope(raw, tenant);
            userService_.listUsersScoped(
                db, scope, search, username, limit, offset,
                [=](const std::vector<UserDto> &users) {
                    Json::Value out(Json::arrayValue);
                    for (const auto &u : users) {
                        Json::Value item;
                        item["id"] = u.id;
                        item["username"] = u.username;
                        item["fullName"] = u.fullName;
                        item["createdAt"] = u.createdAt;
                        if (canSeeEmail(raw, viewerId, tenant, u.id,
                                        u.tenantId)) {
                            item["email"] = u.email;
                            item["banned"] = u.banned;
                        }
                        out.append(item);
                    }
                    callback(drogon::HttpResponse::newHttpJsonResponse(out));
                });
        });
}

} // namespace pyracms
