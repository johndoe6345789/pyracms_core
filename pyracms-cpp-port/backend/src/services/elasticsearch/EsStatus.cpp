#include "services/ElasticsearchService.h"
#include "services/elasticsearch/EsHttp.h"
#include "services/elasticsearch/EsMapping.h"

namespace pyracms {

// What the admin panel shows: what should be searchable (from Postgres),
// what the index holds, and how many changes are still waiting.
void ElasticsearchService::status(
    const DbClientPtr &db, int tenantId,
    std::function<void(const Json::Value &)> cb) {
    db->execSqlAsync(
        "SELECT d.doc_type, d.n, p.pending FROM (SELECT doc_type, "
        "count(*)::int AS n FROM search_documents WHERE tenant_id = $1 "
        "GROUP BY doc_type) d RIGHT JOIN (SELECT count(*)::int AS pending "
        "FROM search_outbox) p ON true",
        [=](const drogon::orm::Result &rows) {
            auto rep = std::make_shared<Json::Value>();
            auto &o = *rep;
            o["engine"] = configured_ ? "elasticsearch" : "postgresql";
            o["configured"] = configured_;
            o["reachable"] = false;
            o["source"] = Json::Value(Json::objectValue);
            o["indexed"] = Json::Value(Json::objectValue);
            o["pending"] = rows.empty() ? 0 : rows[0]["pending"].as<int>();
            for (const auto &r : rows)
                if (!r["doc_type"].isNull())
                    o["source"][r["doc_type"].as<std::string>()] =
                        r["n"].as<int>();
            if (!configured_)
                return cb(o);
            Json::Value q;
            q["size"] = 0;
            q["query"]["term"]["tenant_id"] = tenantId;
            q["aggs"]["types"]["terms"]["field"] = "type";
            esRequest(url_, drogon::Post,
                      std::string("/") + kEsIndex + "/_search", esWrite(q),
                      5.0, [rep, cb](const EsReply &r) {
                          auto &o = *rep;
                          o["reachable"] = r.ok;
                          o["indexReady"] = r.ok && r.status == 200;
                          for (const auto &b :
                               r.json["aggregations"]["types"]["buckets"])
                              o["indexed"][b["key"].asString()] =
                                  b["doc_count"].asInt();
                          cb(o);
                      });
        },
        [cb](const drogon::orm::DrogonDbException &) {
            Json::Value o;
            o["error"] = "Database error";
            cb(o);
        },
        tenantId);
}

} // namespace pyracms
