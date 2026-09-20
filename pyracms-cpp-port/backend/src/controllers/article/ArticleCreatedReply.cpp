#include "controllers/ArticleInput.h"
#include "services/WebhookEvents.h"

namespace pyracms {

// Reply for a finished create; fires the webhook on success.
drogon::HttpResponsePtr createdReply(bool ok, const std::string &error,
                                     int tenantId, const std::string &name,
                                     int userId) {
    Json::Value out;
    if (!ok) {
        out["error"] = error;
        auto resp = drogon::HttpResponse::newHttpJsonResponse(out);
        resp->setStatusCode(drogon::k409Conflict);
        return resp;
    }
    Json::Value d;
    d["name"] = name;
    d["userId"] = userId;
    fireWebhookEvent(tenantId, "article.created", d);
    out["message"] = "Article created";
    auto resp = drogon::HttpResponse::newHttpJsonResponse(out);
    resp->setStatusCode(drogon::k201Created);
    return resp;
}

} // namespace pyracms
