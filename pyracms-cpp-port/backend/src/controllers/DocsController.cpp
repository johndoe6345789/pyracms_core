#include "controllers/DocsController.h"

#include <fstream>
#include <sstream>

namespace pyracms {

void DocsController::swaggerUi(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    std::string html = R"(<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PyraCMS API Documentation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/openapi.yaml',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: 'BaseLayout'
    });
  </script>
</body>
</html>)";

    auto resp = drogon::HttpResponse::newHttpResponse();
    resp->setBody(html);
    resp->setContentTypeCode(drogon::CT_TEXT_HTML);
    callback(resp);
}

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
