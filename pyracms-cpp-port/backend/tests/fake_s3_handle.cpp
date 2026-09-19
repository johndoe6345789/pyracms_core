#include "fake_s3.h"
#include "fake_s3_state.h"

namespace harness::fake {

std::mutex mu;
std::set<std::string> buckets;
std::map<std::string, std::string> objects;
int created = 0;
int failStatus = 0;

static drogon::HttpResponsePtr reply(drogon::HttpStatusCode code,
                                     const std::string &body = "") {
    auto r = drogon::HttpResponse::newHttpResponse();
    r->setStatusCode(code);
    r->setBody(body);
    return r;
}

static drogon::HttpResponsePtr authAndFaults(const drogon::HttpRequestPtr &r) {
    if (failStatus) {
        auto code = static_cast<drogon::HttpStatusCode>(failStatus);
        failStatus = 0;
        return reply(code, "boom secret-internal-detail");
    }
    if (r->getHeader("Authorization") !=
        std::string("AWS ") + kFakeS3Access + ":" + kFakeS3Secret)
        return reply(drogon::k403Forbidden, "AccessDenied");
    return nullptr;
}

// Locked: path is /fakes3/<bucket>[/<key>].
drogon::HttpResponsePtr handle(const drogon::HttpRequestPtr &req) {
    auto full = req->path().substr(std::string(kFakeS3Prefix).size() + 1);
    std::lock_guard<std::mutex> lock(mu);
    if (auto denied = authAndFaults(req))
        return denied;
    auto slash = full.find('/');
    auto bucket = full.substr(0, slash);
    auto m = req->method();
    if (m == drogon::Put && slash == std::string::npos) {
        if (!buckets.insert(bucket).second)
            return reply(drogon::k409Conflict);
        ++created;
        return reply(drogon::k200OK);
    }
    if (!buckets.count(bucket))
        return reply(drogon::k404NotFound, "NoSuchBucket");
    if (m == drogon::Put) {
        objects[full] = std::string(req->body());
        return reply(drogon::k200OK);
    }
    if (m == drogon::Delete) {
        objects.erase(full);
        return reply(drogon::k204NoContent);
    }
    auto it = objects.find(full);
    if (it == objects.end())
        return reply(drogon::k404NotFound, "NoSuchKey");
    return reply(drogon::k200OK, m == drogon::Get ? it->second : "");
}

} // namespace harness::fake
