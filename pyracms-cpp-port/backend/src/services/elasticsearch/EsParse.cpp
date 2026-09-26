#include "services/elasticsearch/EsQuery.h"

#include <sstream>

namespace pyracms {

// Body excerpts joined into one line, "..." between separate excerpts.
static std::string excerpt(const Json::Value &fragments) {
    std::string out;
    for (const auto &f : fragments) {
        if (!out.empty())
            out += " \xE2\x80\xA6 ";
        out += f.asString();
    }
    return out;
}

static std::vector<std::string> words(const std::string &s) {
    std::vector<std::string> out;
    std::istringstream in(s);
    for (std::string w; in >> w;)
        out.push_back(w);
    return out;
}

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
        item.author = src["author"].asString();
        item.tags = words(src["tags"].asString());
        item.titleMarked = hit["highlight"]["title"][0].asString();
        item.snippet = excerpt(hit["highlight"]["body"]);
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
                       src["url"].asString(),
                       excerpt(hit["highlight"]["body"])});
    }
    return out;
}

} // namespace pyracms
