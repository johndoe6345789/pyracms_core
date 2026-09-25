#include "services/elasticsearch/EsDocs.h"

#include "services/elasticsearch/EsHttp.h"
#include "services/elasticsearch/EsMapping.h"

#include <algorithm>

namespace pyracms {

std::string esIsoDate(std::string s) {
    auto space = s.find(' ');
    if (space != std::string::npos)
        s[space] = 'T';
    auto tz = s.find_last_of("+-");
    if (tz != std::string::npos && tz > 10 && s.size() - tz == 3)
        s += ":00";
    return s;
}

static Json::Value action(const char *verb, const std::string &key) {
    Json::Value a;
    a[verb]["_index"] = kEsIndex;
    a[verb]["_id"] = key;
    return a;
}

std::string esIndexLines(const drogon::orm::Row &row) {
    auto type = row["doc_type"].as<std::string>();
    auto id = row["doc_id"].as<int>();
    auto body = row["body"].as<std::string>();
    if (body.size() > 100000)
        body.resize(100000);
    std::string summary = body.substr(0, 200);
    std::replace_if(summary.begin(), summary.end(),
                    [](unsigned char c) { return c < 32; }, ' ');
    Json::Value doc;
    doc["tenant_id"] = row["tenant_id"].as<int>();
    doc["type"] = type;
    doc["ref_id"] = id;
    doc["title"] = row["title"].as<std::string>();
    doc["body"] = body;
    doc["tags"] = row["tags"].as<std::string>();
    doc["author"] = row["author"].as<std::string>();
    doc["url"] = row["url"].as<std::string>();
    doc["summary"] = summary;
    doc["created_at"] = esIsoDate(row["created_at"].as<std::string>());
    return esWrite(action("index", type + ":" + std::to_string(id))) + "\n" +
           esWrite(doc) + "\n";
}

std::string esDeleteLine(const std::string &key) {
    return esWrite(action("delete", key)) + "\n";
}

bool esBulkFailed(const Json::Value &reply) {
    for (const auto &item : reply["items"])
        for (const auto &verb : item.getMemberNames())
            if (item[verb].isMember("error"))
                return true;
    return reply.isNull();
}

} // namespace pyracms
