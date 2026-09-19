#include "services/DbError.h"
#include "services/OAuthService.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

std::string OAuthService::getAuthorizationUrl(const std::string &provider,
                                              const std::string &state) {
    auto cfg = getConfig(provider);
    if (cfg.clientId.empty())
        return "";

    std::string url = cfg.authorizeUrl + "?client_id=" + cfg.clientId +
                      "&redirect_uri=" + cfg.redirectUri +
                      "&scope=" + cfg.scope + "&state=" + state +
                      "&response_type=code";

    return url;
}

} // namespace pyracms
