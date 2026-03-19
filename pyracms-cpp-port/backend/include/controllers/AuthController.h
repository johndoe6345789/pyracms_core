#pragma once

#include <drogon/HttpController.h>
#include "services/AuthService.h"
#include "services/UserService.h"

namespace pyracms {

class AuthController : public drogon::HttpController<AuthController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(AuthController::login, "/api/auth/login", drogon::Post);
    ADD_METHOD_TO(AuthController::registerUser, "/api/auth/register", drogon::Post);
    ADD_METHOD_TO(AuthController::me, "/api/auth/me", drogon::Get, "pyracms::JwtAuthFilter");
    METHOD_LIST_END

    void login(const drogon::HttpRequestPtr &req,
               std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void registerUser(const drogon::HttpRequestPtr &req,
                      std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void me(const drogon::HttpRequestPtr &req,
            std::function<void(const drogon::HttpResponsePtr &)> &&callback);

private:
    AuthService authService_;
    UserService userService_;
};

} // namespace pyracms
