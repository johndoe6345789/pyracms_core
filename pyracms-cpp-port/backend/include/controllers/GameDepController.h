#pragma once

#include "services/GameDepService.h"
#include <drogon/HttpController.h>

namespace pyracms {

using HttpReq = const drogon::HttpRequestPtr &;
using HttpCb2 = std::function<void(const drogon::HttpResponsePtr &)> &&;
using Str = const std::string &;

// Pages, catalog and lookup data.
class GameDepController : public drogon::HttpController<GameDepController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(GameDepController::listPages, "/api/gamedep/{type}",
                  drogon::Get);
    ADD_METHOD_TO(GameDepController::createPage, "/api/gamedep/{type}",
                  drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepController::getPage, "/api/gamedep/{type}/{name}",
                  drogon::Get);
    ADD_METHOD_TO(GameDepController::updatePage,
                  "/api/gamedep/{type}/{name}", drogon::Put,
                  "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepController::deletePage,
                  "/api/gamedep/{type}/{name}", drogon::Delete,
                  "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepController::getFullCatalog, "/api/outputs/json",
                  drogon::Get);
    ADD_METHOD_TO(GameDepController::listOperatingSystems,
                  "/api/operating-systems", drogon::Get);
    ADD_METHOD_TO(GameDepController::listArchitectures,
                  "/api/architectures", drogon::Get);
    METHOD_LIST_END

    void listPages(HttpReq req, HttpCb2 cb, Str type);
    void createPage(HttpReq req, HttpCb2 cb, Str type);
    void getPage(HttpReq req, HttpCb2 cb, Str type, Str name);
    void updatePage(HttpReq req, HttpCb2 cb, Str type, Str name);
    void deletePage(HttpReq req, HttpCb2 cb, Str type, Str name);
    // GET /api/gamedep/catalog (also /api/outputs/json).
    void getFullCatalog(HttpReq req, HttpCb2 cb);
    void listOperatingSystems(HttpReq req, HttpCb2 cb);
    void listArchitectures(HttpReq req, HttpCb2 cb);

private:
    GameDepService reads_;
    GameDepWriteService writes_;
};

} // namespace pyracms
