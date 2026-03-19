#include "controllers/CodeSnippetController.h"

namespace pyracms {

void CodeSnippetController::listSnippets(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto tenantIdStr = req->getParameter("tenant_id");
    if (tenantIdStr.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenant_id is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int tenantId = std::stoi(tenantIdStr);
    int limit = 20;
    int offset = 0;
    int authorId = 0;
    auto limitStr = req->getParameter("limit");
    auto offsetStr = req->getParameter("offset");
    auto language = req->getParameter("language");
    auto authorStr = req->getParameter("author_id");
    if (!limitStr.empty()) limit = std::stoi(limitStr);
    if (!offsetStr.empty()) offset = std::stoi(offsetStr);
    if (!authorStr.empty()) authorId = std::stoi(authorStr);

    auto db = drogon::app().getDbClient();

    snippetService_.listSnippets(
        db, tenantId, language, authorId, limit, offset,
        [callback](const std::vector<CodeSnippetDto> &snippets, int total) {
            Json::Value result;
            result["total"] = total;
            result["items"] = Json::Value(Json::arrayValue);
            for (const auto &s : snippets) {
                Json::Value item;
                item["id"] = s.id;
                item["tenantId"] = s.tenantId;
                item["authorId"] = s.authorId;
                item["authorUsername"] = s.authorUsername;
                item["title"] = s.title;
                item["language"] = s.language;
                item["visibility"] = s.visibility;
                item["runCount"] = s.runCount;
                item["forkedFrom"] = s.forkedFrom;
                item["createdAt"] = s.createdAt;
                item["updatedAt"] = s.updatedAt;
                result["items"].append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void CodeSnippetController::createSnippet(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("title") || !(*json).isMember("code") ||
        !(*json).isMember("tenant_id")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "title, code, and tenant_id required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto title = (*json)["title"].asString();
    auto code = (*json)["code"].asString();
    auto language = (*json).get("language", "python").asString();
    auto visibility = (*json).get("visibility", "public").asString();
    int tenantId = (*json)["tenant_id"].asInt();
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    snippetService_.createSnippet(
        db, tenantId, userId, title, code, language, visibility,
        [callback](bool success, int snippetId, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }

            Json::Value result;
            result["message"] = "Snippet created";
            result["id"] = snippetId;
            auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
            resp->setStatusCode(drogon::k201Created);
            callback(resp);
        });
}

void CodeSnippetController::getSnippet(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int snippetId = std::stoi(id);
    auto db = drogon::app().getDbClient();

    snippetService_.getSnippet(
        db, snippetId,
        [callback](const std::optional<CodeSnippetDto> &snippet) {
            if (!snippet) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Snippet not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["id"] = snippet->id;
            result["tenantId"] = snippet->tenantId;
            result["authorId"] = snippet->authorId;
            result["authorUsername"] = snippet->authorUsername;
            result["title"] = snippet->title;
            result["code"] = snippet->code;
            result["language"] = snippet->language;
            result["visibility"] = snippet->visibility;
            result["runCount"] = snippet->runCount;
            result["forkedFrom"] = snippet->forkedFrom;
            result["createdAt"] = snippet->createdAt;
            result["updatedAt"] = snippet->updatedAt;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void CodeSnippetController::updateSnippet(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    auto json = req->getJsonObject();
    if (!json) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "JSON body required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int snippetId = std::stoi(id);
    int userId = req->attributes()->get<int>("userId");
    auto title = (*json).get("title", "").asString();
    auto code = (*json).get("code", "").asString();
    auto language = (*json).get("language", "python").asString();
    auto visibility = (*json).get("visibility", "public").asString();
    auto db = drogon::app().getDbClient();

    snippetService_.updateSnippet(
        db, snippetId, userId, title, code, language, visibility,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["message"] = "Snippet updated";
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void CodeSnippetController::deleteSnippet(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int snippetId = std::stoi(id);
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    snippetService_.deleteSnippet(
        db, snippetId, userId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["message"] = "Snippet deleted";
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void CodeSnippetController::runSnippet(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int snippetId = std::stoi(id);
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    snippetService_.getSnippet(
        db, snippetId,
        [this, db, snippetId, userId, callback](const std::optional<CodeSnippetDto> &snippet) {
            if (!snippet) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Snippet not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            if (!dockerService_.isLanguageSupported(snippet->language)) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Unsupported language: " + snippet->language;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }

            dockerService_.executeCode(
                snippet->language, snippet->code,
                [this, db, snippetId, userId, callback](const ExecutionResult &execResult) {
                    // Record the execution in the database
                    snippetService_.recordExecution(
                        db, snippetId, userId,
                        execResult.output, execResult.exitCode, execResult.executionTimeMs,
                        [execResult, callback](bool, const std::string &) {
                            Json::Value result;
                            result["exitCode"] = execResult.exitCode;
                            result["output"] = execResult.output;
                            result["executionTimeMs"] = execResult.executionTimeMs;
                            callback(drogon::HttpResponse::newHttpJsonResponse(result));
                        });
                });
        });
}

void CodeSnippetController::forkSnippet(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("tenant_id")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenant_id required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int snippetId = std::stoi(id);
    int userId = req->attributes()->get<int>("userId");
    int tenantId = (*json)["tenant_id"].asInt();
    auto db = drogon::app().getDbClient();

    snippetService_.forkSnippet(
        db, snippetId, userId, tenantId,
        [callback](bool success, int newId, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }

            Json::Value result;
            result["message"] = "Snippet forked";
            result["id"] = newId;
            auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
            resp->setStatusCode(drogon::k201Created);
            callback(resp);
        });
}

} // namespace pyracms
