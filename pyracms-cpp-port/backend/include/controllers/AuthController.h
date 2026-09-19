#pragma once

#include <drogon/HttpController.h>
#include "services/AuthService.h"
#include "services/UserService.h"
#include "services/EmailService.h"
#include "services/OAuthService.h"
#include "services/TenantService.h"
#include "controllers/BoolReply.h"

namespace pyracms {

class AuthController : public drogon::HttpController<AuthController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(AuthController::login, "/api/auth/login", drogon::Post, "pyracms::RateLimitFilter");
    ADD_METHOD_TO(AuthController::registerUser, "/api/auth/register", drogon::Post, "pyracms::RateLimitFilter");
    ADD_METHOD_TO(AuthController::me, "/api/auth/me", drogon::Get, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(AuthController::forgotPassword, "/api/auth/forgot-password", drogon::Post, "pyracms::RateLimitFilter");
    ADD_METHOD_TO(AuthController::resetPassword, "/api/auth/reset-password", drogon::Post, "pyracms::RateLimitFilter");
    ADD_METHOD_TO(AuthController::verifyEmail, "/api/auth/verify-email", drogon::Post, "pyracms::RateLimitFilter");
    ADD_METHOD_TO(AuthController::oauthUrl, "/api/auth/oauth/{provider}/url", drogon::Get, "pyracms::RateLimitFilter");
    ADD_METHOD_TO(AuthController::oauthCallback, "/api/auth/oauth/{provider}/callback", drogon::Post, "pyracms::RateLimitFilter");
    ADD_METHOD_TO(AuthController::oauthUnlink, "/api/auth/oauth/{provider}", drogon::Delete, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(AuthController::oauthProviders, "/api/auth/oauth/providers", drogon::Get, "pyracms::JwtAuthFilter");
    METHOD_LIST_END

    void login(const drogon::HttpRequestPtr &req,
               std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void registerUser(const drogon::HttpRequestPtr &req,
                      std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void me(const drogon::HttpRequestPtr &req,
            std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void forgotPassword(const drogon::HttpRequestPtr &req,
                        std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void resetPassword(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void verifyEmail(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void oauthUrl(const drogon::HttpRequestPtr &req,
                  std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                  const std::string &provider);

    void oauthCallback(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                       const std::string &provider);

    void oauthUnlink(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                     const std::string &provider);

    void oauthProviders(const drogon::HttpRequestPtr &req,
                        std::function<void(const drogon::HttpResponsePtr &)> &&callback);

private:
    struct NewAccount {
        std::string username, fullName, email, passwordHash;
    };
    void registerIn(int tenantId, const std::string &slug,
                    const NewAccount &acct, HttpCb callback);
    void registerDone(int tenantId, const std::string &slug,
                      const std::string &username, bool firstUser,
                      HttpCb callback);
    void finishLogin(const drogon::orm::DbClientPtr &db, int tenantId,
                     const std::string &slug, const std::string &username,
                     HttpCb callback);
    void applyReset(int userId, const std::string &token,
                    const std::string &password, HttpCb callback);
    // OAuth callback steps (see AuthControllerOauth*.cpp)
    void oauthProfile(const std::string &provider,
                      const std::string &accessToken, HttpCb callback);
    void oauthKnownUser(int userId, HttpCb callback);
    void oauthNewUser(const std::string &provider,
                      const std::string &accessToken,
                      const OAuthUserInfo &info, HttpCb callback);
    void oauthLink(const UserDto &user, const std::string &provider,
                   const std::string &accessToken,
                   const OAuthUserInfo &info, HttpCb callback);

    void withTenant(
        const Json::Value &json,
        const std::function<void(const drogon::HttpResponsePtr &)> &callback,
        std::function<void(int, const std::string &)> next);

    TenantService tenantService_;
    AuthService authService_;
    UserService userService_;
    EmailService emailService_;
    OAuthService oauthService_;
};

} // namespace pyracms
