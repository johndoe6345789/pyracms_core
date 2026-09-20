#pragma once

#include "controllers/BoolReply.h"
#include "controllers/HttpAliases.h"
#include "services/AuthService.h"
#include "services/EmailService.h"
#include "services/OAuthService.h"
#include "services/TenantService.h"
#include "services/UserService.h"

#include <drogon/HttpController.h>

namespace pyracms {

class AuthController : public drogon::HttpController<AuthController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(AuthController::login, "/api/auth/login", drogon::Post,
                  PYR_RATE);
    ADD_METHOD_TO(AuthController::registerUser, "/api/auth/register",
                  drogon::Post, PYR_RATE);
    ADD_METHOD_TO(AuthController::setupStatus, "/api/auth/setup", drogon::Get);
    ADD_METHOD_TO(AuthController::setup, "/api/auth/setup", drogon::Post,
                  PYR_RATE);
    ADD_METHOD_TO(AuthController::me, "/api/auth/me", drogon::Get, PYR_JWT);
    ADD_METHOD_TO(AuthController::forgotPassword, "/api/auth/forgot-password",
                  drogon::Post, PYR_RATE);
    ADD_METHOD_TO(AuthController::resetPassword, "/api/auth/reset-password",
                  drogon::Post, PYR_RATE);
    ADD_METHOD_TO(AuthController::verifyEmail, "/api/auth/verify-email",
                  drogon::Post, PYR_RATE);
    ADD_METHOD_TO(AuthController::oauthUrl, "/api/auth/oauth/{provider}/url",
                  drogon::Get, PYR_RATE);
    ADD_METHOD_TO(AuthController::oauthCallback,
                  "/api/auth/oauth/{provider}/callback", drogon::Post,
                  PYR_RATE);
    ADD_METHOD_TO(AuthController::oauthUnlink, "/api/auth/oauth/{provider}",
                  drogon::Delete, PYR_JWT);
    ADD_METHOD_TO(AuthController::oauthProviders, "/api/auth/oauth/providers",
                  drogon::Get, PYR_JWT);
    METHOD_LIST_END

    void login(HttpReq, HttpCbRef); void registerUser(HttpReq, HttpCbRef);
    void setupStatus(HttpReq, HttpCbRef); void setup(HttpReq, HttpCbRef);
    void me(HttpReq, HttpCbRef); void forgotPassword(HttpReq, HttpCbRef);
    void resetPassword(HttpReq, HttpCbRef);
    void verifyEmail(HttpReq, HttpCbRef);
    void oauthUrl(HttpReq req, HttpCbRef callback, HttpStr provider);
    void oauthCallback(HttpReq req, HttpCbRef callback, HttpStr provider);
    void oauthUnlink(HttpReq req, HttpCbRef callback, HttpStr provider);
    void oauthProviders(HttpReq req, HttpCbRef callback);

  private:
    struct NewAccount { std::string username, fullName, email, passwordHash; };
    void registerIn(int tenantId, HttpStr slug, const NewAccount &acct,
                    HttpCb callback);
    void registerDone(int tenantId, HttpStr slug, HttpStr username,
                      bool firstUser, HttpCb callback);
    void finishLogin(const drogon::orm::DbClientPtr &db, int tenantId,
                     HttpStr slug, HttpStr username, HttpCb callback);
    void applyReset(int userId, HttpStr password, HttpCb callback);
    // OAuth callback steps (see AuthControllerOauth*.cpp)
    void oauthProfile(HttpStr provider, HttpStr accessToken, HttpCb callback);
    void oauthKnownUser(int userId, HttpCb callback);
    void withTenant(const Json::Value &json, const HttpCb &callback,
                    std::function<void(int, const std::string &)> next);

    TenantService tenantService_;
    AuthService authService_;
    UserService userService_;
    EmailService emailService_;
    OAuthService oauthService_;
};

} // namespace pyracms
