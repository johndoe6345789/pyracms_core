#include "fake_s3_state.h"
#include "services/upload/UploadHash.h"

namespace harness::fake {

static drogon::HttpResponsePtr answer(drogon::HttpStatusCode code,
                                      const std::string &body = "") {
    auto r = drogon::HttpResponse::newHttpResponse();
    r->setStatusCode(code);
    r->setBody(body);
    return r;
}

// The multipart dialect of the object store (locked by the caller):
// ?uploads, ?partNumber=N&uploadId=ID, ?uploadId=ID. nullptr = not one.
drogon::HttpResponsePtr multipart(const drogon::HttpRequestPtr &req,
                                  const std::string &full) {
    static int seq = 0;
    auto &q = req->getParameters();
    auto m = req->method();
    if (m == drogon::Post && q.count("uploads")) {
        auto id = "up-" + std::to_string(++seq);
        uploads[id] = {full, {}};
        return answer(drogon::k200OK,
                      "<InitiateMultipartUploadResult><UploadId>" + id +
                          "</UploadId></InitiateMultipartUploadResult>");
    }
    auto up = q.find("uploadId");
    if (up == q.end())
        return nullptr;
    auto it = uploads.find(up->second);
    if (it == uploads.end())
        return answer(drogon::k404NotFound, "NoSuchUpload");
    if (m == drogon::Put) {
        std::string body(req->body());
        it->second.second[std::stoi(q.at("partNumber"))] = body;
        auto r = answer(drogon::k200OK);
        r->addHeader("ETag", "\"" + pyracms::md5Hex(body) + "\"");
        return r;
    }
    if (m == drogon::Delete) {
        uploads.erase(it);
        return answer(drogon::k204NoContent);
    }
    std::string all;
    for (auto &p : it->second.second)
        all += p.second;
    objects[it->second.first] = all;
    uploads.erase(it);
    return answer(drogon::k200OK, "<CompleteMultipartUploadResult/>");
}

} // namespace harness::fake
