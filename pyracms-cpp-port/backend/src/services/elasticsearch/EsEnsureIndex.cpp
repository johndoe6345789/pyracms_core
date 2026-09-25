#include "services/ElasticsearchService.h"
#include "services/elasticsearch/EsHttp.h"
#include "services/elasticsearch/EsMapping.h"

namespace pyracms {

// A missing index is created and every document queued for it, so a fresh
// cluster (or a wiped one) fills itself without anybody asking.
void ElasticsearchService::ensureIndex(const DbClientPtr &db,
                                       std::function<void(bool)> done) {
    if (indexReady_)
        return done(true);
    auto path = std::string("/") + kEsIndex;
    esRequest(url_, drogon::Head, path, "", 5.0, [=](const EsReply &head) {
        if (!head.ok)
            return done(false);
        if (head.status == 200) {
            indexReady_ = true;
            return done(true);
        }
        esRequest(url_, drogon::Put, path, esIndexDefinition(), 15.0,
                  [=](const EsReply &made) {
                      if (!made.ok || made.status >= 300)
                          return done(false);
                      indexReady_ = true;
                      LOG_INFO << "Created search index, queueing content";
                      db->execSqlAsync(
                          "INSERT INTO search_outbox (doc_type, doc_id) "
                          "SELECT doc_type, doc_id FROM search_documents",
                          [done](const drogon::orm::Result &) { done(true); },
                          [done](const drogon::orm::DrogonDbException &) {
                              done(true);
                          });
                  });
    });
}

} // namespace pyracms
