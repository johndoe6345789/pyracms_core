#include "services/ElasticsearchService.h"
#include "services/elasticsearch/EsDocs.h"

namespace pyracms {

static constexpr int kBatch = 200;

// Takes a batch off the outbox (rows leave it in the same statement, so
// two callers never send the same change) and flushes it; a failed flush
// puts the batch back to be retried on the next tick.
void ElasticsearchService::drain(const DbClientPtr &db) {
    if (!configured_) { // no cluster: keep the queue from growing forever
        db->execSqlAsync("DELETE FROM search_outbox WHERE queued_at < "
                         "NOW() - interval '1 hour'",
                         [](const drogon::orm::Result &) {},
                         [](const drogon::orm::DrogonDbException &) {});
        return;
    }
    if (draining_.exchange(true))
        return;
    ensureIndex(db, [this, db](bool ready) {
        if (!ready) {
            draining_ = false;
            return;
        }
        db->execSqlAsync(
            "WITH taken AS (DELETE FROM search_outbox WHERE id IN "
            "(SELECT id FROM search_outbox ORDER BY id LIMIT " +
                std::to_string(kBatch) +
                " FOR UPDATE SKIP LOCKED) RETURNING doc_type, doc_id) "
                "SELECT DISTINCT doc_type, doc_id FROM taken",
            [this, db](const drogon::orm::Result &rows) {
                std::string keys;
                for (const auto &r : rows)
                    keys += (keys.empty() ? "" : ",") +
                            r["doc_type"].as<std::string>() + ":" +
                            std::to_string(r["doc_id"].as<int>());
                if (keys.empty()) {
                    draining_ = false;
                    return;
                }
                flush(db, keys, [this, db, keys](bool ok) {
                    auto more = [this, db, ok]() {
                        draining_ = false;
                        if (ok)
                            drain(db); // more may be waiting
                    };
                    if (ok)
                        return more();
                    db->execSqlAsync(
                        "INSERT INTO search_outbox (doc_type, doc_id) " +
                            std::string(kUnpackKeys),
                        [more](const drogon::orm::Result &) { more(); },
                        [more](const drogon::orm::DrogonDbException &) {
                            more();
                        },
                        keys);
                });
            },
            [this](const drogon::orm::DrogonDbException &) {
                draining_ = false;
            });
    });
}

} // namespace pyracms
