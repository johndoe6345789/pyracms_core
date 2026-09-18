#include "controllers/FileController.h"

#include <filesystem>

namespace pyracms {

void FileController::remove(
    const drogon::HttpRequestPtr &,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &uuid) {
    fileService_.deleteFile(
        drogon::app().getDbClient(), uuid,
        [callback, uuid](bool success, const std::string &error) {
            Json::Value r;
            if (!success) {
                r["error"] = error;
                auto resp = drogon::HttpResponse::newHttpJsonResponse(r);
                resp->setStatusCode(drogon::k500InternalServerError);
                return callback(resp);
            }
            auto dir = getUploadDir();
            std::filesystem::remove(dir + "/" + uuid);
            std::filesystem::remove(dir + "/thumbnails/" + uuid);
            r["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(r));
        });
}

void FileController::list(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {
    auto limitStr = req->getParameter("limit");
    auto offsetStr = req->getParameter("offset");
    int limit = limitStr.empty() ? 50 : std::stoi(limitStr);
    int offset = offsetStr.empty() ? 0 : std::stoi(offsetStr);
    fileService_.listFiles(
        drogon::app().getDbClient(), limit, offset,
        [callback](const std::vector<FileDto> &files) {
            Json::Value result(Json::arrayValue);
            for (const auto &f : files) {
                Json::Value item;
                item["id"] = f.id;
                item["filename"] = f.filename;
                item["uuid"] = f.uuid;
                item["mimetype"] = f.mimetype;
                item["size"] = static_cast<Json::Int64>(f.size);
                item["sha256"] = f.sha256;
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
