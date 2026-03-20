#include "controllers/FileController.h"
#include <drogon/utils/Utilities.h>
#include <fstream>
#include <filesystem>

namespace pyracms {

bool FileController::isImageMimetype(const std::string &mimetype) {
    return mimetype.find("image/") == 0;
}

bool FileController::isVideoMimetype(const std::string &mimetype) {
    return mimetype.find("video/") == 0;
}

std::string FileController::generateUuid() {
    return drogon::utils::getUuid();
}

std::string FileController::getUploadDir() {
    auto &config = drogon::app().getCustomConfig();
    if (config.isMember("upload_dir")) {
        return config["upload_dir"].asString();
    }
    return "./uploads";
}

void FileController::upload(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    drogon::MultiPartParser fileParser;
    if (fileParser.parse(req) != 0) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "Invalid multipart request";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto &fileMap = fileParser.getFiles();
    if (fileMap.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "No file uploaded";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto &file = fileMap[0];
    auto filename = file.getFileName();
    auto uuid = generateUuid();
    // TODO: Proper MIME detection from file content/extension
    auto mimeStr = std::string("application/octet-stream");
    auto size = static_cast<int64_t>(file.fileLength());
    bool isPicture = isImageMimetype(mimeStr);
    bool isVideo = isVideoMimetype(mimeStr);

    // Save file to disk
    auto uploadDir = getUploadDir();
    std::filesystem::create_directories(uploadDir);
    auto filePath = uploadDir + "/" + uuid;
    file.saveAs(filePath);

    auto db = drogon::app().getDbClient();
    fileService_.uploadFile(
        db, filename, uuid, mimeStr, size, isPicture, isVideo,
        [callback, uuid, filename](bool success, const std::string &error) {
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
            result["uuid"] = uuid;
            result["filename"] = filename;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void FileController::download(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &uuid) {

    auto db = drogon::app().getDbClient();
    fileService_.getFile(
        db, uuid,
        [this, callback, uuid, db](const std::optional<FileDto> &file) {
            if (!file) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = "File not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            auto uploadDir = getUploadDir();
            auto filePath = uploadDir + "/" + uuid;

            if (!std::filesystem::exists(filePath)) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = "File not found on disk";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            auto resp = drogon::HttpResponse::newFileResponse(filePath,
                file.value().filename);
            resp->addHeader("Content-Type", file.value().mimetype);
            callback(resp);

            // Increment download count asynchronously
            fileService_.incrementDownloadCount(
                db, uuid,
                [](bool, const std::string &) {});
        });
}

void FileController::thumbnail(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &uuid) {

    auto db = drogon::app().getDbClient();
    fileService_.getFile(
        db, uuid,
        [callback, uuid](const std::optional<FileDto> &file) {
            if (!file) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = "File not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            auto uploadDir = getUploadDir();
            auto thumbPath = uploadDir + "/thumbnails/" + uuid;

            // If thumbnail exists, serve it; otherwise serve the original
            std::string servePath;
            if (std::filesystem::exists(thumbPath)) {
                servePath = thumbPath;
            } else {
                servePath = uploadDir + "/" + uuid;
            }

            if (!std::filesystem::exists(servePath)) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = "File not found on disk";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            auto resp = drogon::HttpResponse::newFileResponse(servePath);
            resp->addHeader("Content-Type", file.value().mimetype);
            callback(resp);
        });
}

void FileController::remove(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &uuid) {

    auto db = drogon::app().getDbClient();
    fileService_.deleteFile(
        db, uuid,
        [callback, uuid](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }

            // Remove file from disk
            auto uploadDir = getUploadDir();
            auto filePath = uploadDir + "/" + uuid;
            auto thumbPath = uploadDir + "/thumbnails/" + uuid;
            std::filesystem::remove(filePath);
            std::filesystem::remove(thumbPath);

            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void FileController::list(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto limitStr = req->getParameter("limit");
    auto offsetStr = req->getParameter("offset");
    int limit = limitStr.empty() ? 50 : std::stoi(limitStr);
    int offset = offsetStr.empty() ? 0 : std::stoi(offsetStr);

    auto db = drogon::app().getDbClient();
    fileService_.listFiles(
        db, limit, offset,
        [callback](const std::vector<FileDto> &files) {
            Json::Value result(Json::arrayValue);
            for (const auto &f : files) {
                Json::Value item;
                item["id"] = f.id;
                item["filename"] = f.filename;
                item["uuid"] = f.uuid;
                item["mimetype"] = f.mimetype;
                item["size"] = static_cast<Json::Int64>(f.size);
                item["createdAt"] = f.createdAt;
                item["isPicture"] = f.isPicture;
                item["isVideo"] = f.isVideo;
                item["downloadCount"] = f.downloadCount;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
