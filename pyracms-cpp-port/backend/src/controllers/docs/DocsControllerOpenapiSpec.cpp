#include "controllers/DocsController.h"

#include <fstream>
#include <sstream>

namespace pyracms {

void DocsController::openapiSpec(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    std::ifstream file("openapi.yaml");
    if (!file.is_open()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "openapi.yaml not found";
        resp->setStatusCode(drogon::k404NotFound);
        callback(resp);
        return;
    }

    std::ostringstream ss;
    ss << file.rdbuf();

    auto resp = drogon::HttpResponse::newHttpResponse();
    resp->setBody(ss.str());
    resp->setContentTypeCode(drogon::CT_TEXT_PLAIN);
    resp->addHeader("Content-Type", "text/yaml; charset=utf-8");
    callback(resp);
}

} // namespace pyracms
