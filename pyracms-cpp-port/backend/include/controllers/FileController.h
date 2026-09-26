#pragma once

#include "services/FileService.h"

#include <drogon/HttpController.h>

namespace pyracms {

class FileController : public drogon::HttpController<FileController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(FileController::upload, "/api/files", drogon::Post,
                  "pyracms::JwtAuthFilter", "pyracms::RateLimitFilter");
    ADD_METHOD_TO(FileController::download, "/api/files/{uuid}", drogon::Get,
                  "pyracms::RateLimitFilter");
    ADD_METHOD_TO(FileController::thumbnail, "/api/files/{uuid}/thumbnail",
                  drogon::Get, "pyracms::RateLimitFilter");
    ADD_METHOD_TO(FileController::view, "/api/files/{uuid}/view", drogon::Get,
                  "pyracms::RateLimitFilter");
    ADD_METHOD_TO(FileController::remove, "/api/files/{uuid}", drogon::Delete,
                  "pyracms::JwtAuthFilter", "pyracms::OwnerFilter");
    ADD_METHOD_TO(FileController::list, "/api/files", drogon::Get,
                  "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(FileController::setVisibility,
                  "/api/files/{uuid}/visibility", drogon::Put,
                  "pyracms::JwtAuthFilter", "pyracms::OwnerFilter");
    ADD_METHOD_TO(FileController::link, "/api/files/{uuid}/link",
                  drogon::Post, "pyracms::JwtAuthFilter");
    METHOD_LIST_END

    void
    upload(const drogon::HttpRequestPtr &req,
           std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void
    download(const drogon::HttpRequestPtr &req,
             std::function<void(const drogon::HttpResponsePtr &)> &&callback,
             const std::string &uuid);

    void
    thumbnail(const drogon::HttpRequestPtr &req,
              std::function<void(const drogon::HttpResponsePtr &)> &&callback,
              const std::string &uuid);

    void view(const drogon::HttpRequestPtr &req,
              std::function<void(const drogon::HttpResponsePtr &)> &&callback,
              const std::string &uuid);

    void remove(const drogon::HttpRequestPtr &req,
                std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                const std::string &uuid);

    // Body {"visibility": "public" | "authenticated"}.
    void setVisibility(
        const drogon::HttpRequestPtr &req,
        std::function<void(const drogon::HttpResponsePtr &)> &&callback,
        const std::string &uuid);

    // A signed link (exp + sig query) that opens the file for a while.
    void link(const drogon::HttpRequestPtr &req,
              std::function<void(const drogon::HttpResponsePtr &)> &&callback,
              const std::string &uuid);

    void list(const drogon::HttpRequestPtr &req,
              std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    static bool isImageMimetype(const std::string &mimetype);
    static bool isVideoMimetype(const std::string &mimetype);
    static std::string generateUuid();
    static std::string mimeFor(const std::string &filename);
    static std::string sha256Hex(const std::string &data);

  private:
    FileService fileService_;
    static drogon::HttpResponsePtr filesJson(const std::vector<FileDto> &);
};

} // namespace pyracms
