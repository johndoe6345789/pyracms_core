#include "controllers/PlatformSettingsController.h"
#include "filters/TenantGuard.h"

#include <drogon/drogon.h>

namespace pyracms {

void PlatformSettingsController::listSettings(HttpReq req, HttpCbRef callback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "SELECT key, value, description FROM platform_settings ORDER BY key",
        [callback](const drogon::orm::Result &rows) {
            Json::Value result(Json::arrayValue);
            for (const auto &row : rows) {
                Json::Value item;
                item["key"] = row["key"].as<std::string>();
                item["value"] = row["value"].as<std::string>();
                if (!row["description"].isNull())
                    item["description"] = row["description"].as<std::string>();
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        },
        [callback](const drogon::orm::DrogonDbException &) {
            auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
            (*resp->jsonObject())["error"] = "Database error";
            resp->setStatusCode(drogon::k500InternalServerError);
            callback(resp);
        });
}

void PlatformSettingsController::getSetting(HttpReq req, HttpCbRef callback,
                                           const std::string &key) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "SELECT key, value, description FROM platform_settings WHERE key = $1",
        [callback, key](const drogon::orm::Result &rows) {
            if (rows.empty()) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Setting not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            const auto &row = rows[0];
            Json::Value result;
            result["key"] = row["key"].as<std::string>();
            result["value"] = row["value"].as<std::string>();
            if (!row["description"].isNull())
                result["description"] = row["description"].as<std::string>();
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        },
        [callback](const drogon::orm::DrogonDbException &) {
            auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
            (*resp->jsonObject())["error"] = "Database error";
            resp->setStatusCode(drogon::k500InternalServerError);
            callback(resp);
        },
        key);
}

void PlatformSettingsController::setSetting(HttpReq req, HttpCbRef callback,
                                           const std::string &key) {
    auto json = req->getJsonObject();
    if (!json || !json->isMember("value")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "value field required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto value = (*json)["value"].asString();
    auto db = drogon::app().getDbClient();

    db->execSqlAsync(
        "UPDATE platform_settings SET value = $1, updated_at = NOW() "
        "WHERE key = $2 RETURNING key, value, description",
        [callback](const drogon::orm::Result &rows) {
            if (rows.empty()) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Setting not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            const auto &row = rows[0];
            Json::Value result;
            result["key"] = row["key"].as<std::string>();
            result["value"] = row["value"].as<std::string>();
            if (!row["description"].isNull())
                result["description"] = row["description"].as<std::string>();
            result["updated"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        },
        [callback](const drogon::orm::DrogonDbException &) {
            auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
            (*resp->jsonObject())["error"] = "Database error";
            resp->setStatusCode(drogon::k500InternalServerError);
            callback(resp);
        },
        value, key);
}

} // namespace pyracms
