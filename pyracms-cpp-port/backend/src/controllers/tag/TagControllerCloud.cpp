#include "controllers/TagController.h"
#include "filters/TenantGuard.h"
#include "filters/UserVisibility.h"

namespace pyracms {

void TagController::cloud(HttpReq req, HttpCbRef callback) {
    auto tenant = req->getParameter("tenant_id");
    if (tenant.empty() || tenant.size() > 9 ||
        tenant.find_first_not_of("0123456789") != std::string::npos)
        return callback(
            filterError("tenant_id is required", drogon::k400BadRequest));
    int limit = clampLimit(req->getParameter("limit"), 200, 500);
    tags_.cloud(drogon::app().getDbClient(), std::stoi(tenant), limit,
                [callback](const std::vector<TagCount> &all) {
                    Json::Value out(Json::arrayValue);
                    for (const auto &t : all) {
                        Json::Value item;
                        item["name"] = t.name;
                        item["count"] = t.articles + t.snippets;
                        item["articles"] = t.articles;
                        item["snippets"] = t.snippets;
                        out.append(item);
                    }
                    callback(drogon::HttpResponse::newHttpJsonResponse(out));
                });
}

} // namespace pyracms
