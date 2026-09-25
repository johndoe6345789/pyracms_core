#include "services/CacheService.h"
#include "services/ElasticsearchService.h"
#include "services/search/SearchServiceInternal.h"

#include <json/json.h>
#include <sstream>

// GCOVR_EXCL_START (Elasticsearch/Redis glue: needs a live cluster)
namespace pyracms {

namespace {
using Items = std::vector<AutocompleteItem>;

bool parseCached(const std::string &cached, Items &items) {
    Json::Value root;
    Json::CharReaderBuilder reader;
    std::istringstream stream(cached);
    std::string errors;
    if (!Json::parseFromStream(reader, stream, &root, &errors))
        return false;
    for (const auto &item : root) {
        AutocompleteItem ai;
        ai.text = item["text"].asString();
        ai.type = item["type"].asString();
        ai.url = item["url"].asString();
        items.push_back(ai);
    }
    return true;
}

std::string serialize(const Items &items) {
    Json::Value cacheVal(Json::arrayValue);
    for (const auto &item : items) {
        Json::Value ji;
        ji["text"] = item.text;
        ji["type"] = item.type;
        ji["url"] = item.url;
        cacheVal.append(ji);
    }
    Json::StreamWriterBuilder writer;
    return Json::writeString(writer, cacheVal);
}
} // namespace

void esAutocomplete(int tenantId, const std::string &prefix, int limit,
                    std::function<void(const Items &)> cb,
                    std::function<void()> unavailable) {
    auto cacheKey = CacheService::autocompleteKey(tenantId, prefix);
    auto &cache = CacheService::instance();
    if (!cache.isConnected()) {
        ElasticsearchService::instance().autocomplete(tenantId, prefix, limit,
                                                      cb, unavailable);
        return;
    }
    cache.get(cacheKey, [tenantId, prefix, limit, cb, cacheKey,
                         unavailable](const std::string &cached, bool found) {
        Items hit;
        if (found && parseCached(cached, hit)) {
            cb(hit);
            return;
        }
        // Cache for 30 seconds
        ElasticsearchService::instance().autocomplete(
            tenantId, prefix, limit, [cb, cacheKey](const Items &items) {
                CacheService::instance().set(cacheKey, serialize(items), 30,
                                             [](bool) {});
                cb(items);
            },
            unavailable);
    });
}

} // namespace pyracms
// GCOVR_EXCL_STOP
