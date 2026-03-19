#pragma once

#include <drogon/HttpController.h>
#include "services/GameDepService.h"

namespace pyracms {

class GameDepController : public drogon::HttpController<GameDepController> {
public:
    METHOD_LIST_BEGIN
    // Page CRUD
    ADD_METHOD_TO(GameDepController::listPages, "/api/gamedep/{type}", drogon::Get);
    ADD_METHOD_TO(GameDepController::createPage, "/api/gamedep/{type}", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepController::getPage, "/api/gamedep/{type}/{name}", drogon::Get);
    ADD_METHOD_TO(GameDepController::updatePage, "/api/gamedep/{type}/{name}", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepController::deletePage, "/api/gamedep/{type}/{name}", drogon::Delete, "pyracms::JwtAuthFilter");

    // Revisions
    ADD_METHOD_TO(GameDepController::createRevision, "/api/gamedep/{type}/{name}/revisions", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepController::updateRevision, "/api/gamedep/{type}/{name}/revisions/{ver}", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepController::deleteRevision, "/api/gamedep/{type}/{name}/revisions/{ver}", drogon::Delete, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepController::togglePublish, "/api/gamedep/{type}/{name}/revisions/{ver}/publish", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepController::uploadSource, "/api/gamedep/{type}/{name}/revisions/{ver}/source", drogon::Post, "pyracms::JwtAuthFilter");

    // Binaries
    ADD_METHOD_TO(GameDepController::addBinary, "/api/gamedep/{type}/{name}/revisions/{ver}/binaries", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepController::deleteBinary, "/api/gamedep/{type}/{name}/revisions/{ver}/binaries/{id}", drogon::Delete, "pyracms::JwtAuthFilter");

    // Dependencies
    ADD_METHOD_TO(GameDepController::addDependency, "/api/gamedep/{type}/{name}/dependencies", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepController::removeDependency, "/api/gamedep/{type}/{name}/dependencies/{id}", drogon::Delete, "pyracms::JwtAuthFilter");

    // Tags
    ADD_METHOD_TO(GameDepController::setTags, "/api/gamedep/{type}/{name}/tags", drogon::Put, "pyracms::JwtAuthFilter");

    // Voting
    ADD_METHOD_TO(GameDepController::vote, "/api/gamedep/{type}/{name}/vote", drogon::Post, "pyracms::JwtAuthFilter");

    // Catalog export
    ADD_METHOD_TO(GameDepController::getFullCatalog, "/api/outputs/json", drogon::Get);

    // Reference data
    ADD_METHOD_TO(GameDepController::listOperatingSystems, "/api/operating-systems", drogon::Get);
    ADD_METHOD_TO(GameDepController::listArchitectures, "/api/architectures", drogon::Get);
    METHOD_LIST_END

    // Page handlers
    void listPages(const drogon::HttpRequestPtr &req,
                   std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                   const std::string &type);

    void createPage(const drogon::HttpRequestPtr &req,
                    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                    const std::string &type);

    void getPage(const drogon::HttpRequestPtr &req,
                 std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                 const std::string &type,
                 const std::string &name);

    void updatePage(const drogon::HttpRequestPtr &req,
                    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                    const std::string &type,
                    const std::string &name);

    void deletePage(const drogon::HttpRequestPtr &req,
                    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                    const std::string &type,
                    const std::string &name);

    // Revision handlers
    void createRevision(const drogon::HttpRequestPtr &req,
                        std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                        const std::string &type,
                        const std::string &name);

    void updateRevision(const drogon::HttpRequestPtr &req,
                        std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                        const std::string &type,
                        const std::string &name,
                        const std::string &ver);

    void deleteRevision(const drogon::HttpRequestPtr &req,
                        std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                        const std::string &type,
                        const std::string &name,
                        const std::string &ver);

    void togglePublish(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                       const std::string &type,
                       const std::string &name,
                       const std::string &ver);

    void uploadSource(const drogon::HttpRequestPtr &req,
                      std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                      const std::string &type,
                      const std::string &name,
                      const std::string &ver);

    // Binary handlers
    void addBinary(const drogon::HttpRequestPtr &req,
                   std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                   const std::string &type,
                   const std::string &name,
                   const std::string &ver);

    void deleteBinary(const drogon::HttpRequestPtr &req,
                      std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                      const std::string &type,
                      const std::string &name,
                      const std::string &ver,
                      int id);

    // Dependency handlers
    void addDependency(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                       const std::string &type,
                       const std::string &name);

    void removeDependency(const drogon::HttpRequestPtr &req,
                          std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                          const std::string &type,
                          const std::string &name,
                          int id);

    // Tags
    void setTags(const drogon::HttpRequestPtr &req,
                 std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                 const std::string &type,
                 const std::string &name);

    // Voting
    void vote(const drogon::HttpRequestPtr &req,
              std::function<void(const drogon::HttpResponsePtr &)> &&callback,
              const std::string &type,
              const std::string &name);

    // Catalog
    void getFullCatalog(const drogon::HttpRequestPtr &req,
                        std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    // Reference data
    void listOperatingSystems(const drogon::HttpRequestPtr &req,
                              std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void listArchitectures(const drogon::HttpRequestPtr &req,
                           std::function<void(const drogon::HttpResponsePtr &)> &&callback);

private:
    GameDepService gameDepService_;
};

} // namespace pyracms
