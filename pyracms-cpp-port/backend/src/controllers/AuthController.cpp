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

void AuthController::forgotPassword(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("email")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "email is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto email = (*json)["email"].asString();
    auto db = drogon::app().getDbClient();

    // Always return success to prevent email enumeration
    userService_.findByEmail(
        db, email,
        [this, db, email, callback](const std::optional<UserDto> &user) {
            if (!user) {
                // Don't reveal that the email doesn't exist
                Json::Value result;
                result["message"] = "If the email exists, a reset link has been sent";
                callback(drogon::HttpResponse::newHttpJsonResponse(result));
                return;
            }

            auto token = authService_.generateRandomToken();
            auto userId = user->id;

            db->execSqlAsync(
                "INSERT INTO password_reset_tokens (user_id, token, expires_at) "
                "VALUES ($1, $2, NOW() + INTERVAL '1 hour')",
                [this, email, token, callback](const drogon::orm::Result &) {
                    emailService_.sendPasswordResetEmail(
                        email, token,
                        [callback](bool success, const std::string &error) {
                            Json::Value result;
                            result["message"] = "If the email exists, a reset link has been sent";
                            callback(drogon::HttpResponse::newHttpJsonResponse(result));
                        });
                },
                [callback](const drogon::orm::DrogonDbException &e) {
                    Json::Value result;
                    result["message"] = "If the email exists, a reset link has been sent";
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                },
                userId, token);
        });
}

void AuthController::resetPassword(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("token") || !(*json).isMember("password")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "token and password are required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto token = (*json)["token"].asString();
    auto password = (*json)["password"].asString();

    if (password.length() < 8) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "Password must be at least 8 characters";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto db = drogon::app().getDbClient();

    db->execSqlAsync(
        "SELECT user_id FROM password_reset_tokens "
        "WHERE token = $1 AND used = FALSE AND expires_at > NOW()",
        [this, db, token, password, callback](const drogon::orm::Result &result) {
            if (result.empty()) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Invalid or expired token";
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }

            int userId = result[0]["user_id"].as<int>();
            auto newHash = authService_.hashPassword(password);

            // Mark token as used
            db->execSqlAsync(
                "UPDATE password_reset_tokens SET used = TRUE WHERE token = $1",
                [](const drogon::orm::Result &) {},
                [](const drogon::orm::DrogonDbException &) {},
                token);

            // Update password
            userService_.updatePassword(
                db, userId, newHash,
                [callback](bool success, const std::string &error) {
                    if (!success) {
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                        (*resp->jsonObject())["error"] = "Failed to update password";
                        resp->setStatusCode(drogon::k500InternalServerError);
                        callback(resp);
                        return;
                    }
                    Json::Value result;
                    result["message"] = "Password has been reset successfully";
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
            (*resp->jsonObject())["error"] = "Database error";
            resp->setStatusCode(drogon::k500InternalServerError);
            callback(resp);
        },
        token);
}

void AuthController::verifyEmail(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("token")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "token is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto token = (*json)["token"].asString();
    auto db = drogon::app().getDbClient();

    db->execSqlAsync(
        "SELECT user_id FROM email_verification_tokens "
        "WHERE token = $1 AND used = FALSE AND expires_at > NOW()",
        [db, token, callback](const drogon::orm::Result &result) {
            if (result.empty()) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Invalid or expired token";
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }

            // Mark token as used
            db->execSqlAsync(
                "UPDATE email_verification_tokens SET used = TRUE WHERE token = $1",
                [callback](const drogon::orm::Result &) {
                    Json::Value result;
                    result["message"] = "Email verified successfully";
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                },
                [callback](const drogon::orm::DrogonDbException &e) {
                    auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                    (*resp->jsonObject())["error"] = "Failed to verify email";
                    resp->setStatusCode(drogon::k500InternalServerError);
                    callback(resp);
                },
                token);
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
            (*resp->jsonObject())["error"] = "Database error";
            resp->setStatusCode(drogon::k500InternalServerError);
            callback(resp);
        },
        token);
}

} // namespace pyracms
