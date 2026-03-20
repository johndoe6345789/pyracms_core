#include "controllers/GalleryController.h"

namespace pyracms {

void GalleryController::listAlbums(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto tenantIdStr = req->getParameter("tenant_id");
    if (tenantIdStr.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenant_id parameter required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int tenantId = std::stoi(tenantIdStr);
    auto db = drogon::app().getDbClient();
    galleryService_.listAlbums(
        db, tenantId,
        [callback](const std::vector<GalleryAlbumDto> &albums) {
            Json::Value result(Json::arrayValue);
            for (const auto &a : albums) {
                Json::Value item;
                item["id"] = a.id;
                item["displayName"] = a.displayName;
                item["description"] = a.description;
                item["createdAt"] = a.createdAt;
                item["isPrivate"] = a.isPrivate;
                item["isProtected"] = a.isProtected;
                item["userId"] = a.userId;
                item["defaultPictureId"] = a.defaultPictureId;
                item["pictureCount"] = a.pictureCount;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void GalleryController::createAlbum(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("displayName") ||
        !(*json).isMember("tenantId")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "displayName and tenantId required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto displayName = (*json)["displayName"].asString();
    auto description = (*json).isMember("description")
                           ? (*json)["description"].asString()
                           : "";
    int tenantId = (*json)["tenantId"].asInt();
    int userId = req->attributes()->get<int>("userId");

    auto db = drogon::app().getDbClient();
    galleryService_.createAlbum(
        db, tenantId, displayName, description, userId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }

            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void GalleryController::getAlbum(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto db = drogon::app().getDbClient();
    galleryService_.getAlbum(
        db, id,
        [callback](const std::optional<GalleryAlbumDetailDto> &detail) {
            if (!detail) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = "Album not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["id"] = detail->album.id;
            result["displayName"] = detail->album.displayName;
            result["description"] = detail->album.description;
            result["createdAt"] = detail->album.createdAt;
            result["isPrivate"] = detail->album.isPrivate;
            result["isProtected"] = detail->album.isProtected;
            result["userId"] = detail->album.userId;
            result["defaultPictureId"] = detail->album.defaultPictureId;
            result["pictureCount"] = detail->album.pictureCount;

            Json::Value pictures(Json::arrayValue);
            for (const auto &p : detail->pictures) {
                Json::Value pic;
                pic["id"] = p.id;
                pic["displayName"] = p.displayName;
                pic["description"] = p.description;
                pic["createdAt"] = p.createdAt;
                pic["isPrivate"] = p.isPrivate;
                pic["albumId"] = p.albumId;
                pic["fileUuid"] = p.fileUuid;
                pic["userId"] = p.userId;
                pictures.append(pic);
            }
            result["pictures"] = pictures;

            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void GalleryController::updateAlbum(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("displayName")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "displayName required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto displayName = (*json)["displayName"].asString();
    auto description = (*json).isMember("description")
                           ? (*json)["description"].asString()
                           : "";

    auto db = drogon::app().getDbClient();
    galleryService_.updateAlbum(
        db, id, displayName, description,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }

            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void GalleryController::deleteAlbum(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto db = drogon::app().getDbClient();
    galleryService_.deleteAlbum(
        db, id,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }

            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void GalleryController::addPicture(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("displayName") ||
        !(*json).isMember("fileUuid")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "displayName and fileUuid required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto displayName = (*json)["displayName"].asString();
    auto description = (*json).isMember("description")
                           ? (*json)["description"].asString()
                           : "";
    auto fileUuid = (*json)["fileUuid"].asString();
    int userId = req->attributes()->get<int>("userId");

    auto db = drogon::app().getDbClient();
    galleryService_.addPicture(
        db, id, displayName, description, fileUuid, userId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }

            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void GalleryController::getPicture(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto db = drogon::app().getDbClient();
    galleryService_.getPicture(
        db, id,
        [callback](const std::optional<GalleryPictureDto> &picture) {
            if (!picture) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = "Picture not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["id"] = picture->id;
            result["displayName"] = picture->displayName;
            result["description"] = picture->description;
            result["createdAt"] = picture->createdAt;
            result["isPrivate"] = picture->isPrivate;
            result["albumId"] = picture->albumId;
            result["fileUuid"] = picture->fileUuid;
            result["userId"] = picture->userId;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void GalleryController::updatePicture(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("displayName")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "displayName required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto displayName = (*json)["displayName"].asString();
    auto description = (*json).isMember("description")
                           ? (*json)["description"].asString()
                           : "";

    auto db = drogon::app().getDbClient();
    galleryService_.updatePicture(
        db, id, displayName, description,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }

            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void GalleryController::deletePicture(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto db = drogon::app().getDbClient();
    galleryService_.deletePicture(
        db, id,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }

            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void GalleryController::setDefaultPicture(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("albumId")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "albumId required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int albumId = (*json)["albumId"].asInt();

    auto db = drogon::app().getDbClient();
    galleryService_.setDefaultPicture(
        db, albumId, id,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }

            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void GalleryController::votePicture(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("isLike")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "isLike required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    bool isLike = (*json)["isLike"].asBool();
    int userId = req->attributes()->get<int>("userId");

    auto db = drogon::app().getDbClient();
    galleryService_.votePicture(
        db, id, userId, isLike,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }

            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
