#include "controllers/AuthController.h"

namespace pyracms {

void AuthController::login(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("username") || !(*json).isMember("password")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "username and password required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto username = (*json)["username"].asString();
    auto password = (*json)["password"].asString();
    auto db = drogon::app().getDbClient();

    // Get password hash, then verify
    userService_.getPasswordHash(
        db, username,
        [this, username, password, callback](
            const std::optional<std::string> &hash) {
            if (!hash || !authService_.verifyPassword(password, *hash)) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = "Invalid credentials";
                resp->setStatusCode(drogon::k401Unauthorized);
                callback(resp);
                return;
            }

            // Get full user for the token
            auto db = drogon::app().getDbClient();
            userService_.findByUsername(
                db, username,
                [this, callback](const std::optional<UserDto> &user) {
                    if (!user) {
                        auto resp =
                            drogon::HttpResponse::newHttpJsonResponse(
                                Json::Value{});
                        (*resp->jsonObject())["error"] = "User not found";
                        resp->setStatusCode(drogon::k404NotFound);
                        callback(resp);
                        return;
                    }

                    auto token = authService_.generateToken(
                        user->id, user->username);

                    Json::Value result;
                    result["token"] = token;
                    result["user"]["id"] = user->id;
                    result["user"]["username"] = user->username;
                    result["user"]["fullName"] = user->fullName;
                    result["user"]["email"] = user->email;
                    callback(
                        drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

void AuthController::registerUser(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("username") || !(*json).isMember("password") ||
        !(*json).isMember("email")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "username, email, and password required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto username = (*json)["username"].asString();
    auto password = (*json)["password"].asString();
    auto email = (*json)["email"].asString();
    auto fullName = (*json).get("fullName", "").asString();

    if (username.length() < 3 || username.length() > 32) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "Username must be 3-32 characters";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    if (password.length() < 8) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "Password must be at least 8 characters";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto db = drogon::app().getDbClient();
    auto passwordHash = authService_.hashPassword(password);

    // Check if this is the first user (auto-promote to admin)
    userService_.countUsers(db, [this, db, username, fullName, email,
                                  passwordHash, callback](int count) {
        userService_.createUser(
            db, username, fullName, email, passwordHash,
            [this, username, count, callback](bool success,
                                               const std::string &error) {
                if (!success) {
                    auto resp =
                        drogon::HttpResponse::newHttpJsonResponse(
                            Json::Value{});
                    (*resp->jsonObject())["error"] = error;
                    resp->setStatusCode(drogon::k409Conflict);
                    callback(resp);
                    return;
                }

                // Get the created user to generate token
                auto db = drogon::app().getDbClient();
                userService_.findByUsername(
                    db, username,
                    [this, count, callback](
                        const std::optional<UserDto> &user) {
                        if (!user) {
                            auto resp =
                                drogon::HttpResponse::newHttpJsonResponse(
                                    Json::Value{});
                            (*resp->jsonObject())["error"] = "Registration failed";
                            resp->setStatusCode(drogon::k500InternalServerError);
                            callback(resp);
                            return;
                        }

                        auto token = authService_.generateToken(
                            user->id, user->username);

                        Json::Value result;
                        result["token"] = token;
                        result["user"]["id"] = user->id;
                        result["user"]["username"] = user->username;
                        result["user"]["fullName"] = user->fullName;
                        result["user"]["email"] = user->email;
                        result["firstUser"] = (count == 0);
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
                        resp->setStatusCode(drogon::k201Created);
                        callback(resp);
                    });
            });
    });
}

void AuthController::me(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    userService_.findById(db, userId,
                          [callback](const std::optional<UserDto> &user) {
                              if (!user) {
                                  auto resp =
                                      drogon::HttpResponse::newHttpJsonResponse(
                                          Json::Value{});
                                  (*resp->jsonObject())["error"] = "User not found";
                                  resp->setStatusCode(drogon::k404NotFound);
                                  callback(resp);
                                  return;
                              }

                              Json::Value result;
                              result["id"] = user->id;
                              result["username"] = user->username;
                              result["fullName"] = user->fullName;
                              result["email"] = user->email;
                              result["website"] = user->website;
                              result["aboutme"] = user->aboutme;
                              result["timezone"] = user->timezone;
                              result["banned"] = user->banned;
                              result["createdAt"] = user->createdAt;
                              callback(
                                  drogon::HttpResponse::newHttpJsonResponse(
                                      result));
                          });
}

} // namespace pyracms
