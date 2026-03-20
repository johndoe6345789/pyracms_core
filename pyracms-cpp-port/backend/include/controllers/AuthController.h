#pragma once

#include <drogon/HttpController.h>
#include "services/AuthService.h"
#include "services/UserService.h"
#include "services/EmailService.h"
#include "services/OAuthService.h"

namespace pyracms {

class AuthController : public drogon::HttpController<AuthController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(AuthController::login, "/api/auth/login", drogon::Post);
    ADD_METHOD_TO(AuthController::registerUser, "/api/auth/register", drogon::Post);
    ADD_METHOD_TO(AuthController::me, "/api/auth/me", drogon::Get, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(AuthController::forgotPassword, "/api/auth/forgot-password", drogon::Post);
    ADD_METHOD_TO(AuthController::resetPassword, "/api/auth/reset-password", drogon::Post);
    ADD_METHOD_TO(AuthController::verifyEmail, "/api/auth/verify-email", drogon::Post);
    ADD_METHOD_TO(AuthController::oauthUrl, "/api/auth/oauth/{provider}/url", drogon::Get);
    ADD_METHOD_TO(AuthController::oauthCallback, "/api/auth/oauth/{provider}/callback", drogon::Post);
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
    AuthService authService_;
    UserService userService_;
    EmailService emailService_;
    OAuthService oauthService_;
};

} // namespace pyracms
