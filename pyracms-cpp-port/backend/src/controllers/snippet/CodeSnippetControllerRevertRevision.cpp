#include "controllers/CodeSnippetController.h"

namespace pyracms {

void CodeSnippetController::revertToRevision(HttpReq req, HttpCbRef callback,
                                             HttpStr id, HttpStr number) {
    int snippetId = std::stoi(id);
    int n = std::stoi(number);
    int userId = req->attributes()->get<int>("userId");
    snippetService_.revertToRevision(
        drogon::app().getDbClient(), snippetId, n, userId,
        [callback](bool success, const std::string &error) {
            Json::Value result;
            result[success ? "message" : "error"] =
                success ? "Snippet reverted" : error;
            auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
            if (!success)
                resp->setStatusCode(drogon::k404NotFound);
            callback(resp);
        });
}

} // namespace pyracms
