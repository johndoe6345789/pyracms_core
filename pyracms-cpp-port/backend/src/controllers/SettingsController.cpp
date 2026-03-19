#include "controllers/SettingsController.h"

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
    settingsService_.listSettings(
        db, tenantId,
        [callback](const std::vector<SettingDto> &settings) {
            Json::Value result(Json::arrayValue);
            for (const auto &s : settings) {
                Json::Value item;
                item["id"] = s.id;
                item["tenantId"] = s.tenantId;
                item["name"] = s.name;
                item["value"] = s.value;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

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
    settingsService_.getSetting(
        db, tenantId, name,
        [callback](const std::optional<SettingDto> &setting) {
            if (!setting) {
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
}

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

    int tenantId = (*json)["tenantId"].asInt();
    auto value = (*json)["value"].asString();

    auto db = drogon::app().getDbClient();
    settingsService_.createOrUpdateSetting(
        db, tenantId, name, value,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
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
        db, tenantId, name,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
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
