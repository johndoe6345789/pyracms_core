#include "services/ElasticsearchService.h"
#include "services/elasticsearch/EsDocs.h"
#include "services/elasticsearch/EsHttp.h"

#include <set>

namespace pyracms {

// Current state of each key: still searchable -> index it; gone, private or
// unpublished since -> delete it. One _bulk request either way.
void ElasticsearchService::flush(const DbClientPtr &db,
                                 const std::string &keys,
                                 std::function<void(bool)> done) {
    db->execSqlAsync(
        "SELECT d.* FROM search_documents d JOIN (" + std::string(kUnpackKeys) +
            ") k ON k.doc_type = d.doc_type AND k.doc_id = d.doc_id",
        [this, keys, done](const drogon::orm::Result &rows) {
            std::string ndjson;
            std::set<std::string> live;
            for (const auto &row : rows) {
                ndjson += esIndexLines(row);
                live.insert(row["doc_type"].as<std::string>() + ":" +
                            std::to_string(row["doc_id"].as<int>()));
            }
            size_t at = 0;
            while (at < keys.size()) {
                auto end = keys.find(',', at);
                auto key = keys.substr(at, end - at);
                if (!live.count(key))
                    ndjson += esDeleteLine(key);
                at = end == std::string::npos ? keys.size() : end + 1;
            }
            esRequest(url_, drogon::Post, "/_bulk?refresh=false", ndjson,
                      30.0,
                      [done](const EsReply &r) {
                          done(r.ok && r.status == 200 &&
                               !esBulkFailed(r.json));
                      },
                      true);
        },
        [done](const drogon::orm::DrogonDbException &) { done(false); },
        keys);
}

} // namespace pyracms
