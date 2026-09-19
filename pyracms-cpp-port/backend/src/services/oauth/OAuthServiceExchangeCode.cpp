#include "services/DbError.h"
#include "services/OAuthService.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

void OAuthService::exchangeCode(
    const std::string &provider, const std::string &code,
    std::function<void(const std::string &, const std::string &)> cb) {
    auto cfg = getConfig(provider);
    if (cfg.clientId.empty()) {
        cb("", "Provider not configured: " + provider);
        return;
    }

    std::string postData =
        "client_id=" + cfg.clientId + "&client_secret=" + cfg.clientSecret +
        "&code=" + code + "&redirect_uri=" + cfg.redirectUri +
        "&grant_type=authorization_code";

    auto response = httpPost(cfg.tokenUrl, postData);

    Json::Value root;
    Json::CharReaderBuilder reader;
    std::istringstream stream(response);
    std::string errors;
    if (!Json::parseFromStream(reader, stream, &root, &errors)) {
        cb("", "Failed to parse token response");
        return;
    }

    if (root.isMember("access_token")) {
        cb(root["access_token"].asString(), "");
    } else if (root.isMember("error")) {
        cb("", root["error_description"].asString());
    } else {
        cb("", "No access_token in response");
    }
}

} // namespace pyracms
