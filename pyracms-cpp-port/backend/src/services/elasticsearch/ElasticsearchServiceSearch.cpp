#include "services/DbError.h"
#include "services/ElasticsearchService.h"
#include "services/elasticsearch/ElasticsearchServiceInternal.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

SearchResults esParseSearch(const Json::Value &rootIn,
                            const std::string &query) {
    auto &root = rootIn;
    SearchResults results;
    results.query = query;
    results.totalCount = 0;

    if (root.isMember("hits")) {
        auto &hits = root["hits"];
        results.totalCount = hits["total"]["value"].asInt();

        for (const auto &hit : hits["hits"]) {
            SearchResultItem item;
            auto &src = hit["_source"];
            item.type = src["type"].asString();
            item.id = std::stoi(hit["_id"].asString());
            item.title = src["title"].asString();
            item.url = src["url"].asString();
            item.rank = hit["_score"].asDouble();
            item.createdAt = src["created_at"].asString();

            // Use highlight if available
            if (hit.isMember("highlight") &&
                hit["highlight"].isMember("content")) {
                item.snippet = hit["highlight"]["content"][0].asString();
            } else {
                auto content = src["content"].asString();
                item.snippet = content.size() > 200
                                   ? content.substr(0, 200) + "..."
                                   : content;
            }

            results.items.push_back(item);
        }
    }

    // Facets from aggregation
    if (root.isMember("aggregations") &&
        root["aggregations"].isMember("types")) {
        for (const auto &bucket : root["aggregations"]["types"]["buckets"]) {
            results.facets[bucket["key"].asString()] =
                bucket["doc_count"].asInt();
        }
    }

    return results;
}

void ElasticsearchService::search(
    int tenantId, const std::string &query, const std::string &type, int limit,
    int offset, std::function<void(const SearchResults &)> cb) {
    auto indexes = esSearchIndexes(type);
    auto body = esSearchBody(tenantId, query, limit, offset);
    auto response = httpRequest("POST", "/" + indexes + "/_search", body);
    cb(esParseSearch(parseJson(response), query));
}

} // namespace pyracms
