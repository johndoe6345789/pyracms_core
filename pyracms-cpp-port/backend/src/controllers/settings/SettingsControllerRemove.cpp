#include "controllers/SettingsController.h"
#include "controllers/settings/SettingsControllerInternal.h"
#include "filters/AdminFilter.h"
#include "filters/Viewer.h"
#include "security/Validate.h"
#include "services/UserRole.h"

namespace pyracms {

void SettingsController::remove(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("tenantId")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenantId is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int tenantId = (*json)["tenantId"].asInt();

    auto db = drogon::app().getDbClient();
    settingsService_.deleteSetting(
        db, tenantId, name, [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
