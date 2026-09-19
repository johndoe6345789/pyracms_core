#include "services/DbError.h"
#include "services/ElasticsearchService.h"
#include "services/elasticsearch/ElasticsearchServiceInternal.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

void esSyncGameDeps(ElasticsearchService &es,
                    const drogon::orm::DbClientPtr &db, int tenantId) {
    db->execSqlAsync(
        "SELECT id, name, display_name, description, created_at "
        "FROM gamedep_pages WHERE tenant_id = $1",
        [&es, tenantId](const drogon::orm::Result &result) {
            for (const auto &row : result) {
                es.indexGameDep(tenantId, row["id"].as<int>(),
                                row["name"].as<std::string>(),
                                row["display_name"].as<std::string>(),
                                row["description"].isNull()
                                    ? ""
                                    : row["description"].as<std::string>(),
                                row["created_at"].as<std::string>());
            }
            LOG_INFO << "Synced " << result.size()
                     << " gamedeps to Elasticsearch";
        },
        [](const drogon::orm::DrogonDbException &e) {
            LOG_ERROR << "ES sync gamedeps failed: " << dbError(e);
        },
        tenantId);
}

} // namespace pyracms
