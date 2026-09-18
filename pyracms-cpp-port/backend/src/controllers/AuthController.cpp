#include "controllers/AuthController.h"

namespace pyracms {

namespace {

using Callback = std::function<void(const drogon::HttpResponsePtr &)>;

void sendError(const Callback &callback, const std::string &message,
               drogon::HttpStatusCode code) {
    auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
    (*resp->jsonObject())["error"] = message;
    resp->setStatusCode(code);
    callback(resp);
}

// Shape shared by login / register / me. `tenantSlug` is empty for
// platform accounts.
Json::Value userJson(const UserDto &user, const std::string &tenantSlug) {
    Json::Value j;
    j["id"] = user.id;
    j["username"] = user.username;
    j["fullName"] = user.fullName;
    j["email"] = user.email;
    j["role"] = static_cast<int>(user.role);
    j["tenantId"] = user.tenantId;
    j["tenantSlug"] = tenantSlug.empty() ? Json::Value() : Json::Value(tenantSlug);
    return j;
}

} // namespace

// Accounts are scoped per tenant. The optional "tenant" field (a slug)
// selects the scope; absent/empty means the platform scope (portal
// accounts, site owners, super-admins). Calls `next(tenantId, slug)` with
// tenantId 0 for the platform, or replies 404 for an unknown slug.
void AuthController::withTenant(
    const Json::Value &json,
    const std::function<void(const drogon::HttpResponsePtr &)> &callback,
    std::function<void(int, const std::string &)> next) {
    auto slug = json.get("tenant", "").asString();
    if (slug.empty()) {
        next(0, "");
        return;
    }
    tenantService_.findBySlug(
        drogon::app().getDbClient(), slug,
        [callback, next, slug](const std::optional<TenantDto> &tenant) {
            if (!tenant) {
                sendError(callback, "Unknown site: " + slug,
                          drogon::k404NotFound);
                return;
            }
            next(tenant->id, tenant->slug);
        });
}

void AuthController::login(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("username") || !(*json).isMember("password")) {
        sendError(callback, "username and password required",
                  drogon::k400BadRequest);
        return;
    }

    auto username = (*json)["username"].asString();
    auto password = (*json)["password"].asString();

    withTenant(*json, callback,
        [this, username, password, callback](
            int tenantId, const std::string &slug) {
            auto db = drogon::app().getDbClient();
            userService_.getPasswordHash(
                db, tenantId, username,
                [this, db, tenantId, slug, username, password, callback](
                    const std::optional<std::string> &hash) {
                    if (!hash ||
                        !authService_.verifyPassword(password, *hash)) {
                        sendError(callback, "Invalid credentials",
                                  drogon::k401Unauthorized);
                        return;
                    }
                    userService_.findByUsername(
                        db, tenantId, username,
                        [this, slug, callback](
                            const std::optional<UserDto> &user) {
                            if (!user) {
                                sendError(callback, "User not found",
                                          drogon::k404NotFound);
                                return;
                            }
                            if (user->banned) {
                                sendError(callback, "Account is banned",
                                          drogon::k403Forbidden);
                                return;
                            }
                            Json::Value result;
                            result["token"] = authService_.generateToken(
                                user->id, user->username, user->tenantId);
                            result["user"] = userJson(*user, slug);
                            callback(drogon::HttpResponse::
                                         newHttpJsonResponse(result));
                        });
                });
        });
}

