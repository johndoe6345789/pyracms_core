#include "controllers/SearchController.h"
#include "controllers/SearchItemJson.h"
#include "filters/UserVisibility.h"
#include "services/AnalyticsService.h"

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

    if (query.size() > 200) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "q is too long";
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
    limit = clampLimit(limitStr, limit, 100);
    offset = clampOffset(offsetStr);

    auto db = drogon::app().getDbClient();

    searchService_.search(
        db, tenantId, query, type, limit, offset,
        [=](const SearchResults &results) {
            // Only a fresh search counts, not paging or a facet click
            if (offset == 0 && type.empty())
                AnalyticsService::recordSearch(db, tenantId, query,
                                               results.totalCount);
            Json::Value response;
            response["query"] = results.query;
            response["totalCount"] = results.totalCount;
            response["items"] = Json::Value(Json::arrayValue);

            for (const auto &item : results.items) {
                response["items"].append(searchItemJson(item));
            }

            // Add facet counts
            response["facets"] = Json::Value(Json::objectValue);
            for (const auto &[type, count] : results.facets) {
                response["facets"][type] = count;
            }

            callback(drogon::HttpResponse::newHttpJsonResponse(response));
        });
}

} // namespace pyracms
