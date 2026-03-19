#pragma once

#include <drogon/HttpController.h>
#include "services/UserService.h"

namespace pyracms {

class UserController : public drogon::HttpController<UserController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(UserController::list, "/api/users", drogon::Get);
    ADD_METHOD_TO(UserController::getById, "/api/users/{id}", drogon::Get);
    ADD_METHOD_TO(UserController::update, "/api/users/{id}", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(UserController::changePassword, "/api/users/{id}/password", drogon::Put, "pyracms::JwtAuthFilter");
    METHOD_LIST_END

    void list(const drogon::HttpRequestPtr &req,
              std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void getById(const drogon::HttpRequestPtr &req,
                 std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                 int id);

    void update(const drogon::HttpRequestPtr &req,
                std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                int id);

    void changePassword(const drogon::HttpRequestPtr &req,
                        std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                        int id);

private:
    UserService userService_;
};

} // namespace pyracms
