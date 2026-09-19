#include "controllers/FileController.h"

namespace pyracms {

drogon::HttpResponsePtr
FileController::filesJson(const std::vector<FileDto> &files) {
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
    return drogon::HttpResponse::newHttpJsonResponse(result);
}

} // namespace pyracms
