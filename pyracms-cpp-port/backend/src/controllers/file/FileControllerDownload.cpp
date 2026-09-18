#include "controllers/FileController.h"

#include <filesystem>

namespace pyracms {

static void notFound(
    const std::function<void(const drogon::HttpResponsePtr &)> &callback,
    const std::string &msg) {
    auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
    (*resp->jsonObject())["error"] = msg;
    resp->setStatusCode(drogon::k404NotFound);
    callback(resp);
}

void FileController::download(
    const drogon::HttpRequestPtr &,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &uuid) {
    auto db = drogon::app().getDbClient();
    fileService_.getFile(
        db, uuid,
        [this, callback, uuid, db](const std::optional<FileDto> &file) {
            if (!file)
                return notFound(callback, "File not found");
            auto path = getUploadDir() + "/" + uuid;
            if (!std::filesystem::exists(path))
                return notFound(callback, "File not found on disk");
            auto resp = drogon::HttpResponse::newFileResponse(
                path, file.value().filename);
            resp->addHeader("Content-Type", file.value().mimetype);
            callback(resp);
            fileService_.incrementDownloadCount(
                db, uuid, [](bool, const std::string &) {});
        });
}

void FileController::thumbnail(
    const drogon::HttpRequestPtr &,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &uuid) {
    fileService_.getFile(
        drogon::app().getDbClient(), uuid,
        [this, callback, uuid](const std::optional<FileDto> &file) {
            if (!file)
                return notFound(callback, "File not found");
            auto dir = getUploadDir();
            auto thumb = dir + "/thumbnails/" + uuid;
            auto path = std::filesystem::exists(thumb) ? thumb
                                                       : dir + "/" + uuid;
            if (!std::filesystem::exists(path))
                return notFound(callback, "File not found on disk");
            auto resp = drogon::HttpResponse::newFileResponse(path);
            resp->addHeader("Content-Type", file.value().mimetype);
            callback(resp);
        });
}

} // namespace pyracms
