#include "services/DbError.h"
#include "services/ElasticsearchService.h"
#include "services/elasticsearch/EsHttp.h"
#include "services/elasticsearch/EsMapping.h"

namespace pyracms {

// Drops the site's documents from the index (so anything deleted or made
// private since is gone too) and queues everything searchable again.
void ElasticsearchService::reindexTenant(
    const DbClientPtr &db, int tenantId,
    std::function<void(bool, int, const std::string &)> cb) {
    if (!configured_)
        return cb(false, 0, "Elasticsearch is not configured");
    ensureIndex(db, [=](bool ready) {
        if (!ready)
            return cb(false, 0, "Elasticsearch is not reachable");
        Json::Value q;
        q["query"]["term"]["tenant_id"] = tenantId;
        esRequest(
            url_, drogon::Post,
            std::string("/") + kEsIndex +
                "/_delete_by_query?conflicts=proceed&refresh=true",
            esWrite(q), 30.0, [=](const EsReply &r) {
                if (!r.ok || r.status != 200)
                    return cb(false, 0, "Could not clear the old index");
                db->execSqlAsync(
                    "INSERT INTO search_outbox (doc_type, doc_id) SELECT "
                    "doc_type, doc_id FROM search_documents "
                    "WHERE tenant_id = $1 RETURNING 1",
                    [cb](const drogon::orm::Result &rows) {
                        cb(true, static_cast<int>(rows.size()), "");
                    },
                    [cb](const drogon::orm::DrogonDbException &e) {
                        cb(false, 0, dbError(e));
                    },
                    tenantId);
            });
    });
}

} // namespace pyracms
