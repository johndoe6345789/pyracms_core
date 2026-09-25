#pragma once

#include "controllers/HttpAliases.h"
#include "services/CodeSnippetService.h"
#include "services/DockerExecutionService.h"

#include <drogon/HttpController.h>

namespace pyracms {

class CodeSnippetController
    : public drogon::HttpController<CodeSnippetController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(CodeSnippetController::listSnippets, "/api/snippets",
                  drogon::Get);
    ADD_METHOD_TO(CodeSnippetController::createSnippet, "/api/snippets",
                  drogon::Post, PYR_JWT);
    ADD_METHOD_TO(CodeSnippetController::getSnippet, "/api/snippets/{id}",
                  drogon::Get);
    ADD_METHOD_TO(CodeSnippetController::updateSnippet, "/api/snippets/{id}",
                  drogon::Put, PYR_JWT);
    ADD_METHOD_TO(CodeSnippetController::deleteSnippet, "/api/snippets/{id}",
                  drogon::Delete, PYR_JWT);
    ADD_METHOD_TO(CodeSnippetController::runSnippet, "/api/snippets/{id}/run",
                  drogon::Post, PYR_JWT, PYR_RATE);
    ADD_METHOD_TO(CodeSnippetController::forkSnippet,
                  "/api/snippets/{id}/fork", drogon::Post, PYR_JWT);
    ADD_METHOD_TO(CodeSnippetController::addAttachment,
                  "/api/snippets/{id}/attachments", drogon::Post, PYR_JWT);
    ADD_METHOD_TO(CodeSnippetController::removeAttachment,
                  "/api/snippets/{id}/attachments/{attachmentId}",
                  drogon::Delete, PYR_JWT);
    ADD_METHOD_TO(CodeSnippetController::listRevisions,
                  "/api/snippets/{id}/revisions", drogon::Get);
    ADD_METHOD_TO(CodeSnippetController::getRevision,
                  "/api/snippets/{id}/revisions/{number}", drogon::Get);
    ADD_METHOD_TO(CodeSnippetController::revertToRevision,
                  "/api/snippets/{id}/revert/{number}", drogon::Post, PYR_JWT);
    METHOD_LIST_END

    void listSnippets(HttpReq req, HttpCbRef callback);
    void createSnippet(HttpReq req, HttpCbRef callback);
    void getSnippet(HttpReq req, HttpCbRef callback, HttpStr id);
    void updateSnippet(HttpReq req, HttpCbRef callback, HttpStr id);
    void deleteSnippet(HttpReq req, HttpCbRef callback, HttpStr id);
    void runSnippet(HttpReq req, HttpCbRef callback, HttpStr id);
    void forkSnippet(HttpReq req, HttpCbRef callback, HttpStr id);
    void addAttachment(HttpReq req, HttpCbRef callback, HttpStr id);
    void removeAttachment(HttpReq req, HttpCbRef callback, HttpStr id,
                          HttpStr attachmentId);

    void listRevisions(HttpReq req, HttpCbRef callback, HttpStr id);
    void getRevision(HttpReq req, HttpCbRef callback, HttpStr id,
                     HttpStr number);
    void revertToRevision(HttpReq req, HttpCbRef callback, HttpStr id,
                          HttpStr number);

  private:
    CodeSnippetService snippetService_;
    DockerExecutionService dockerService_;
};

} // namespace pyracms
