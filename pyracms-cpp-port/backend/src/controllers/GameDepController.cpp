#include "controllers/GameDepController.h"

namespace pyracms {

// Helper to build a JSON error response
static drogon::HttpResponsePtr jsonError(const std::string &msg,
                                          drogon::HttpStatusCode code) {
    auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
    (*resp->jsonObject())["error"] = msg;
    resp->setStatusCode(code);
    return resp;
}

// Helper to validate type is "game" or "dep"
static bool isValidType(const std::string &type) {
    return type == "game" || type == "dep";
}

void GameDepController::listPages(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &type) {

    if (!isValidType(type)) {
        callback(jsonError("type must be 'game' or 'dep'", drogon::k400BadRequest));
        return;
    }

    int limit = 20;
    int offset = 0;
    auto limitParam = req->getParameter("limit");
    auto offsetParam = req->getParameter("offset");
    if (!limitParam.empty()) limit = std::stoi(limitParam);
    if (!offsetParam.empty()) offset = std::stoi(offsetParam);

    auto db = drogon::app().getDbClient();
    gameDepService_.listPages(
        db, type, limit, offset,
        [callback](const std::vector<GameDepPageDto> &pages) {
            Json::Value result(Json::arrayValue);
            for (const auto &p : pages) {
                Json::Value item;
                item["id"] = p.id;
                item["type"] = p.type;
                item["ownerId"] = p.ownerId;
                item["name"] = p.name;
                item["displayName"] = p.displayName;
                item["description"] = p.description;
                item["createdAt"] = p.createdAt;
                item["viewCount"] = p.viewCount;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void GameDepController::createPage(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &type) {

    if (!isValidType(type)) {
        callback(jsonError("type must be 'game' or 'dep'", drogon::k400BadRequest));
        return;
    }

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("name") || !(*json).isMember("displayName")) {
        callback(jsonError("name and displayName required", drogon::k400BadRequest));
        return;
    }

    auto name = (*json)["name"].asString();
    auto displayName = (*json)["displayName"].asString();
    auto description = (*json).get("description", "").asString();
    auto ownerId = req->attributes()->get<int>("userId");

    auto db = drogon::app().getDbClient();
    gameDepService_.createPage(
        db, type, name, displayName, description, ownerId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                callback(jsonError(error, drogon::k409Conflict));
                return;
            }
            Json::Value result;
            result["success"] = true;
            auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
            resp->setStatusCode(drogon::k201Created);
            callback(resp);
        });
}

void GameDepController::getPage(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &type,
    const std::string &name) {

    if (!isValidType(type)) {
        callback(jsonError("type must be 'game' or 'dep'", drogon::k400BadRequest));
        return;
    }

    auto db = drogon::app().getDbClient();
    gameDepService_.getPage(
        db, type, name,
        [callback](const std::optional<GameDepPageDto> &page,
                   const std::vector<GameDepRevisionDto> &revisions) {
            if (!page) {
                callback(jsonError("Page not found", drogon::k404NotFound));
                return;
            }

            Json::Value result;
            result["id"] = page->id;
            result["type"] = page->type;
            result["ownerId"] = page->ownerId;
            result["name"] = page->name;
            result["displayName"] = page->displayName;
            result["description"] = page->description;
            result["createdAt"] = page->createdAt;
            result["viewCount"] = page->viewCount;

            Json::Value revisionsJson(Json::arrayValue);
            for (const auto &rev : revisions) {
                Json::Value revItem;
                revItem["id"] = rev.id;
                revItem["pageId"] = rev.pageId;
                revItem["fileId"] = rev.fileId;
                revItem["moduleType"] = rev.moduleType;
                revItem["version"] = rev.version;
                revItem["createdAt"] = rev.createdAt;
                revItem["published"] = rev.published;
                revisionsJson.append(revItem);
            }
            result["revisions"] = revisionsJson;

            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void GameDepController::updatePage(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &type,
    const std::string &name) {

    if (!isValidType(type)) {
        callback(jsonError("type must be 'game' or 'dep'", drogon::k400BadRequest));
        return;
    }

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("displayName")) {
        callback(jsonError("displayName required", drogon::k400BadRequest));
        return;
    }

    auto displayName = (*json)["displayName"].asString();
    auto description = (*json).get("description", "").asString();

    auto db = drogon::app().getDbClient();
    gameDepService_.updatePage(
        db, type, name, displayName, description,
        [callback](bool success, const std::string &error) {
            if (!success) {
                callback(jsonError(error, drogon::k404NotFound));
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void GameDepController::deletePage(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &type,
    const std::string &name) {

    if (!isValidType(type)) {
        callback(jsonError("type must be 'game' or 'dep'", drogon::k400BadRequest));
        return;
    }

    auto db = drogon::app().getDbClient();
    gameDepService_.deletePage(
        db, type, name,
        [callback](bool success, const std::string &error) {
            if (!success) {
                callback(jsonError(error, drogon::k404NotFound));
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void GameDepController::createRevision(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &type,
    const std::string &name) {

    if (!isValidType(type)) {
        callback(jsonError("type must be 'game' or 'dep'", drogon::k400BadRequest));
        return;
    }

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("version")) {
        callback(jsonError("version required", drogon::k400BadRequest));
        return;
    }

    auto version = (*json)["version"].asString();
    auto moduleType = (*json).get("moduleType", "").asString();

    // First look up the page to get its ID
    auto db = drogon::app().getDbClient();
    gameDepService_.getPage(
        db, type, name,
        [this, db, callback, version, moduleType]
        (const std::optional<GameDepPageDto> &page,
         const std::vector<GameDepRevisionDto> &) {
            if (!page) {
                callback(jsonError("Page not found", drogon::k404NotFound));
                return;
            }
            gameDepService_.createRevision(
                db, page->id, version, moduleType,
                [callback](bool success, int id, const std::string &error) {
                    if (!success) {
                        callback(jsonError(error, drogon::k409Conflict));
                        return;
                    }
                    Json::Value result;
                    result["success"] = true;
                    result["id"] = id;
                    auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
                    resp->setStatusCode(drogon::k201Created);
                    callback(resp);
                });
        });
}

void GameDepController::updateRevision(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &type,
    const std::string &name,
    const std::string &ver) {

    if (!isValidType(type)) {
        callback(jsonError("type must be 'game' or 'dep'", drogon::k400BadRequest));
        return;
    }

    auto json = req->getJsonObject();
    if (!json) {
        callback(jsonError("JSON body required", drogon::k400BadRequest));
        return;
    }

    auto version = (*json).get("version", ver).asString();
    auto moduleType = (*json).get("moduleType", "").asString();

    // Look up the revision by page name + version
    auto db = drogon::app().getDbClient();
    gameDepService_.getPage(
        db, type, name,
        [this, db, callback, ver, version, moduleType]
        (const std::optional<GameDepPageDto> &page,
         const std::vector<GameDepRevisionDto> &revisions) {
            if (!page) {
                callback(jsonError("Page not found", drogon::k404NotFound));
                return;
            }
            // Find the revision matching the version
            int revisionId = -1;
            for (const auto &rev : revisions) {
                if (rev.version == ver) {
                    revisionId = rev.id;
                    break;
                }
            }
            if (revisionId < 0) {
                callback(jsonError("Revision not found", drogon::k404NotFound));
                return;
            }
            gameDepService_.updateRevision(
                db, revisionId, version, moduleType,
                [callback](bool success, const std::string &error) {
                    if (!success) {
                        callback(jsonError(error, drogon::k404NotFound));
                        return;
                    }
                    Json::Value result;
                    result["success"] = true;
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

void GameDepController::deleteRevision(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &type,
    const std::string &name,
    const std::string &ver) {

    if (!isValidType(type)) {
        callback(jsonError("type must be 'game' or 'dep'", drogon::k400BadRequest));
        return;
    }

    auto db = drogon::app().getDbClient();
    gameDepService_.getPage(
        db, type, name,
        [this, db, callback, ver]
        (const std::optional<GameDepPageDto> &page,
         const std::vector<GameDepRevisionDto> &revisions) {
            if (!page) {
                callback(jsonError("Page not found", drogon::k404NotFound));
                return;
            }
            int revisionId = -1;
            for (const auto &rev : revisions) {
                if (rev.version == ver) {
                    revisionId = rev.id;
                    break;
                }
            }
            if (revisionId < 0) {
                callback(jsonError("Revision not found", drogon::k404NotFound));
                return;
            }
            gameDepService_.deleteRevision(
                db, revisionId,
                [callback](bool success, const std::string &error) {
                    if (!success) {
                        callback(jsonError(error, drogon::k404NotFound));
                        return;
                    }
                    Json::Value result;
                    result["success"] = true;
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

void GameDepController::togglePublish(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &type,
    const std::string &name,
    const std::string &ver) {

    if (!isValidType(type)) {
        callback(jsonError("type must be 'game' or 'dep'", drogon::k400BadRequest));
        return;
    }

    auto db = drogon::app().getDbClient();
    gameDepService_.getPage(
        db, type, name,
        [this, db, callback, ver]
        (const std::optional<GameDepPageDto> &page,
         const std::vector<GameDepRevisionDto> &revisions) {
            if (!page) {
                callback(jsonError("Page not found", drogon::k404NotFound));
                return;
            }
            int revisionId = -1;
            for (const auto &rev : revisions) {
                if (rev.version == ver) {
                    revisionId = rev.id;
                    break;
                }
            }
            if (revisionId < 0) {
                callback(jsonError("Revision not found", drogon::k404NotFound));
                return;
            }
            gameDepService_.togglePublish(
                db, revisionId,
                [callback](bool success, const std::string &error) {
                    if (!success) {
                        callback(jsonError(error, drogon::k500InternalServerError));
                        return;
                    }
                    Json::Value result;
                    result["success"] = true;
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

void GameDepController::uploadSource(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &type,
    const std::string &name,
    const std::string &ver) {

    if (!isValidType(type)) {
        callback(jsonError("type must be 'game' or 'dep'", drogon::k400BadRequest));
        return;
    }

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("fileId")) {
        callback(jsonError("fileId required", drogon::k400BadRequest));
        return;
    }

    auto fileId = (*json)["fileId"].asInt();

    auto db = drogon::app().getDbClient();
    gameDepService_.getPage(
        db, type, name,
        [this, db, callback, ver, fileId]
        (const std::optional<GameDepPageDto> &page,
         const std::vector<GameDepRevisionDto> &revisions) {
            if (!page) {
                callback(jsonError("Page not found", drogon::k404NotFound));
                return;
            }
            int revisionId = -1;
            for (const auto &rev : revisions) {
                if (rev.version == ver) {
                    revisionId = rev.id;
                    break;
                }
            }
            if (revisionId < 0) {
                callback(jsonError("Revision not found", drogon::k404NotFound));
                return;
            }
            gameDepService_.uploadSource(
                db, revisionId, fileId,
                [callback](bool success, const std::string &error) {
                    if (!success) {
                        callback(jsonError(error, drogon::k500InternalServerError));
                        return;
                    }
                    Json::Value result;
                    result["success"] = true;
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

void GameDepController::addBinary(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &type,
    const std::string &name,
    const std::string &ver) {

    if (!isValidType(type)) {
        callback(jsonError("type must be 'game' or 'dep'", drogon::k400BadRequest));
        return;
    }

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("osId") || !(*json).isMember("archId") ||
        !(*json).isMember("fileId")) {
        callback(jsonError("osId, archId, and fileId required", drogon::k400BadRequest));
        return;
    }

    auto osId = (*json)["osId"].asInt();
    auto archId = (*json)["archId"].asInt();
    auto fileId = (*json)["fileId"].asInt();

    auto db = drogon::app().getDbClient();
    gameDepService_.getPage(
        db, type, name,
        [this, db, callback, ver, osId, archId, fileId]
        (const std::optional<GameDepPageDto> &page,
         const std::vector<GameDepRevisionDto> &revisions) {
            if (!page) {
                callback(jsonError("Page not found", drogon::k404NotFound));
                return;
            }
            int revisionId = -1;
            for (const auto &rev : revisions) {
                if (rev.version == ver) {
                    revisionId = rev.id;
                    break;
                }
            }
            if (revisionId < 0) {
                callback(jsonError("Revision not found", drogon::k404NotFound));
                return;
            }
            gameDepService_.addBinary(
                db, revisionId, osId, archId, fileId,
                [callback](bool success, int id, const std::string &error) {
                    if (!success) {
                        callback(jsonError(error, drogon::k409Conflict));
                        return;
                    }
                    Json::Value result;
                    result["success"] = true;
                    result["id"] = id;
                    auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
                    resp->setStatusCode(drogon::k201Created);
                    callback(resp);
                });
        });
}

void GameDepController::deleteBinary(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &type,
    const std::string &name,
    const std::string &ver,
    int id) {

    auto db = drogon::app().getDbClient();
    gameDepService_.deleteBinary(
        db, id,
        [callback](bool success, const std::string &error) {
            if (!success) {
                callback(jsonError(error, drogon::k404NotFound));
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void GameDepController::addDependency(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &type,
    const std::string &name) {

    if (!isValidType(type)) {
        callback(jsonError("type must be 'game' or 'dep'", drogon::k400BadRequest));
        return;
    }

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("depRevisionId")) {
        callback(jsonError("depRevisionId required", drogon::k400BadRequest));
        return;
    }

    auto depRevisionId = (*json)["depRevisionId"].asInt();

    auto db = drogon::app().getDbClient();
    gameDepService_.getPage(
        db, type, name,
        [this, db, callback, depRevisionId]
        (const std::optional<GameDepPageDto> &page,
         const std::vector<GameDepRevisionDto> &) {
            if (!page) {
                callback(jsonError("Page not found", drogon::k404NotFound));
                return;
            }
            gameDepService_.addDependency(
                db, page->id, depRevisionId,
                [callback](bool success, const std::string &error) {
                    if (!success) {
                        callback(jsonError(error, drogon::k409Conflict));
                        return;
                    }
                    Json::Value result;
                    result["success"] = true;
                    auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
                    resp->setStatusCode(drogon::k201Created);
                    callback(resp);
                });
        });
}

void GameDepController::removeDependency(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &type,
    const std::string &name,
    int id) {

    auto db = drogon::app().getDbClient();
    gameDepService_.removeDependency(
        db, id,
        [callback](bool success, const std::string &error) {
            if (!success) {
                callback(jsonError(error, drogon::k404NotFound));
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void GameDepController::setTags(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &type,
    const std::string &name) {

    if (!isValidType(type)) {
        callback(jsonError("type must be 'game' or 'dep'", drogon::k400BadRequest));
        return;
    }

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("tags") || !(*json)["tags"].isArray()) {
        callback(jsonError("tags array required", drogon::k400BadRequest));
        return;
    }

    std::vector<std::string> tags;
    for (const auto &tag : (*json)["tags"]) {
        tags.push_back(tag.asString());
    }

    auto db = drogon::app().getDbClient();
    gameDepService_.getPage(
        db, type, name,
        [this, db, callback, tags]
        (const std::optional<GameDepPageDto> &page,
         const std::vector<GameDepRevisionDto> &) {
            if (!page) {
                callback(jsonError("Page not found", drogon::k404NotFound));
                return;
            }
            gameDepService_.setTags(
                db, page->id, tags,
                [callback](bool success, const std::string &error) {
                    if (!success) {
                        callback(jsonError(error, drogon::k500InternalServerError));
                        return;
                    }
                    Json::Value result;
                    result["success"] = true;
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

void GameDepController::vote(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &type,
    const std::string &name) {

    if (!isValidType(type)) {
        callback(jsonError("type must be 'game' or 'dep'", drogon::k400BadRequest));
        return;
    }

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("isLike")) {
        callback(jsonError("isLike required", drogon::k400BadRequest));
        return;
    }

    auto isLike = (*json)["isLike"].asBool();
    auto userId = req->attributes()->get<int>("userId");

    auto db = drogon::app().getDbClient();
    gameDepService_.getPage(
        db, type, name,
        [this, db, callback, userId, isLike]
        (const std::optional<GameDepPageDto> &page,
         const std::vector<GameDepRevisionDto> &) {
            if (!page) {
                callback(jsonError("Page not found", drogon::k404NotFound));
                return;
            }
            gameDepService_.vote(
                db, page->id, userId, isLike,
                [callback](bool success, const std::string &error) {
                    if (!success) {
                        callback(jsonError(error, drogon::k500InternalServerError));
                        return;
                    }
                    Json::Value result;
                    result["success"] = true;
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

void GameDepController::getFullCatalog(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto db = drogon::app().getDbClient();
    gameDepService_.getFullCatalogJson(
        db, [callback](const Json::Value &catalog) {
            callback(drogon::HttpResponse::newHttpJsonResponse(catalog));
        });
}

void GameDepController::listOperatingSystems(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto db = drogon::app().getDbClient();
    gameDepService_.listOperatingSystems(
        db, [callback](const std::vector<OperatingSystemDto> &items) {
            Json::Value result(Json::arrayValue);
            for (const auto &os : items) {
                Json::Value item;
                item["id"] = os.id;
                item["name"] = os.name;
                item["displayName"] = os.displayName;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void GameDepController::listArchitectures(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto db = drogon::app().getDbClient();
    gameDepService_.listArchitectures(
        db, [callback](const std::vector<ArchitectureDto> &items) {
            Json::Value result(Json::arrayValue);
            for (const auto &arch : items) {
                Json::Value item;
                item["id"] = arch.id;
                item["name"] = arch.name;
                item["displayName"] = arch.displayName;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
