#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

void AuthController::me(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    userService_.findById(
        db, userId, [db, callback](const std::optional<UserDto> &user) {
            if (!user) {
                sendError(callback, "User not found", drogon::k404NotFound);
                return;
            }
            auto finish = [user, callback](const std::string &slug) {
                Json::Value result = userJson(*user, slug);
                result["website"] = user->website;
                result["aboutme"] = user->aboutme;
                result["timezone"] = user->timezone;
                result["banned"] = user->banned;
                result["createdAt"] = user->createdAt;
                callback(drogon::HttpResponse::newHttpJsonResponse(result));
            };
            if (user->tenantId == 0) {
                finish("");
                return;
            }
            db->execSqlAsync(
                "SELECT slug FROM tenants WHERE id = $1",
                [finish](const drogon::orm::Result &r) {
                    finish(r.empty() ? "" : r[0]["slug"].as<std::string>());
                },
                [finish](const drogon::orm::DrogonDbException &) {
                    finish("");
                },
                user->tenantId);
        });
}

} // namespace pyracms
