#include "controllers/SettingsController.h"
#include "controllers/settings/SettingsControllerInternal.h"
#include "filters/AdminFilter.h"
#include "filters/Viewer.h"
#include "security/Validate.h"
#include "services/UserRole.h"

namespace pyracms {

void SettingsController::getByName(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &name) {

    auto tenantIdStr = req->getParameter("tenant_id");
    if (tenantIdStr.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenant_id is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int tenantId = std::stoi(tenantIdStr);
    auto db = drogon::app().getDbClient();
    withAdminFlag(
        req, tenantId, [this, db, tenantId, name, callback](bool admin) {
            settingsService_.getSetting(
                db, tenantId, name,
                [admin, callback](const std::optional<SettingDto> &setting) {
                    if (!setting ||
                        (!admin && isSensitiveSettingName(setting->name))) {
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(
                            Json::Value{});
                        (*resp->jsonObject())["error"] = "Setting not found";
                        resp->setStatusCode(drogon::k404NotFound);
                        callback(resp);
                        return;
                    }

                    Json::Value result;
                    result["id"] = setting->id;
                    result["tenantId"] = setting->tenantId;
                    result["name"] = setting->name;
                    result["value"] = setting->value;
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

} // namespace pyracms
