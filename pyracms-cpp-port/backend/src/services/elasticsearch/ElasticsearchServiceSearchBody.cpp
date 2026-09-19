#include "services/DbError.h"
#include "services/ElasticsearchService.h"
#include "services/elasticsearch/ElasticsearchServiceInternal.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

std::string esSearchIndexes(const std::string &type) {
    std::string indexes = "pyracms_articles,pyracms_forum_posts,pyracms_"
                          "snippets,pyracms_gamedeps";
    if (type == "article")
        indexes = "pyracms_articles";
    else if (type == "forum_post")
        indexes = "pyracms_forum_posts";
    else if (type == "snippet")
        indexes = "pyracms_snippets";
    else if (type == "gamedep")
        indexes = "pyracms_gamedeps";
    return indexes;
}

std::string esSearchBody(int tenantId, const std::string &query, int limit,
                         int offset) {
    Json::Value esQuery;
    Json::Value boolQuery;

    // Must match tenant
    Json::Value tenantFilter;
    tenantFilter["term"]["tenant_id"] = tenantId;
    boolQuery["filter"].append(tenantFilter);

    // Multi-match across title and content
    Json::Value multiMatch;
    multiMatch["multi_match"]["query"] = query;
    multiMatch["multi_match"]["fields"].append("title^3");
    multiMatch["multi_match"]["fields"].append("content");
    multiMatch["multi_match"]["type"] = "best_fields";
    multiMatch["multi_match"]["fuzziness"] = "AUTO";
    boolQuery["must"].append(multiMatch);

    esQuery["query"]["bool"] = boolQuery;
    esQuery["from"] = offset;
    esQuery["size"] = limit;
    esQuery["highlight"]["fields"]["title"] = Json::objectValue;
    esQuery["highlight"]["fields"]["content"]["fragment_size"] = 200;
    esQuery["highlight"]["fields"]["content"]["number_of_fragments"] = 1;

    // Aggregation for facets
    esQuery["aggs"]["types"]["terms"]["field"] = "type";

    Json::StreamWriterBuilder writer;
    return Json::writeString(writer, esQuery);
}

} // namespace pyracms
