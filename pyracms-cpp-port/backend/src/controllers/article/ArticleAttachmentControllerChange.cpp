#include "controllers/ArticleAttachmentController.h"
#include "filters/TenantGuard.h"
#include "security/ValidateId.h"

namespace pyracms {

static bool wholeNumber(const std::string &s) {
    return !s.empty() && s.size() < 10 &&
           s.find_first_not_of("0123456789") == std::string::npos;
}

void ArticleAttachmentController::add(HttpReq req, HttpCbRef callback,
                                      HttpStr name) {
    auto json = req->getJsonObject();
    if (!json || !(*json)["fileUuid"].isString() ||
        !isValidUuid((*json)["fileUuid"].asString()) ||
        !(*json)["tenant_id"].isIntegral())
        return callback(filterError(
            "fileUuid and tenant_id are required", drogon::k400BadRequest));
    auto db = drogon::app().getDbClient();
    attachments_.add(
        db, (*json)["tenant_id"].asInt(), name,
        (*json)["fileUuid"].asString(),
        [callback](bool ok, const std::string &error) {
            if (!ok)
                return callback(filterError(error, drogon::k404NotFound));
            Json::Value r;
            r["message"] = "Attachment added";
            auto resp = drogon::HttpResponse::newHttpJsonResponse(r);
            resp->setStatusCode(drogon::k201Created);
            callback(resp);
        });
}

void ArticleAttachmentController::remove(HttpReq req, HttpCbRef callback,
                                         HttpStr name, HttpStr attachmentId) {
    auto tenant = req->getParameter("tenant_id");
    if (!wholeNumber(tenant) || !wholeNumber(attachmentId))
        return callback(
            filterError("Invalid request", drogon::k400BadRequest));
    attachments_.remove(
        drogon::app().getDbClient(), std::stoi(tenant), name,
        std::stoi(attachmentId),
        [callback](bool ok, const std::string &error) {
            if (!ok)
                return callback(filterError(error, drogon::k404NotFound));
            Json::Value r;
            r["message"] = "Attachment removed";
            callback(drogon::HttpResponse::newHttpJsonResponse(r));
        });
}

} // namespace pyracms