void AuthController::registerUser(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("username") || !(*json).isMember("password") ||
        !(*json).isMember("email")) {
        sendError(callback, "username, email, and password required",
                  drogon::k400BadRequest);
        return;
    }

    auto username = (*json)["username"].asString();
    auto password = (*json)["password"].asString();
    auto email = (*json)["email"].asString();
    auto fullName = (*json).get("fullName", "").asString();

    if (username.length() < 3 || username.length() > 32) {
        sendError(callback, "Username must be 3-32 characters",
                  drogon::k400BadRequest);
        return;
    }

    if (password.length() < 8) {
        sendError(callback, "Password must be at least 8 characters",
                  drogon::k400BadRequest);
        return;
    }

    auto passwordHash = authService_.hashPassword(password);

    withTenant(*json, callback,
        [this, username, fullName, email, passwordHash, callback](
            int tenantId, const std::string &slug) {
            auto db = drogon::app().getDbClient();
            // Counting the scope's accounts lets the UI greet the first one
            userService_.countUsers(db, tenantId,
                [this, db, tenantId, slug, username, fullName, email,
                 passwordHash, callback](int count) {
                userService_.createUser(
                    db, tenantId, username, fullName, email, passwordHash,
                    [this, tenantId, slug, username, count, callback](
                        bool success, const std::string &) {
                        if (!success) {
                            // A unique-index violation is the common case
                            sendError(callback,
                                      slug.empty()
                                          ? "That username or email is already taken"
                                          : "That username or email is already taken on this site",
                                      drogon::k409Conflict);
                            return;
                        }
                        auto db = drogon::app().getDbClient();
                        userService_.findByUsername(
                            db, tenantId, username,
                            [this, slug, count, callback](
                                const std::optional<UserDto> &user) {
                                if (!user) {
                                    sendError(
                                        callback, "Registration failed",
                                        drogon::k500InternalServerError);
                                    return;
                                }
                                Json::Value result;
                                result["token"] =
                                    authService_.generateToken(
                                        user->id, user->username,
                                        user->tenantId);
                                result["user"] = userJson(*user, slug);
                                result["firstUser"] = (count == 0);
                                auto resp = drogon::HttpResponse::
                                    newHttpJsonResponse(result);
                                resp->setStatusCode(drogon::k201Created);
                                callback(resp);
                            });
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
        [db, callback](const std::optional<UserDto> &user) {
            if (!user) {
                sendError(callback, "User not found", drogon::k404NotFound);
                return;
            }
            auto finish = [user, callback](const std::string &slug) {
                Json::Value result = userJson(*user, slug);
                result["website"] = user->website;
                result["aboutme"] = user->aboutme;
                result["timezone"] = user->timezone;
                result["banned"] = user->banned;
                result["createdAt"] = user->createdAt;
                callback(drogon::HttpResponse::newHttpJsonResponse(result));
            };
            if (user->tenantId == 0) {
                finish("");
                return;
            }
            db->execSqlAsync(
                "SELECT slug FROM tenants WHERE id = $1",
                [finish](const drogon::orm::Result &r) {
                    finish(r.empty() ? "" : r[0]["slug"].as<std::string>());
                },
                [finish](const drogon::orm::DrogonDbException &) {
                    finish("");
                },
                user->tenantId);
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

    withTenant(*json, callback,
        [this, db, email, callback](int tenantId, const std::string &) {
    // Always return success to prevent email enumeration
    userService_.findByEmail(
        db, tenantId, email,
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

void AuthController::oauthUrl(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &provider) {

    auto state = req->getParameter("state");
    if (state.empty()) state = "pyracms";

    auto url = oauthService_.getAuthorizationUrl(provider, state);
    if (url.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "Provider not configured: " + provider;
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    Json::Value result;
    result["url"] = url;
    result["provider"] = provider;
    callback(drogon::HttpResponse::newHttpJsonResponse(result));
}

void AuthController::oauthCallback(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &provider) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("code")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "code is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto code = (*json)["code"].asString();
    auto db = drogon::app().getDbClient();

    oauthService_.exchangeCode(provider, code,
        [this, db, provider, callback](const std::string &accessToken, const std::string &error) {
            if (!error.empty()) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k401Unauthorized);
                callback(resp);
                return;
            }

            oauthService_.getProviderProfile(provider, accessToken,
                [this, db, provider, accessToken, callback](const std::optional<OAuthUserInfo> &info) {
                    if (!info) {
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                        (*resp->jsonObject())["error"] = "Failed to get user profile";
                        resp->setStatusCode(drogon::k500InternalServerError);
                        callback(resp);
                        return;
                    }

                    // Check if this OAuth account is already linked
                    oauthService_.findByProvider(db, provider, info->providerId,
                        [this, db, provider, accessToken, info, callback](std::optional<int> userId) {
                            if (userId) {
                                // Existing user — generate JWT
                                userService_.findById(db, *userId,
                                    [this, callback](const auto &user) {
                                        if (!user) {
                                            auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                                            (*resp->jsonObject())["error"] = "User not found";
                                            resp->setStatusCode(drogon::k404NotFound);
                                            callback(resp);
                                            return;
                                        }
                                        auto token = authService_.generateToken(user->id, user->username, user->tenantId);
                                        Json::Value result;
                                        result["token"] = token;
                                        result["user"]["id"] = user->id;
                                        result["user"]["username"] = user->username;
                                        result["user"]["email"] = user->email;
                                        callback(drogon::HttpResponse::newHttpJsonResponse(result));
                                    });
                            } else {
                                // New user — create account from OAuth info, then link
                                auto username = info->displayName;
                                auto email = info->email;
                                auto password = authService_.generateRandomToken();
                                auto passwordHash = authService_.hashPassword(password);

                                userService_.createUser(db, 0, username, username, email, passwordHash,
                                    [this, db, provider, accessToken, info, callback](bool success, const std::string &error) {
                                        if (!success) {
                                            auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                                            (*resp->jsonObject())["error"] = error;
                                            resp->setStatusCode(drogon::k409Conflict);
                                            callback(resp);
                                            return;
                                        }

                                        userService_.findByUsername(db, 0, info->displayName,
                                            [this, db, provider, accessToken, info, callback](const auto &user) {
                                                if (!user) {
                                                    auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                                                    (*resp->jsonObject())["error"] = "Failed to find created user";
                                                    resp->setStatusCode(drogon::k500InternalServerError);
                                                    callback(resp);
                                                    return;
                                                }

                                                oauthService_.linkAccount(db, user->id, provider, *info, accessToken,
                                                    [this, user, callback](bool success, const std::string &error) {
                                                        if (!success) {
                                                            auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                                                            (*resp->jsonObject())["error"] = error;
                                                            resp->setStatusCode(drogon::k500InternalServerError);
                                                            callback(resp);
                                                            return;
                                                        }

                                                        auto token = authService_.generateToken(user->id, user->username, user->tenantId);
                                                        Json::Value result;
                                                        result["token"] = token;
                                                        result["user"]["id"] = user->id;
                                                        result["user"]["username"] = user->username;
                                                        result["user"]["email"] = user->email;
                                                        result["created"] = true;
                                                        callback(drogon::HttpResponse::newHttpJsonResponse(result));
                                                    });
                                            });
                                    });
                            }
                        });
                });
        });
}

void AuthController::oauthUnlink(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &provider) {

    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    oauthService_.unlinkProvider(db, userId, provider,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }
            Json::Value result;
            result["message"] = "Provider unlinked";
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void AuthController::oauthProviders(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    oauthService_.getLinkedProviders(db, userId,
        [callback](const std::vector<OAuthLinkDto> &links) {
            Json::Value result(Json::arrayValue);
            for (const auto &link : links) {
                Json::Value item;
                item["id"] = link.id;
                item["provider"] = link.provider;
                item["providerUserId"] = link.providerUserId;
                item["email"] = link.email;
                item["displayName"] = link.displayName;
                item["createdAt"] = link.createdAt;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
