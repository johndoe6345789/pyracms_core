#include "controllers/MenuController.h"

namespace pyracms {

void MenuController::listGroups(
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
    menuService_.listMenuGroups(
        db, tenantId,
        [callback](const std::vector<MenuGroupDto> &groups) {
            Json::Value result(Json::arrayValue);
            for (const auto &g : groups) {
                Json::Value item;
                item["id"] = g.id;
                item["name"] = g.name;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void MenuController::createGroup(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("tenantId") || !(*json).isMember("name")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenantId and name are required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int tenantId = (*json)["tenantId"].asInt();
    auto name = (*json)["name"].asString();

    auto db = drogon::app().getDbClient();
    menuService_.createMenuGroup(
        db, tenantId, name,
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

void MenuController::deleteGroup(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto db = drogon::app().getDbClient();
    menuService_.deleteMenuGroup(
        db, id,
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

void MenuController::listItems(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto db = drogon::app().getDbClient();
    menuService_.listMenuItems(
        db, id,
        [callback](const std::vector<MenuItemDto> &items) {
            Json::Value result(Json::arrayValue);
            for (const auto &i : items) {
                Json::Value item;
                item["id"] = i.id;
                item["name"] = i.name;
                item["routePath"] = i.routePath;
                item["url"] = i.url;
                item["type"] = i.type;
                item["groupId"] = i.groupId;
                item["position"] = i.position;
                item["permissions"] = i.permissions;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void MenuController::createItem(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("name")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "name is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto name = (*json)["name"].asString();
    auto routePath = (*json).get("routePath", "").asString();
    auto url = (*json).get("url", "").asString();
    auto type = (*json).get("type", "").asString();
    int position = (*json).get("position", 0).asInt();
    auto permissions = (*json).get("permissions", "").asString();

    auto db = drogon::app().getDbClient();
    menuService_.createMenuItem(
        db, name, routePath, url, type, id, position, permissions,
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

void MenuController::updateItem(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto json = req->getJsonObject();
    if (!json) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "Invalid JSON body";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto db = drogon::app().getDbClient();
    menuService_.updateMenuItem(
        db, id, *json,
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

void MenuController::deleteItem(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto db = drogon::app().getDbClient();
    menuService_.deleteMenuItem(
        db, id,
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
