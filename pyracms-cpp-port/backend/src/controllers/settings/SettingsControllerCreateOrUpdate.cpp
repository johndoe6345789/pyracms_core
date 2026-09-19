#include "controllers/SettingsController.h"
#include "controllers/settings/SettingsControllerInternal.h"
#include "filters/AdminFilter.h"
#include "filters/Viewer.h"
#include "security/Validate.h"
#include "services/UserRole.h"

namespace pyracms {

void SettingsController::createOrUpdate(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("tenantId") || !(*json).isMember("value")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenantId and value are required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    if (!(*json)["tenantId"].isInt() || !(*json)["value"].isString() ||
        !isSafeKey(name, 128) ||
        !isBoundedText((*json)["value"].asString(), 20000)) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "Invalid setting name or value";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }
    int tenantId = (*json)["tenantId"].asInt();
    auto value = (*json)["value"].asString();

    auto db = drogon::app().getDbClient();
    settingsService_.createOrUpdateSetting(
        db, tenantId, name, value,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }

            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
