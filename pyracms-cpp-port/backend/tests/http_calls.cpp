#include "http_harness.h"

#include <fstream>

namespace harness {

Reply call(drogon::HttpMethod m, const std::string &path,
           const Json::Value &body, const std::string &token) {
    auto req = drogon::HttpRequest::newHttpRequest();
    req->setMethod(m);
    req->setPath(path);
    if (!body.isNull()) {
        req->setContentTypeCode(drogon::CT_APPLICATION_JSON);
        req->setBody(Json::FastWriter().write(body));
    }
    if (!token.empty())
        req->addHeader("Authorization", "Bearer " + token);
    auto res = server().client->sendRequest(req, 15);
    Reply r;
    if (res.first != drogon::ReqResult::Ok)
        return r;
    r.status = res.second->statusCode();
    r.text = std::string(res.second->body());
    Json::Reader().parse(r.text, r.json);
    return r;
}

Reply get(const std::string &p, const std::string &t) {
    return call(drogon::Get, p, Json::Value(), t);
}
Reply post(const std::string &p, const Json::Value &b,
           const std::string &t) {
    return call(drogon::Post, p, b, t);
}
Reply put(const std::string &p, const Json::Value &b,
          const std::string &t) {
    return call(drogon::Put, p, b, t);
}
Reply del(const std::string &p, const std::string &t,
          const Json::Value &b) {
    return call(drogon::Delete, p, b, t);
}

Reply upload(const std::string &path, const std::string &token,
             const std::string &filename, const std::string &content) {
    auto tmp = "/tmp/" + uniq("up") + "_" + filename;
    std::ofstream(tmp) << content;
    drogon::UploadFile f(tmp, filename, "file");
    auto req = drogon::HttpRequest::newFileUploadRequest({f});
    req->setPath(path);
    req->addHeader("Authorization", "Bearer " + token);
    auto res = server().client->sendRequest(req, 15);
    std::remove(tmp.c_str());
    Reply r;
    if (res.first != drogon::ReqResult::Ok)
        return r;
    r.status = res.second->statusCode();
    r.text = std::string(res.second->body());
    Json::Reader().parse(r.text, r.json);
    return r;
}

} // namespace harness
