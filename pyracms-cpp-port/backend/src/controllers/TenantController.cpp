#include "controllers/TenantController.h"

namespace pyracms {

void TenantController::list(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto db = drogon::app().getDbClient();
    tenantService_.listTenants(
        db, [callback](const std::vector<TenantDto> &tenants) {
            Json::Value result(Json::arrayValue);
            for (const auto &t : tenants) {
                Json::Value item;
                item["id"] = t.id;
                item["slug"] = t.slug;
                item["displayName"] = t.displayName;
                item["description"] = t.description;
                item["ownerId"] = t.ownerId;
                item["createdAt"] = t.createdAt;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void TenantController::getBySlug(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &slug) {

    auto db = drogon::app().getDbClient();
    tenantService_.findBySlug(
        db, slug,
        [callback](const std::optional<TenantDto> &tenant) {
            if (!tenant) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = "Tenant not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["id"] = tenant->id;
            result["slug"] = tenant->slug;
            result["displayName"] = tenant->displayName;
            result["description"] = tenant->description;
            result["ownerId"] = tenant->ownerId;
            result["createdAt"] = tenant->createdAt;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void TenantController::create(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("slug") || !(*json).isMember("displayName")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "slug and displayName required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto slug = (*json)["slug"].asString();
    auto displayName = (*json)["displayName"].asString();
    auto description = (*json).get("description", "").asString();
    auto ownerId = req->attributes()->get<int>("userId");

    auto db = drogon::app().getDbClient();
    tenantService_.createTenant(
        db, slug, displayName, description, ownerId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k409Conflict);
                callback(resp);
                return;
            }

            Json::Value result;
            result["success"] = true;
            auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
            resp->setStatusCode(drogon::k201Created);
            callback(resp);
        });
}

void TenantController::remove(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto db = drogon::app().getDbClient();
    tenantService_.deleteTenant(
        db, id,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }

            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
