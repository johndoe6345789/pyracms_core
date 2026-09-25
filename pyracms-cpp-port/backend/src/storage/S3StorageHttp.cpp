#include "storage/S3Sign.h"
#include "storage/S3Storage.h"

namespace pyracms {

S3Storage::S3Storage(StorageConfig cfg)
    : cfg_(std::move(cfg)), ep_(parseS3Endpoint(cfg_.endpoint)) {}

std::string S3Storage::objectPath(const BlobKey &k) const {
    // Flat keys: the object store routes /{bucket}/{key} with one path
    // segment, so a "tenants/<id>/" prefix would 404.
    return "/" + cfg_.bucket + "/tenant-" + std::to_string(k.tenant) +
           (k.thumb ? "-thumb-" : "-") + k.id;
}

std::string S3Storage::presignedUrl(const BlobKey &k, int expiresS) const {
    auto pub = parseS3Endpoint(cfg_.publicEndpoint);
    if (!cfg_.presignedDownloads || !pub.valid || !blobIdValid(k.id))
        return "";
    return s3PresignedGetUrl(cfg_, pub, objectPath(k), expiresS,
                             sigv4UtcNow());
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
                     std::string body, ReplyCb cb, double timeout) {
    auto req = drogon::HttpRequest::newHttpRequest();
    req->setMethod(m);
    req->setPath(ep_.prefix + path);
    static const char *names[] = {"GET", "POST", "PUT", "DELETE", "HEAD"};
    static const drogon::HttpMethod verbs[] = {
        drogon::Get, drogon::Post, drogon::Put, drogon::Delete, drogon::Head};
    std::string verb = "GET";
    for (size_t i = 0; i < 5; ++i)
        if (verbs[i] == m)
            verb = names[i];
    for (auto &h : s3SignedHeaders(cfg_, ep_, verb, ep_.prefix + path, body))
        req->addHeader(h.first, h.second);
    if (path.find('?') != std::string::npos)
        req->setPathEncode(false); // the query is already well-formed
    if (m == drogon::Put || m == drogon::Post) {
        req->setContentTypeCode(drogon::CT_APPLICATION_OCTET_STREAM);
        req->setBody(std::move(body));
    }
    auto conn = client();
    conn->sendRequest(
        req,
        [this, conn, cb](drogon::ReqResult r,
                         const drogon::HttpResponsePtr &resp) {
            if (r != drogon::ReqResult::Ok) {
                LOG_WARN << "object store request failed: "
                         << drogon::to_string_view(r);
                dropClient(conn);
            }
            cb(classify(r, resp), resp);
        },
        timeout > 0 ? timeout : cfg_.timeoutS);
}

} // namespace pyracms
