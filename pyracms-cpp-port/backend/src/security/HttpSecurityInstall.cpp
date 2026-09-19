#include "security/HttpSecurity.h"

namespace pyracms {

static drogon::HttpResponsePtr jsonError(drogon::HttpStatusCode code,
                                         const std::string &msg) {
    Json::Value body;
    body["error"] = msg;
    auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
    resp->setStatusCode(code);
    return resp;
}

void installHttpSecurity(drogon::HttpAppFramework &app) {
    if (const char *mb = std::getenv("MAX_UPLOAD_MB")) {
        int v = std::atoi(mb);
        if (v > 0 && v <= 512)
            app.setClientMaxBodySize(static_cast<size_t>(v) << 20);
    } else {
        app.setClientMaxBodySize(25u << 20);
    }
    app.setIdleConnectionTimeout(60);
    app.setMaxConnectionNumPerIP(200);

    app.registerSyncAdvice(
        [](const drogon::HttpRequestPtr &req) -> drogon::HttpResponsePtr {
            if (req->method() == drogon::Options) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k204NoContent);
                addCors(req, resp);
                resp->addHeader("Access-Control-Max-Age", "86400");
                return resp;
            }
            bool multipart =
                req->contentType() == drogon::CT_MULTIPART_FORM_DATA;
            if (!multipart && req->body().size() > kMaxJsonBody)
                return jsonError(drogon::k413RequestEntityTooLarge,
                                 "Request body too large");
            return {};
        });
    app.registerPostHandlingAdvice(
        [](const drogon::HttpRequestPtr &req,
           const drogon::HttpResponsePtr &resp) {
            addCors(req, resp);
            addSecurityHeaders(req, resp);
        });
    // Never hand exception text (or a stack) to a client.
    app.setExceptionHandler(
        [](const std::exception &e, const drogon::HttpRequestPtr &,
           std::function<void(const drogon::HttpResponsePtr &)> &&cb) {
            bool badInput = dynamic_cast<const std::invalid_argument *>(&e) ||
                            dynamic_cast<const std::out_of_range *>(&e) ||
                            dynamic_cast<const Json::LogicError *>(&e);
            LOG_WARN << "unhandled exception: " << e.what();
            cb(badInput ? jsonError(drogon::k400BadRequest,
                                    "Invalid request parameter")
                        : jsonError(drogon::k500InternalServerError,
                                    "Internal server error"));
        });
}

} // namespace pyracms
