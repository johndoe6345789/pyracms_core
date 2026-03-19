#pragma once

#include <drogon/HttpController.h>
#include "services/FileService.h"

namespace pyracms {

class FileController : public drogon::HttpController<FileController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(FileController::upload, "/api/files", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(FileController::download, "/api/files/{uuid}", drogon::Get);
    ADD_METHOD_TO(FileController::thumbnail, "/api/files/{uuid}/thumbnail", drogon::Get);
    ADD_METHOD_TO(FileController::remove, "/api/files/{uuid}", drogon::Delete, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(FileController::list, "/api/files", drogon::Get, "pyracms::JwtAuthFilter");
    METHOD_LIST_END

    void upload(const drogon::HttpRequestPtr &req,
                std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void download(const drogon::HttpRequestPtr &req,
                  std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                  const std::string &uuid);

    void thumbnail(const drogon::HttpRequestPtr &req,
                   std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                   const std::string &uuid);

    void remove(const drogon::HttpRequestPtr &req,
                std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                const std::string &uuid);

    void list(const drogon::HttpRequestPtr &req,
              std::function<void(const drogon::HttpResponsePtr &)> &&callback);

private:
    FileService fileService_;

    static bool isImageMimetype(const std::string &mimetype);
    static bool isVideoMimetype(const std::string &mimetype);
    static std::string generateUuid();
    static std::string getUploadDir();
};

} // namespace pyracms
