#include "http_harness.h"

#include <fstream>

namespace harness {

static const int kPort = 3299;

Server::Server() {
    auto &app = drogon::app();
    app.addListener("127.0.0.1", kPort)
        .setThreadNum(2)
        .setLogLevel(trantor::Logger::kError);
    app.createDbClient("postgresql", dbEnv("TEST_DB_HOST", ""),
                       std::stoi(dbEnv("TEST_DB_PORT", "5432")),
                       dbEnv("TEST_DB_NAME", "pyracms_test"),
                       dbEnv("TEST_DB_USER", "pyracms"),
                       dbEnv("TEST_DB_PASSWORD", "pyracms"), 2, "",
                       "default", false, "utf8");
    thread_ = std::thread([] { drogon::app().run(); });
    while (!drogon::app().isRunning())
        usleep(10000);
    usleep(200000);
    loop_.run();
    client = drogon::HttpClient::newHttpClient(
        "http://127.0.0.1:" + std::to_string(kPort), loop_.getLoop());
}

Server::~Server() {
    drogon::app().quit();
    thread_.join();
}

Server &server() {
    static Server s;
    return s;
}

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
