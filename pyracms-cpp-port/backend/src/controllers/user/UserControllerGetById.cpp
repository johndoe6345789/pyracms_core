#include "controllers/UserController.h"
#include "filters/AdminFilter.h"
#include "filters/UserVisibility.h"

namespace pyracms {

static void notFound(
    const std::function<void(const drogon::HttpResponsePtr &)> &cb) {
    auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
    (*resp->jsonObject())["error"] = "User not found";
    resp->setStatusCode(drogon::k404NotFound);
    cb(resp);
}

// Public profile fields for anyone signed in on the same site; email and
// the account's private settings only for the account itself or an
// administrator. Accounts of another site look like they do not exist.
void UserController::getById(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {
    int viewerId = req->attributes()->get<int>("userId");
    int tenant = req->attributes()->get<int>("tenantId");
    auto db = drogon::app().getDbClient();
    userService_.getUserRole(
        db, viewerId,
        [=, this](const std::optional<UserRole> &role) {
            int raw = static_cast<int>(role.value_or(UserRole::User));
            userService_.findById(
                db, id, [=](const std::optional<UserDto> &user) {
                    if (!user) {
                        notFound(callback);
                        return;
                    }
                    auto show = [=](bool owner) {
                        if (!owner &&
                            !canViewUser(tenant, raw, user->tenantId))
                            return notFound(callback);
                        Json::Value out;
                        out["id"] = user->id;
                        out["username"] = user->username;
                        out["fullName"] = user->fullName;
                        out["website"] = user->website;
                        out["aboutme"] = user->aboutme;
                        out["createdAt"] = user->createdAt;
                        if (owner || canSeeEmail(raw, viewerId, tenant,
                                                 user->id, user->tenantId)) {
                            out["email"] = user->email;
                            out["timezone"] = user->timezone;
                            out["banned"] = user->banned;
                        }
                        callback(
                            drogon::HttpResponse::newHttpJsonResponse(out));
                    };
                    // A site's owner reads its accounts in full.
                    if (canViewUser(tenant, raw, user->tenantId) ||
                        user->tenantId == 0)
                        return show(false);
                    AdminFilter::ownerLookup()(viewerId, user->tenantId,
                                               show);
                });
        });
}

} // namespace pyracms
