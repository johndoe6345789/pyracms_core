#include "controllers/FileController.h"
#include "controllers/FileVisibility.h"
#include "filters/TenantGuard.h"
#include "security/Validate.h"

namespace pyracms {

void FileController::setVisibility(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &uuid) {
    auto json = req->getJsonObject();
    if (!json || !(*json)["visibility"].isString() ||
        !isFileVisibility((*json)["visibility"].asString()) ||
        !isValidUuid(uuid))
        return callback(filterError(
            "visibility must be \"public\" or \"authenticated\"",
            drogon::k400BadRequest));
    fileService_.setVisibility(
        drogon::app().getDbClient(), uuid, (*json)["visibility"].asString(),
        [callback](bool ok, const std::string &error) {
            if (!ok)
                return callback(filterError(error, drogon::k404NotFound));
            Json::Value r;
            r["message"] = "Visibility changed";
            callback(drogon::HttpResponse::newHttpJsonResponse(r));
        });
}

} // namespace pyracms
