#include "services/OAuthService.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

OAuthService::OAuthService() {
    loadConfig();
}

void OAuthService::loadConfig() {
    // GitHub
    const char *ghId = std::getenv("OAUTH_GITHUB_CLIENT_ID");
    const char *ghSecret = std::getenv("OAUTH_GITHUB_CLIENT_SECRET");
    const char *ghRedirect = std::getenv("OAUTH_GITHUB_REDIRECT_URI");
    if (ghId && ghSecret) {
        configs_["github"] = {
            ghId, ghSecret,
            "https://github.com/login/oauth/authorize",
            "https://github.com/login/oauth/access_token",
            "https://api.github.com/user",
            ghRedirect ? ghRedirect : "http://localhost:3000/auth/callback/github",
            "user:email"
        };
    }

    // Google
    const char *ggId = std::getenv("OAUTH_GOOGLE_CLIENT_ID");
    const char *ggSecret = std::getenv("OAUTH_GOOGLE_CLIENT_SECRET");
    const char *ggRedirect = std::getenv("OAUTH_GOOGLE_REDIRECT_URI");
    if (ggId && ggSecret) {
        configs_["google"] = {
            ggId, ggSecret,
            "https://accounts.google.com/o/oauth2/v2/auth",
            "https://oauth2.googleapis.com/token",
            "https://www.googleapis.com/oauth2/v2/userinfo",
            ggRedirect ? ggRedirect : "http://localhost:3000/auth/callback/google",
            "openid email profile"
        };
    }

    // Discord
    const char *dsId = std::getenv("OAUTH_DISCORD_CLIENT_ID");
    const char *dsSecret = std::getenv("OAUTH_DISCORD_CLIENT_SECRET");
    const char *dsRedirect = std::getenv("OAUTH_DISCORD_REDIRECT_URI");
    if (dsId && dsSecret) {
        configs_["discord"] = {
            dsId, dsSecret,
            "https://discord.com/api/oauth2/authorize",
            "https://discord.com/api/oauth2/token",
            "https://discord.com/api/users/@me",
            dsRedirect ? dsRedirect : "http://localhost:3000/auth/callback/discord",
            "identify email"
        };
    }
}

OAuthProviderConfig OAuthService::getConfig(const std::string &provider) {
    auto it = configs_.find(provider);
    if (it != configs_.end()) return it->second;
    return {};
}

std::string OAuthService::getAuthorizationUrl(const std::string &provider,
                                               const std::string &state) {
    auto cfg = getConfig(provider);
    if (cfg.clientId.empty()) return "";

    std::string url = cfg.authorizeUrl +
        "?client_id=" + cfg.clientId +
        "&redirect_uri=" + cfg.redirectUri +
        "&scope=" + cfg.scope +
        "&state=" + state +
        "&response_type=code";

    return url;
}

size_t OAuthService::curlWriteCallback(char *ptr, size_t size, size_t nmemb, std::string *data) {
    data->append(ptr, size * nmemb);
    return size * nmemb;
}

std::string OAuthService::httpPost(const std::string &url, const std::string &postData,
                                    const std::vector<std::string> &headers) {
    std::string response;
    CURL *curl = curl_easy_init();
    if (!curl) return "";

    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, postData.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, curlWriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10L);

    struct curl_slist *headerList = nullptr;
    for (const auto &h : headers) {
        headerList = curl_slist_append(headerList, h.c_str());
    }
    headerList = curl_slist_append(headerList, "Accept: application/json");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headerList);

    curl_easy_perform(curl);
    curl_slist_free_all(headerList);
    curl_easy_cleanup(curl);
    return response;
}

std::string OAuthService::httpGet(const std::string &url, const std::string &bearerToken) {
    std::string response;
    CURL *curl = curl_easy_init();
    if (!curl) return "";

    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, curlWriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10L);

    struct curl_slist *headers = nullptr;
    headers = curl_slist_append(headers, ("Authorization: Bearer " + bearerToken).c_str());
    headers = curl_slist_append(headers, "Accept: application/json");
    headers = curl_slist_append(headers, "User-Agent: PyraCMS");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

    curl_easy_perform(curl);
    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);
    return response;
}

void OAuthService::exchangeCode(const std::string &provider,
                                 const std::string &code,
                                 std::function<void(const std::string &, const std::string &)> cb) {
    auto cfg = getConfig(provider);
    if (cfg.clientId.empty()) {
        cb("", "Provider not configured: " + provider);
        return;
    }

    std::string postData = "client_id=" + cfg.clientId +
        "&client_secret=" + cfg.clientSecret +
        "&code=" + code +
        "&redirect_uri=" + cfg.redirectUri +
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

void OAuthService::getProviderProfile(const std::string &provider,
                                       const std::string &accessToken,
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
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        userId, provider, info.providerId, accessToken,
        info.email, info.displayName, info.avatarUrl);
}

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
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        provider, providerId);
}

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
            cb(false, e.base().what());
        },
        userId, provider);
}

void OAuthService::getLinkedProviders(const DbClientPtr &db, int userId,
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
                dto.email = row["email"].isNull() ? "" : row["email"].as<std::string>();
                dto.displayName = row["display_name"].isNull() ? "" : row["display_name"].as<std::string>();
                dto.createdAt = row["created_at"].as<std::string>();
                links.push_back(dto);
            }
            cb(links);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        userId);
}

} // namespace pyracms
