#include "controllers/FileBlob.h"
#include "controllers/FileEtag.h"
#include "controllers/FileRange.h"
#include "controllers/FileRules.h"
#include "controllers/UploadLimits.h"

namespace pyracms {

using drogon::HttpResponse;

bool wantsStream(const FileDto &file, const BlobStorePtr &store) {
    return store->canStream() &&
           static_cast<size_t>(file.size) >= streamMinBytes();
}

static drogon::HttpResponsePtr plain(drogon::HttpStatusCode code,
                                     const std::string &etag) {
    auto resp = HttpResponse::newHttpResponse();
    resp->setStatusCode(code);
    resp->addHeader("Accept-Ranges", "bytes");
    resp->addHeader("ETag", etag);
    return resp;
}

// Same answers as serveBlob (304 / 416 / 206 / 200, ETag, Accept-Ranges)
// but the body is piped from the store as it arrives.
void streamBlob(const drogon::HttpRequestPtr &req, const BlobStorePtr &store,
                const FileDto &file, StreamReply cb) {
    size_t size = static_cast<size_t>(file.size);
    auto etag = fileEtag(file.sha256, file.id, size, false);
    if (etagMatches(req->getHeader("if-none-match"), etag))
        return cb(plain(drogon::k304NotModified, etag));
    ByteRange r;
    auto ifRange = req->getHeader("if-range");
    if (ifRange.empty() || etagMatches(ifRange, etag))
        r = parseRange(req->getHeader("range"), size);
    if (r.kind == RangeKind::Unsatisfiable) {
        auto resp = plain(drogon::k416RequestedRangeNotSatisfiable, etag);
        resp->addHeader("Content-Range", "bytes */" + std::to_string(size));
        return cb(resp);
    }
    bool part = r.kind == RangeKind::Partial && r.length < size;
    size_t start = part ? r.start : 0, len = part ? r.length : size;
    store->stream(
        {file.tenantId, file.uuid, false}, start, len,
        [=](BlobStatus s, std::shared_ptr<BlobStream> body) {
            if (s != BlobStatus::Ok)
                return cb(blobFailure(s));
            auto resp = HttpResponse::newStreamResponse(
                [body](char *buf, size_t n) -> size_t {
                    if (!buf)
                        return body->close(), 0;
                    return body->read(buf, n);
                },
                safeFilename(file.filename));
            resp->setContentTypeString(servedMime(file.mimetype));
            resp->addHeader("Content-Length", std::to_string(len));
            resp->addHeader("Accept-Ranges", "bytes");
            resp->addHeader("ETag", etag);
            if (part) {
                resp->setStatusCode(drogon::k206PartialContent);
                resp->addHeader(
                    "Content-Range",
                    "bytes " + std::to_string(start) + "-" +
                        std::to_string(start + len - 1) + "/" +
                        std::to_string(size));
            }
            cb(resp);
        });
}

} // namespace pyracms
