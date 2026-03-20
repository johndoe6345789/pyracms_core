#include "controllers/ForumController.h"

namespace pyracms {

// --- Categories ---

void ForumController::listCategories(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto tenantIdStr = req->getParameter("tenant_id");
    if (tenantIdStr.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenant_id parameter is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int tenantId = std::stoi(tenantIdStr);
    auto db = drogon::app().getDbClient();

    forumService_.listCategories(
        db, tenantId,
        [callback](const std::vector<ForumCategoryWithForumsDto> &categories) {
            Json::Value result(Json::arrayValue);
            for (const auto &cat : categories) {
                Json::Value catJson;
                catJson["id"] = cat.category.id;
                catJson["name"] = cat.category.name;

                Json::Value forumsJson(Json::arrayValue);
                for (const auto &f : cat.forums) {
                    Json::Value forumJson;
                    forumJson["id"] = f.id;
                    forumJson["name"] = f.name;
                    forumJson["description"] = f.description;
                    forumJson["categoryId"] = f.categoryId;
                    forumJson["totalThreads"] = f.totalThreads;
                    forumJson["totalPosts"] = f.totalPosts;
                    forumsJson.append(forumJson);
                }
                catJson["forums"] = forumsJson;
                result.append(catJson);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void ForumController::createCategory(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("name") || !(*json).isMember("tenantId")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "name and tenantId are required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto name = (*json)["name"].asString();
    int tenantId = (*json)["tenantId"].asInt();
    auto db = drogon::app().getDbClient();

    forumService_.createCategory(
        db, tenantId, name,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void ForumController::updateCategory(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("name")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "name is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto name = (*json)["name"].asString();
    auto db = drogon::app().getDbClient();

    forumService_.updateCategory(
        db, id, name,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void ForumController::deleteCategory(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto db = drogon::app().getDbClient();
    forumService_.deleteCategory(
        db, id,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

// --- Forums ---

void ForumController::getForum(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto db = drogon::app().getDbClient();
    forumService_.getForum(
        db, id,
        [callback](const std::optional<ForumWithThreadsDto> &forumData) {
            if (!forumData) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Forum not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["id"] = forumData->forum.id;
            result["name"] = forumData->forum.name;
            result["description"] = forumData->forum.description;
            result["categoryId"] = forumData->forum.categoryId;
            result["totalThreads"] = forumData->forum.totalThreads;
            result["totalPosts"] = forumData->forum.totalPosts;

            Json::Value threadsJson(Json::arrayValue);
            for (const auto &t : forumData->threads) {
                Json::Value threadJson;
                threadJson["id"] = t.id;
                threadJson["name"] = t.name;
                threadJson["description"] = t.description;
                threadJson["forumId"] = t.forumId;
                threadJson["viewCount"] = t.viewCount;
                threadJson["totalPosts"] = t.totalPosts;
                threadJson["createdAt"] = t.createdAt;
                threadsJson.append(threadJson);
            }
            result["threads"] = threadsJson;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void ForumController::createForum(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("categoryId") || !(*json).isMember("name")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "categoryId and name are required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int categoryId = (*json)["categoryId"].asInt();
    auto name = (*json)["name"].asString();
    auto description = (*json).isMember("description")
                           ? (*json)["description"].asString()
                           : "";
    auto db = drogon::app().getDbClient();

    forumService_.createForum(
        db, categoryId, name, description,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void ForumController::updateForum(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("name")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "name is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto name = (*json)["name"].asString();
    auto description = (*json).isMember("description")
                           ? (*json)["description"].asString()
                           : "";
    auto db = drogon::app().getDbClient();

    forumService_.updateForum(
        db, id, name, description,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void ForumController::deleteForum(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto db = drogon::app().getDbClient();
    forumService_.deleteForum(
        db, id,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

// --- Threads ---

void ForumController::getThread(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto db = drogon::app().getDbClient();
    forumService_.getThread(
        db, id,
        [callback](const std::optional<ForumThreadWithPostsDto> &threadData) {
            if (!threadData) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Thread not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["id"] = threadData->thread.id;
            result["name"] = threadData->thread.name;
            result["description"] = threadData->thread.description;
            result["forumId"] = threadData->thread.forumId;
            result["viewCount"] = threadData->thread.viewCount;
            result["totalPosts"] = threadData->thread.totalPosts;
            result["createdAt"] = threadData->thread.createdAt;

            Json::Value postsJson(Json::arrayValue);
            for (const auto &p : threadData->posts) {
                Json::Value postJson;
                postJson["id"] = p.id;
                postJson["title"] = p.title;
                postJson["content"] = p.content;
                postJson["createdAt"] = p.createdAt;
                postJson["userId"] = p.userId;
                postJson["username"] = p.username;
                postJson["threadId"] = p.threadId;
                postsJson.append(postJson);
            }
            result["posts"] = postsJson;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void ForumController::createThread(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("forumId") || !(*json).isMember("title") ||
        !(*json).isMember("content")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "forumId, title, and content are required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int forumId = (*json)["forumId"].asInt();
    auto title = (*json)["title"].asString();
    auto description = (*json).isMember("description")
                           ? (*json)["description"].asString()
                           : "";
    auto content = (*json)["content"].asString();
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    forumService_.createThread(
        db, forumId, title, description, content, userId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void ForumController::updateThread(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("title")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "title is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto title = (*json)["title"].asString();
    auto description = (*json).isMember("description")
                           ? (*json)["description"].asString()
                           : "";
    auto db = drogon::app().getDbClient();

    forumService_.updateThread(
        db, id, title, description,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void ForumController::deleteThread(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto db = drogon::app().getDbClient();
    forumService_.deleteThread(
        db, id,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

// --- Posts ---

void ForumController::createPost(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("threadId") || !(*json).isMember("content")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "threadId and content are required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int threadId = (*json)["threadId"].asInt();
    auto title = (*json).isMember("title") ? (*json)["title"].asString() : "";
    auto content = (*json)["content"].asString();
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    forumService_.createPost(
        db, threadId, title, content, userId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void ForumController::getPostById(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto db = drogon::app().getDbClient();
    forumService_.getPost(
        db, id,
        [callback](const std::optional<ForumPostDto> &post) {
            if (!post) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Post not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["id"] = post->id;
            result["title"] = post->title;
            result["content"] = post->content;
            result["createdAt"] = post->createdAt;
            result["userId"] = post->userId;
            result["username"] = post->username;
            result["threadId"] = post->threadId;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void ForumController::updatePost(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("content")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "content is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto title = (*json).isMember("title") ? (*json)["title"].asString() : "";
    auto content = (*json)["content"].asString();
    auto db = drogon::app().getDbClient();

    forumService_.updatePost(
        db, id, title, content,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void ForumController::deletePost(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto db = drogon::app().getDbClient();
    forumService_.deletePost(
        db, id,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void ForumController::votePost(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("isLike")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "isLike is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    bool isLike = (*json)["isLike"].asBool();
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    forumService_.votePost(
        db, id, userId, isLike,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
