#include "services/CacheService.h"
#include "services/ElasticsearchService.h"
#include "services/search/SearchServiceInternal.h"

#include <json/json.h>
#include <sstream>

// GCOVR_EXCL_START (Elasticsearch/Redis glue: needs a live cluster)
namespace pyracms {

void esSearch(int tenantId, const std::string &query, const std::string &type,
              int limit, int offset, SearchResultsCb cb,
              std::function<void()> unavailable) {
    // Pages are cached separately (the key must not ignore limit/offset).
    auto cacheKey = CacheService::searchKey(tenantId, query, type) + ":" +
                    std::to_string(limit) + ":" + std::to_string(offset);
    auto &cache = CacheService::instance();
    if (!cache.isConnected()) {
        // No Redis - search ES directly
        ElasticsearchService::instance().search(tenantId, query, type, limit,
                                                offset, cb, unavailable);
        return;
    }
    cache.get(cacheKey, [tenantId, query, type, limit, offset, cb, cacheKey,
                         unavailable](const std::string &cached, bool found) {
        SearchResults hit;
        if (found && esParseCachedSearch(cached, hit)) {
            cb(hit);
            return;
        }
        // Cache miss - search ES and cache the result for 60 seconds
        ElasticsearchService::instance().search(
            tenantId, query, type, limit, offset,
            [cb, cacheKey](const SearchResults &results) {
                CacheService::instance().set(
                    cacheKey, esSerializeSearch(results), 60, [](bool) {});
                cb(results);
            },
            unavailable);
    });
}

} // namespace pyracms
// GCOVR_EXCL_STOP
