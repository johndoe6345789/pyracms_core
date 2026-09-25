#include "controllers/QueryInt.h"
#include "controllers/SearchAdminController.h"
#include "filters/TenantGuard.h"
#include "services/CacheService.h"
#include "services/ElasticsearchService.h"

namespace pyracms {

// Clears this site's documents and queues them all again; the indexer
// timer then fills the index within seconds. GET /api/admin/search shows
// the queue draining.
void SearchAdminController::reindex(HttpReq req, HttpCbRef callback) {
    int tenant = queryInt(req->getParameter("tenant_id"), 0);
    if (tenant <= 0)
        return callback(
            filterError("tenant_id is required", drogon::k400BadRequest));
    ElasticsearchService::instance().reindexTenant(
        drogon::app().getDbClient(), tenant,
        [callback, tenant](bool ok, int queued, const std::string &error) {
            if (!ok)
                return callback(
                    filterError(error, drogon::k503ServiceUnavailable));
            CacheService::instance().invalidateSearch(tenant);
            Json::Value r;
            r["queued"] = queued;
            callback(drogon::HttpResponse::newHttpJsonResponse(r));
        });
}

} // namespace pyracms
