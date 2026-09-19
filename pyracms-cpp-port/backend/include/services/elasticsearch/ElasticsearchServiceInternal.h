#pragma once

#include "services/DbError.h"
#include "services/ElasticsearchService.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

// PostgreSQL timestamps ("2026-09-19 01:57:16.4+00") and "" are not valid
// for the index's date field, which made every index call fail silently.
inline Json::Value isoDate(std::string s) {
    if (s.empty())
        return Json::Value(Json::nullValue);
    auto space = s.find(' ');
    if (space != std::string::npos)
        s[space] = 'T';
    auto tz = s.find_last_of("+-");
    if (tz != std::string::npos && tz > 10 && s.size() - tz == 3)
        s += ":00";
    return Json::Value(s);
}

// syncFromDatabase steps, one per indexed content type.
void esSyncArticles(ElasticsearchService &es,
                    const drogon::orm::DbClientPtr &db, int tenantId);
void esSyncForumPosts(ElasticsearchService &es,
                      const drogon::orm::DbClientPtr &db, int tenantId);
void esSyncGameDeps(ElasticsearchService &es,
                    const drogon::orm::DbClientPtr &db, int tenantId);

// search(): request construction and response parsing.
std::string esSearchIndexes(const std::string &type);
std::string esSearchBody(int tenantId, const std::string &query, int limit,
                         int offset);
SearchResults esParseSearch(const Json::Value &root, const std::string &query);

} // namespace pyracms
