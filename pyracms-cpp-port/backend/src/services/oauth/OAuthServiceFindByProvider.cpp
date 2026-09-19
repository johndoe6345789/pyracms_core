#include "services/DbError.h"
#include "services/OAuthService.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

void OAuthService::findByProvider(const DbClientPtr &db,
                                  const std::string &provider,
                                  const std::string &providerId,
                                  std::function<void(std::optional<int>)> cb) {
    db->execSqlAsync(
        "SELECT user_id FROM oauth_providers "
        "WHERE provider = $1 AND provider_user_id = $2",
        [cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(result[0]["user_id"].as<int>());
            }
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(std::nullopt); },
        provider, providerId);
}

} // namespace pyracms
