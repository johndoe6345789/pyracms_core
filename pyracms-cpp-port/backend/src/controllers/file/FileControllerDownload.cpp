#include "controllers/FileController.h"
#include "controllers/FileRules.h"
#include "filters/TenantGuard.h"
#include "security/Validate.h"

#include <filesystem>

namespace pyracms {

static void notFound(
    const std::function<void(const drogon::HttpResponsePtr &)> &callback) {
    callback(filterError("File not found", drogon::k404NotFound));
}

// The uuid is checked for shape before it is ever turned into a path.
void FileController::download(
    const drogon::HttpRequestPtr &,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &uuid) {
    if (!isValidUuid(uuid))
        return notFound(callback);
    auto db = drogon::app().getDbClient();
    fileService_.getFile(
        db, uuid,
        [this, callback, uuid, db](const std::optional<FileDto> &file) {
            if (!file)
                return notFound(callback);
            auto path = getUploadDir() + "/" + uuid;
            if (!std::filesystem::exists(path))
                return notFound(callback);
            // Always a download, never rendered in our origin
            auto resp = drogon::HttpResponse::newFileResponse(
                path, safeFilename(file->filename));
            resp->addHeader("Content-Type", servedMime(file->mimetype));
            callback(resp);
            fileService_.incrementDownloadCount(
                db, uuid, [](bool, const std::string &) {});
        });
}

void FileController::thumbnail(
    const drogon::HttpRequestPtr &,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &uuid) {
    if (!isValidUuid(uuid))
        return notFound(callback);
    fileService_.getFile(
        drogon::app().getDbClient(), uuid,
        [this, callback, uuid](const std::optional<FileDto> &file) {
            if (!file)
                return notFound(callback);
            auto dir = getUploadDir();
            auto thumb = dir + "/thumbnails/" + uuid;
            auto path = std::filesystem::exists(thumb) ? thumb
                                                       : dir + "/" + uuid;
            if (!std::filesystem::exists(path))
                return notFound(callback);
            auto resp = drogon::HttpResponse::newFileResponse(path);
            resp->addHeader("Content-Type", servedMime(file->mimetype));
            callback(resp);
        });
}

} // namespace pyracms
