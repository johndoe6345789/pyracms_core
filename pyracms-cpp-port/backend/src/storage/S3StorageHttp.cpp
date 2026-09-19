#include "storage/S3Storage.h"

namespace pyracms {

S3Storage::S3Storage(StorageConfig cfg)
    : cfg_(std::move(cfg)), ep_(parseS3Endpoint(cfg_.endpoint)) {}

std::string S3Storage::objectPath(const BlobKey &k) const {
    return "/" + cfg_.bucket + "/tenants/" + std::to_string(k.tenant) +
           (k.thumb ? "/thumbnails/" : "/") + k.id;
}

drogon::HttpClientPtr S3Storage::client() {
    std::lock_guard<std::mutex> lock(mu_);
    if (!client_)
        client_ = drogon::HttpClient::newHttpClient(ep_.origin);
    return client_;
}

// Transport problems are "unavailable"; anything the store answers with an
// unexpected status is a backend error. Detail is logged, never returned.
static BlobStatus classify(drogon::ReqResult r,
                           const drogon::HttpResponsePtr &resp) {
    if (r == drogon::ReqResult::BadResponse)
        return BlobStatus::Failed;
    if (r != drogon::ReqResult::Ok || !resp)
        return BlobStatus::Unavailable;
    int code = resp->statusCode();
    if (code >= 200 && code < 300)
        return BlobStatus::Ok;
    if (code == 404)
        return BlobStatus::NotFound;
    LOG_WARN << "object store answered HTTP " << code;
    return BlobStatus::Failed;
}

void S3Storage::send(drogon::HttpMethod m, const std::string &path,
                     std::string body, ReplyCb cb) {
    auto req = drogon::HttpRequest::newHttpRequest();
    req->setMethod(m);
    req->setPath(ep_.prefix + path);
    req->addHeader("Authorization",
                   "AWS " + cfg_.accessKey + ":" + cfg_.secretKey);
    if (m == drogon::Put) {
        req->setContentTypeCode(drogon::CT_APPLICATION_OCTET_STREAM);
        req->setBody(std::move(body));
    }
    client()->sendRequest(
        req,
        [cb](drogon::ReqResult r, const drogon::HttpResponsePtr &resp) {
            if (r != drogon::ReqResult::Ok)
                LOG_WARN << "object store request failed: "
                         << drogon::to_string_view(r);
            cb(classify(r, resp), resp);
        },
        cfg_.timeoutS);
}

} // namespace pyracms
