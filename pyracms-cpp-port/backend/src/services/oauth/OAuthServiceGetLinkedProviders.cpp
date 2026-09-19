#include "services/DbError.h"
#include "services/OAuthService.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

void OAuthService::getLinkedProviders(
    const DbClientPtr &db, int userId,
    std::function<void(const std::vector<OAuthLinkDto> &)> cb) {
    db->execSqlAsync(
        "SELECT id, user_id, provider, provider_user_id, email, display_name, "
        "created_at FROM oauth_providers WHERE user_id = $1",
        [cb](const drogon::orm::Result &result) {
            std::vector<OAuthLinkDto> links;
            links.reserve(result.size());
            for (const auto &row : result) {
                OAuthLinkDto dto;
                dto.id = row["id"].as<int>();
                dto.userId = row["user_id"].as<int>();
                dto.provider = row["provider"].as<std::string>();
                dto.providerUserId = row["provider_user_id"].as<std::string>();
                dto.email =
                    row["email"].isNull() ? "" : row["email"].as<std::string>();
                dto.displayName = row["display_name"].isNull()
                                      ? ""
                                      : row["display_name"].as<std::string>();
                dto.createdAt = row["created_at"].as<std::string>();
                links.push_back(dto);
            }
            cb(links);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, userId);
}

} // namespace pyracms
