#include "controllers/BoolReply.h"
#include "controllers/FileController.h"
#include "controllers/FileRules.h"
#include "filters/TenantGuard.h"

#include <filesystem>

namespace pyracms {

static const size_t kMaxFileBytes = [] {
    const char *mb = std::getenv("MAX_UPLOAD_MB");
    int v = mb ? std::atoi(mb) : 25;
    return static_cast<size_t>(v > 0 && v <= 512 ? v : 25) << 20;
}();

// Stored under a server-made uuid (the client filename never touches the
// filesystem); the type comes from the extension and, for image formats,
// is confirmed against the file's own signature.
void FileController::upload(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {
    drogon::MultiPartParser parser;
    if (parser.parse(req) != 0 || parser.getFiles().empty()) {
        callback(filterError("Invalid multipart request or no file",
                             drogon::k400BadRequest));
        return;
    }
    auto &file = parser.getFiles()[0];
    if (file.fileLength() > kMaxFileBytes) {
        callback(filterError("File too large",
                             drogon::k413RequestEntityTooLarge));
        return;
    }
    auto filename = safeFilename(file.getFileName());
    auto ext = fileExtension(filename);
    std::string data(file.fileData(), file.fileLength());
    if (!magicMatches(ext, data)) {
        callback(filterError("File content does not match its type",
                             drogon::k415UnsupportedMediaType));
        return;
    }
    auto uuid = generateUuid();
    auto mime = mimeFor(filename);
    auto size = static_cast<int64_t>(data.size());
    auto sha = sha256Hex(data);
    auto dir = getUploadDir();
    std::filesystem::create_directories(dir);
    file.saveAs(dir + "/" + uuid);

    fileService_.uploadFile(
        drogon::app().getDbClient(), filename, uuid, mime, size,
        isImageMimetype(mime), isVideoMimetype(mime),
        [callback, uuid, filename, size, sha, dir](bool ok,
                                                   const std::string &) {
            if (!ok) {
                std::filesystem::remove(dir + "/" + uuid);
                callback(filterError("Could not store the file",
                                     drogon::k500InternalServerError));
                return;
            }
            Json::Value r;
            r["success"] = true;
            r["uuid"] = uuid;
            r["filename"] = filename;
            r["size"] = static_cast<Json::Int64>(size);
            r["sha256"] = sha;
            callback(drogon::HttpResponse::newHttpJsonResponse(r));
        },
        sha, req->attributes()->get<int>("userId"), tokenTenantOf(req));
}

} // namespace pyracms
