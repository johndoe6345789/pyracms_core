#include "services/elasticsearch/EsQuery.h"

namespace pyracms {

SearchResults esParseSearch(const Json::Value &root, const std::string &query) {
    SearchResults out;
    out.query = query;
    out.totalCount = root["hits"]["total"]["value"].asInt();
    for (const auto &hit : root["hits"]["hits"]) {
        const auto &src = hit["_source"];
        SearchResultItem item;
        item.type = src["type"].asString();
        item.id = src["ref_id"].asInt();
        item.title = src["title"].asString();
        item.url = src["url"].asString();
        item.rank = hit["_score"].asDouble();
        item.createdAt = src["created_at"].asString();
        item.snippet = hit["highlight"]["body"][0].asString();
        if (item.snippet.empty())
            item.snippet = src["summary"].asString();
        out.items.push_back(item);
    }
    for (const auto &b : root["aggregations"]["types"]["buckets"])
        out.facets[b["key"].asString()] = b["doc_count"].asInt();
    return out;
}

std::vector<AutocompleteItem> esParseAutocomplete(const Json::Value &root) {
    std::vector<AutocompleteItem> out;
    for (const auto &hit : root["hits"]["hits"]) {
        const auto &src = hit["_source"];
        out.push_back({src["title"].asString(), src["type"].asString(),
                       src["url"].asString()});
    }
    return out;
}

} // namespace pyracms
