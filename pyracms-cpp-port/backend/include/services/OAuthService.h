#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>

namespace pyracms {

struct OAuthProviderConfig {
    std::string clientId;
    std::string clientSecret;
    std::string authorizeUrl;
    std::string tokenUrl;
    std::string userInfoUrl;
    std::string redirectUri;
    std::string scope;
};

struct OAuthUserInfo {
    std::string providerId;
    std::string email;
    std::string displayName;
    std::string avatarUrl;
};

struct OAuthLinkDto {
    int id;
    int userId;
    std::string provider;
    std::string providerUserId;
    std::string email;
    std::string displayName;
    std::string createdAt;
};

class OAuthService {
public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using BoolCallback = std::function<void(bool, const std::string &)>;

    OAuthService();

    std::string getAuthorizationUrl(const std::string &provider,
                                     const std::string &state);

    void exchangeCode(const std::string &provider,
                      const std::string &code,
                      std::function<void(const std::string &accessToken,
                                         const std::string &error)> cb);

    void getProviderProfile(const std::string &provider,
                            const std::string &accessToken,
                            std::function<void(const std::optional<OAuthUserInfo> &)> cb);

    void linkAccount(const DbClientPtr &db, int userId,
                     const std::string &provider,
                     const OAuthUserInfo &info,
                     const std::string &accessToken,
                     BoolCallback cb);

    void findByProvider(const DbClientPtr &db,
                        const std::string &provider,
                        const std::string &providerId,
                        std::function<void(std::optional<int> userId)> cb);

    void unlinkProvider(const DbClientPtr &db, int userId,
                        const std::string &provider,
                        BoolCallback cb);

    void getLinkedProviders(const DbClientPtr &db, int userId,
                            std::function<void(const std::vector<OAuthLinkDto> &)> cb);

private:
    std::map<std::string, OAuthProviderConfig> configs_;

    void loadConfig();
    OAuthProviderConfig getConfig(const std::string &provider);
    static size_t curlWriteCallback(char *ptr, size_t size, size_t nmemb, std::string *data);
    std::string httpPost(const std::string &url, const std::string &postData,
                         const std::vector<std::string> &headers = {});
    std::string httpGet(const std::string &url, const std::string &bearerToken);
};

} // namespace pyracms
