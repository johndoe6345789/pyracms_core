#pragma once

#include "services/FileService.h"
#include "services/FileUploadService.h"

#include <drogon/HttpController.h>

namespace pyracms {

using UploadReply = std::function<void(const drogon::HttpResponsePtr &)>;

// Chunked uploads for files larger than one proxied request body.
// Parts must be sent in order (1, 2, ...); the server hashes them as
// they arrive so the whole-file sha256 is checked without re-reading.
class FileUploadController
    : public drogon::HttpController<FileUploadController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(FileUploadController::begin, "/api/files/uploads",
                  drogon::Post, "pyracms::JwtAuthFilter",
                  "pyracms::RateLimitFilter");
    ADD_METHOD_TO(FileUploadController::part,
                  "/api/files/uploads/{uploadId}/parts/{n}", drogon::Put,
                  "pyracms::JwtAuthFilter", "pyracms::RateLimitFilter");
    ADD_METHOD_TO(FileUploadController::complete,
                  "/api/files/uploads/{uploadId}/complete", drogon::Post,
                  "pyracms::JwtAuthFilter", "pyracms::RateLimitFilter");
    ADD_METHOD_TO(FileUploadController::abort,
                  "/api/files/uploads/{uploadId}", drogon::Delete,
                  "pyracms::JwtAuthFilter");
    METHOD_LIST_END

    void begin(const drogon::HttpRequestPtr &req, UploadReply &&cb);
    void part(const drogon::HttpRequestPtr &req, UploadReply &&cb,
              const std::string &uploadId, int n);
    void complete(const drogon::HttpRequestPtr &req, UploadReply &&cb,
                  const std::string &uploadId);
    void abort(const drogon::HttpRequestPtr &req, UploadReply &&cb,
               const std::string &uploadId);

  private:
    FileUploadService svc_;
    FileService files_;
};

} // namespace pyracms
