#pragma once

#include <drogon/HttpController.h>
#include "services/CodeSnippetService.h"
#include "services/DockerExecutionService.h"

namespace pyracms {

class CodeSnippetController : public drogon::HttpController<CodeSnippetController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(CodeSnippetController::listSnippets, "/api/snippets", drogon::Get);
    ADD_METHOD_TO(CodeSnippetController::createSnippet, "/api/snippets", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(CodeSnippetController::getSnippet, "/api/snippets/{id}", drogon::Get);
    ADD_METHOD_TO(CodeSnippetController::updateSnippet, "/api/snippets/{id}", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(CodeSnippetController::deleteSnippet, "/api/snippets/{id}", drogon::Delete, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(CodeSnippetController::runSnippet, "/api/snippets/{id}/run", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(CodeSnippetController::forkSnippet, "/api/snippets/{id}/fork", drogon::Post, "pyracms::JwtAuthFilter");
    METHOD_LIST_END

    void listSnippets(const drogon::HttpRequestPtr &req,
                      std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void createSnippet(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void getSnippet(const drogon::HttpRequestPtr &req,
                    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                    const std::string &id);

    void updateSnippet(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                       const std::string &id);

    void deleteSnippet(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                       const std::string &id);

    void runSnippet(const drogon::HttpRequestPtr &req,
                    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                    const std::string &id);

    void forkSnippet(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                     const std::string &id);

private:
    CodeSnippetService snippetService_;
    DockerExecutionService dockerService_;
};

} // namespace pyracms
