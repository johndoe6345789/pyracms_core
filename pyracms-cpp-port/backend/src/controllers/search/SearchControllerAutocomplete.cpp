#include "controllers/SearchController.h"
#include "filters/UserVisibility.h"

namespace pyracms {

void SearchController::autocomplete(
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

    auto q = req->getParameter("q");
    if (q.empty()) {
        callback(drogon::HttpResponse::newHttpJsonResponse(
            Json::Value(Json::arrayValue)));
        return;
    }

    int tenantId = std::stoi(tenantIdStr);
    int limit = 10;
    auto limitStr = req->getParameter("limit");
    limit = clampLimit(limitStr, limit, 100);

    auto db = drogon::app().getDbClient();

    searchService_.autocomplete(
        db, tenantId, q, limit,
        [callback](const std::vector<AutocompleteItem> &items) {
            Json::Value result(Json::arrayValue);
            for (const auto &item : items) {
                Json::Value jsonItem;
                jsonItem["text"] = item.text;
                jsonItem["type"] = item.type;
                jsonItem["url"] = item.url;
                result.append(jsonItem);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
