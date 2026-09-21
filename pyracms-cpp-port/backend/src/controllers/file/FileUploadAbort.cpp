#include "controllers/FileUploadCommon.h"

namespace pyracms {

void FileUploadController::abort(const drogon::HttpRequestPtr &req,
                                 UploadReply &&cb,
                                 const std::string &uploadId) {
    withOwnedUpload(svc_, req, uploadId, cb, [=](const UploadRow &u) {
        dropUpload(svc_, u, [cb]() {
            Json::Value r;
            r["success"] = true;
            cb(drogon::HttpResponse::newHttpJsonResponse(r));
        });
    });
}

} // namespace pyracms
