#include "controllers/SettingsController.h"
#include "controllers/settings/SettingsControllerInternal.h"
#include "filters/AdminFilter.h"
#include "filters/Viewer.h"
#include "security/Validate.h"
#include "services/UserRole.h"

namespace pyracms {

void SettingsController::list(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

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
    withAdminFlag(req, tenantId, [this, db, tenantId, callback](bool admin) {
        settingsService_.listSettings(
            db, tenantId,
            [admin, callback](const std::vector<SettingDto> &settings) {
                Json::Value result(Json::arrayValue);
                for (const auto &s : settings) {
                    if (!admin && isSensitiveSettingName(s.name))
                        continue;
                    Json::Value item;
                    item["id"] = s.id;
                    item["tenantId"] = s.tenantId;
                    item["name"] = s.name;
                    item["value"] = s.value;
                    result.append(item);
                }
                callback(drogon::HttpResponse::newHttpJsonResponse(result));
            });
    });
}

} // namespace pyracms
