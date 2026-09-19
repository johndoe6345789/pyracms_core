#include "controllers/DocsController.h"

#include <fstream>
#include <sstream>

namespace pyracms {

void DocsController::swaggerUi(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

#define CDN "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/"
    std::string html = R"(<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PyraCMS API Documentation</title>
  <link rel="stylesheet" href=")" CDN R"(swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src=")" CDN R"(swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/openapi.yaml',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: 'BaseLayout'
    });
  </script>
</body>
</html>)";
#undef CDN

    auto resp = drogon::HttpResponse::newHttpResponse();
    resp->setBody(html);
    resp->setContentTypeCode(drogon::CT_TEXT_HTML);
    callback(resp);
}

} // namespace pyracms
