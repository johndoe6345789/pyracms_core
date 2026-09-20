#include "services/AnalyticsService.h"

#include <algorithm>
#include <cctype>

namespace pyracms {

void AnalyticsService::recordSearch(const DbClientPtr &db, int tenantId,
                                    const std::string &query,
                                    int resultCount) {
    std::string q;
    for (unsigned char c : query)
        q += static_cast<char>(std::tolower(c));
    auto notSpace = [](unsigned char c) { return !std::isspace(c); };
    q.erase(q.begin(), std::find_if(q.begin(), q.end(), notSpace));
    q.erase(std::find_if(q.rbegin(), q.rend(), notSpace).base(), q.end());
    if (q.size() < 2 || q.size() > 200)
        return;
    db->execSqlAsync(
        "INSERT INTO search_queries (tenant_id, query, result_count) "
        "VALUES ($1, $2, $3)",
        [](const drogon::orm::Result &) {},
        [](const drogon::orm::DrogonDbException &) {}, tenantId, q,
        resultCount);
}

} // namespace pyracms
