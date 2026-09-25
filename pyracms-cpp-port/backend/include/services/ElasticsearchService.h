#pragma once

#include "SearchService.h"

#include <atomic>
#include <drogon/drogon.h>
#include <functional>
#include <json/json.h>
#include <string>
#include <vector>

namespace pyracms {

// Elasticsearch as the search engine. One index holds every searchable
// document; search_documents (SQL) says what those are and the
// search_outbox table (filled by triggers) says which changed. Nothing
// here blocks: an unreachable cluster just makes callers fall back to
// PostgreSQL full-text search.
class ElasticsearchService {
  public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using Unavailable = std::function<void()>;

    static ElasticsearchService &instance();

    // Reads ELASTICSEARCH_URL; without it everything else is inert.
    void initialize();
    bool isConfigured() const { return configured_; }

    void search(int tenantId, const std::string &query,
                const std::string &type, int limit, int offset,
                std::function<void(const SearchResults &)> cb,
                Unavailable unavailable);
    void autocomplete(
        int tenantId, const std::string &prefix, int limit,
        std::function<void(const std::vector<AutocompleteItem> &)> cb,
        Unavailable unavailable);

    // Moves pending changes into the index (or, with no cluster, discards
    // old ones). Called by a timer; overlapping calls are skipped.
    void drain(const DbClientPtr &db);
    // Forget this site's documents, then queue all of them again.
    void reindexTenant(const DbClientPtr &db, int tenantId,
                       std::function<void(bool, int, const std::string &)> cb);
    // Engine, reachability, document counts per type, queue length.
    void status(const DbClientPtr &db, int tenantId,
                std::function<void(const Json::Value &)> cb);

  private:
    // Creates the index (and queues every document) when it is missing.
    void ensureIndex(const DbClientPtr &db, std::function<void(bool)> done);
    // Sends the current state of `keys` ("type:id,...") to the index.
    void flush(const DbClientPtr &db, const std::string &keys,
               std::function<void(bool)> done);

    std::string url_;
    bool configured_ = false;
    std::atomic<bool> draining_{false};
    std::atomic<bool> indexReady_{false};
};

} // namespace pyracms
