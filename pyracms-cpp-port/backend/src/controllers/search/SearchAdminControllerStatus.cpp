#include "controllers/QueryInt.h"
#include "controllers/SearchAdminController.h"
#include "filters/TenantGuard.h"
#include "services/ElasticsearchService.h"

namespace pyracms {

void SearchAdminController::status(HttpReq req, HttpCbRef callback) {
    int tenant = queryInt(req->getParameter("tenant_id"), 0);
    if (tenant <= 0)
        return callback(
            filterError("tenant_id is required", drogon::k400BadRequest));
    ElasticsearchService::instance().status(
        drogon::app().getDbClient(), tenant, [callback](const Json::Value &o) {
            callback(drogon::HttpResponse::newHttpJsonResponse(o));
        });
}

} // namespace pyracms
