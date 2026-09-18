#include "controllers/BoolReply.h"
#include "controllers/FileController.h"

#include <filesystem>

namespace pyracms {

static void fail(const std::function<void(const drogon::HttpResponsePtr &)>
                     &callback,
                 const std::string &msg, drogon::HttpStatusCode code) {
    auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
    (*resp->jsonObject())["error"] = msg;
    resp->setStatusCode(code);
    callback(resp);
}

void FileController::upload(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {
    drogon::MultiPartParser parser;
    if (parser.parse(req) != 0)
        return fail(callback, "Invalid multipart request",
                    drogon::k400BadRequest);
    auto &files = parser.getFiles();
    if (files.empty())
        return fail(callback, "No file uploaded", drogon::k400BadRequest);

    auto &file = files[0];
    auto filename = file.getFileName();
    auto uuid = generateUuid();
    auto mime = mimeFor(filename);
    auto size = static_cast<int64_t>(file.fileLength());
    auto sha = sha256Hex(std::string(file.fileData(), file.fileLength()));
    auto dir = getUploadDir();
    std::filesystem::create_directories(dir);
    file.saveAs(dir + "/" + uuid);

    fileService_.uploadFile(
        drogon::app().getDbClient(), filename, uuid, mime, size,
        isImageMimetype(mime), isVideoMimetype(mime),
        [callback, uuid, filename, size, sha](bool ok,
                                              const std::string &error) {
            if (!ok)
                return fail(callback, error,
                            drogon::k500InternalServerError);
            Json::Value r;
            r["success"] = true;
            r["uuid"] = uuid;
            r["filename"] = filename;
            r["size"] = static_cast<Json::Int64>(size);
            r["sha256"] = sha;
            callback(drogon::HttpResponse::newHttpJsonResponse(r));
        },
        sha);
}

} // namespace pyracms
