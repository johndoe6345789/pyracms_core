#include "services/elasticsearch/EsHttp.h"

#include <sstream>

namespace pyracms {

std::string esWrite(const Json::Value &v) {
    Json::StreamWriterBuilder w;
    w["indentation"] = "";
    return Json::writeString(w, v);
}

void esRequest(const std::string &baseUrl, drogon::HttpMethod method,
               const std::string &path, const std::string &body,
               double timeoutS, EsReplyCb cb, bool ndjson) {
    auto client = drogon::HttpClient::newHttpClient(baseUrl);
    auto req = drogon::HttpRequest::newHttpRequest();
    req->setMethod(method);
    req->setPath(path);
    if (!body.empty()) {
        req->setBody(body);
        req->setContentTypeString(ndjson ? "application/x-ndjson"
                                         : "application/json");
    }
    client->sendRequest(
        req,
        [client, cb](drogon::ReqResult r, const drogon::HttpResponsePtr &resp) {
            EsReply out;
            if (r == drogon::ReqResult::Ok && resp) {
                out.ok = true;
                out.status = static_cast<int>(resp->statusCode());
                Json::CharReaderBuilder rb;
                std::istringstream in(std::string(resp->body()));
                std::string err;
                if (!Json::parseFromStream(rb, in, &out.json, &err))
                    out.json = Json::Value();
            }
            cb(out);
        },
        timeoutS);
}

} // namespace pyracms
