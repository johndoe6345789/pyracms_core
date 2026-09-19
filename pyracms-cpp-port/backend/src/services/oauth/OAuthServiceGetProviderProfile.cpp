#include "services/DbError.h"
#include "services/OAuthService.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

void OAuthService::getProviderProfile(
    const std::string &provider, const std::string &accessToken,
    std::function<void(const std::optional<OAuthUserInfo> &)> cb) {
    auto cfg = getConfig(provider);
    if (cfg.clientId.empty()) {
        cb(std::nullopt);
        return;
    }

    auto response = httpGet(cfg.userInfoUrl, accessToken);

    Json::Value root;
    Json::CharReaderBuilder reader;
    std::istringstream stream(response);
    std::string errors;
    if (!Json::parseFromStream(reader, stream, &root, &errors)) {
        cb(std::nullopt);
        return;
    }

    OAuthUserInfo info;
    if (provider == "github") {
        info.providerId = std::to_string(root["id"].asInt());
        info.email = root["email"].asString();
        info.displayName = root["login"].asString();
        info.avatarUrl = root["avatar_url"].asString();
    } else if (provider == "google") {
        info.providerId = root["id"].asString();
        info.email = root["email"].asString();
        info.displayName = root["name"].asString();
        info.avatarUrl = root["picture"].asString();
    } else if (provider == "discord") {
        info.providerId = root["id"].asString();
        info.email = root["email"].asString();
        info.displayName = root["username"].asString();
        auto discriminator = root["discriminator"].asString();
        auto avatarHash = root["avatar"].asString();
        if (!avatarHash.empty()) {
            info.avatarUrl = "https://cdn.discordapp.com/avatars/" +
                             info.providerId + "/" + avatarHash + ".png";
        }
    }

    cb(info);
}

} // namespace pyracms
