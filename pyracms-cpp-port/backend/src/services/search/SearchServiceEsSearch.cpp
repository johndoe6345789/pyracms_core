#include "services/CacheService.h"
#include "services/ElasticsearchService.h"
#include "services/search/SearchServiceInternal.h"

#include <json/json.h>
#include <sstream>

// GCOVR_EXCL_START (Elasticsearch/Redis glue: needs a live cluster)
namespace pyracms {

void esSearch(int tenantId, const std::string &query, const std::string &type,
              int limit, int offset, SearchResultsCb cb) {
    auto cacheKey = CacheService::searchKey(tenantId, query, type);
    auto &cache = CacheService::instance();
    if (!cache.isConnected()) {
        // No Redis - search ES directly
        ElasticsearchService::instance().search(tenantId, query, type, limit,
                                                offset, cb);
        return;
    }
    cache.get(cacheKey, [tenantId, query, type, limit, offset, cb,
                         cacheKey](const std::string &cached, bool found) {
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
            });
    });
}

} // namespace pyracms
// GCOVR_EXCL_STOP
