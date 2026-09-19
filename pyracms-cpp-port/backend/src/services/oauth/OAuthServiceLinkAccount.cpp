#include "services/DbError.h"
#include "services/OAuthService.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

void OAuthService::linkAccount(const DbClientPtr &db, int userId,
                               const std::string &provider,
                               const OAuthUserInfo &info,
                               const std::string &accessToken,
                               BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO oauth_providers (user_id, provider, provider_user_id, "
        "access_token, email, display_name, avatar_url) "
        "VALUES ($1, $2, $3, $4, $5, $6, $7) "
        "ON CONFLICT (provider, provider_user_id) DO UPDATE SET "
        "access_token = $4, email = $5, display_name = $6, avatar_url = $7, "
        "updated_at = NOW()",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        userId, provider, info.providerId, accessToken, info.email,
        info.displayName, info.avatarUrl);
}

} // namespace pyracms
