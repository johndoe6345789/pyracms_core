#include "services/CacheService.h"
#include "services/ElasticsearchService.h"
#include "services/search/SearchServiceInternal.h"

#include <json/json.h>
#include <sstream>

// GCOVR_EXCL_START (Elasticsearch/Redis glue: needs a live cluster)
namespace pyracms {

bool esParseCachedSearch(const std::string &cached, SearchResults &results) {
    Json::Value root;
    Json::CharReaderBuilder reader;
    std::istringstream stream(cached);
    std::string errors;
    if (!Json::parseFromStream(reader, stream, &root, &errors))
        return false;
    results.query = root["query"].asString();
    results.totalCount = root["totalCount"].asInt();
    for (const auto &item : root["items"]) {
        SearchResultItem sri;
        sri.type = item["type"].asString();
        sri.id = item["id"].asInt();
        sri.title = item["title"].asString();
        sri.snippet = item["snippet"].asString();
        sri.url = item["url"].asString();
        sri.rank = item["rank"].asDouble();
        sri.createdAt = item["createdAt"].asString();
        results.items.push_back(sri);
    }
    for (const auto &key : root["facets"].getMemberNames()) {
        results.facets[key] = root["facets"][key].asInt();
    }
    return true;
}

std::string esSerializeSearch(const SearchResults &results) {
    Json::Value cacheVal;
    cacheVal["query"] = results.query;
    cacheVal["totalCount"] = results.totalCount;
    cacheVal["items"] = Json::Value(Json::arrayValue);
    for (const auto &item : results.items) {
        Json::Value ji;
        ji["type"] = item.type;
        ji["id"] = item.id;
        ji["title"] = item.title;
        ji["snippet"] = item.snippet;
        ji["url"] = item.url;
        ji["rank"] = item.rank;
        ji["createdAt"] = item.createdAt;
        cacheVal["items"].append(ji);
    }
    cacheVal["facets"] = Json::Value(Json::objectValue);
    for (const auto &[k, v] : results.facets) {
        cacheVal["facets"][k] = v;
    }
    Json::StreamWriterBuilder writer;
    return Json::writeString(writer, cacheVal);
}

} // namespace pyracms
// GCOVR_EXCL_STOP
