#include "http_harness.h"

#include <algorithm>
#include <filesystem>
#include <fstream>

namespace harness {

Reply call(drogon::HttpMethod m, const std::string &path,
           const Json::Value &body, const std::string &token,
           const Hdrs &extra) {
    auto req = drogon::HttpRequest::newHttpRequest();
    req->setMethod(m);
    req->setPath(path);
    if (!body.isNull()) {
        req->setContentTypeCode(drogon::CT_APPLICATION_JSON);
        req->setBody(Json::FastWriter().write(body));
    }
    if (!token.empty())
        req->addHeader("Authorization", "Bearer " + token);
    for (const auto &h : extra)
        req->addHeader(h.first, h.second);
    auto res = server().client->sendRequest(req, 15);
    Reply r;
    if (res.first != drogon::ReqResult::Ok)
        return r;
    r.status = res.second->statusCode();
    r.text = std::string(res.second->body());
    for (const auto &h : res.second->headers())
        r.headers[h.first] = h.second;
    Json::Reader().parse(r.text, r.json);
    return r;
}

Reply get(const std::string &p, const std::string &t, const Hdrs &x) {
    return call(drogon::Get, p, Json::Value(), t, x);
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
    std::string leaf = filename; // the client-side name may hold '/'
    std::replace(leaf.begin(), leaf.end(), '/', '_');
    // Binary, in the platform temp dir: Windows text mode rewrites line
    // endings and would corrupt the bytes under test.
    auto tmp = (std::filesystem::temp_directory_path() /
                (uniq("up") + "_" + leaf)).string();
    std::ofstream(tmp, std::ios::binary) << content;
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
