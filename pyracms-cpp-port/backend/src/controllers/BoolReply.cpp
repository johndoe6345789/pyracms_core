#include "controllers/BoolReply.h"

namespace pyracms {

BoolCb boolReply(HttpCb callback) {
    return [callback](bool success, const std::string &error) {
        Json::Value body;
        if (success) {
            body["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(body));
            return;
        }
        body["error"] = error;
        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
        resp->setStatusCode(error == "Not found" ? drogon::k404NotFound
                                                 : drogon::k400BadRequest);
        callback(resp);
    };
}

} // namespace pyracms
