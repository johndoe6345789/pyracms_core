#include "controllers/SearchController.h"

namespace pyracms {

void SearchController::search(
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

    auto query = req->getParameter("q");
    if (query.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "q (query) parameter is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int tenantId = std::stoi(tenantIdStr);
    auto type = req->getParameter("type");
    int limit = 20;
    int offset = 0;
    auto limitStr = req->getParameter("limit");
    auto offsetStr = req->getParameter("offset");
    if (!limitStr.empty()) limit = std::stoi(limitStr);
    if (!offsetStr.empty()) offset = std::stoi(offsetStr);

    auto db = drogon::app().getDbClient();

    searchService_.search(
        db, tenantId, query, type, limit, offset,
        [callback](const SearchResults &results) {
            Json::Value response;
            response["query"] = results.query;
            response["totalCount"] = results.totalCount;
            response["items"] = Json::Value(Json::arrayValue);

            for (const auto &item : results.items) {
                Json::Value jsonItem;
                jsonItem["type"] = item.type;
                jsonItem["id"] = item.id;
                jsonItem["title"] = item.title;
                jsonItem["snippet"] = item.snippet;
                jsonItem["url"] = item.url;
                jsonItem["rank"] = item.rank;
                jsonItem["createdAt"] = item.createdAt;
                response["items"].append(jsonItem);
            }

            callback(drogon::HttpResponse::newHttpJsonResponse(response));
        });
}

} // namespace pyracms
