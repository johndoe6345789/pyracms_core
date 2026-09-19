#include "services/DbError.h"
#include "services/ElasticsearchService.h"
#include "services/elasticsearch/ElasticsearchServiceInternal.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

void ElasticsearchService::autocomplete(
    int tenantId, const std::string &prefix, int limit,
    std::function<void(const std::vector<AutocompleteItem> &)> cb) {
    Json::Value esQuery;
    Json::Value boolQuery;

    Json::Value tenantFilter;
    tenantFilter["term"]["tenant_id"] = tenantId;
    boolQuery["filter"].append(tenantFilter);

    Json::Value matchQuery;
    matchQuery["match"]["title.autocomplete"] = prefix;
    boolQuery["must"].append(matchQuery);

    esQuery["query"]["bool"] = boolQuery;
    esQuery["size"] = limit;
    esQuery["_source"].append("title");
    esQuery["_source"].append("type");
    esQuery["_source"].append("url");

    Json::StreamWriterBuilder writer;
    auto body = Json::writeString(writer, esQuery);

    auto response = httpRequest("POST",
                                "/pyracms_articles,pyracms_forum_posts,pyracms_"
                                "snippets,pyracms_gamedeps/_search",
                                body);
    auto root = parseJson(response);

    std::vector<AutocompleteItem> items;
    if (root.isMember("hits")) {
        for (const auto &hit : root["hits"]["hits"]) {
            AutocompleteItem item;
            item.text = hit["_source"]["title"].asString();
            item.type = hit["_source"]["type"].asString();
            item.url = hit["_source"]["url"].asString();
            items.push_back(item);
        }
    }

    cb(items);
}

} // namespace pyracms
