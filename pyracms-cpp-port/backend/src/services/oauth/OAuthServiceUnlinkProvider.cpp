#include "services/DbError.h"
#include "services/OAuthService.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

void OAuthService::unlinkProvider(const DbClientPtr &db, int userId,
                                  const std::string &provider,
                                  BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM oauth_providers WHERE user_id = $1 AND provider = $2",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Provider not linked");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        userId, provider);
}

} // namespace pyracms
