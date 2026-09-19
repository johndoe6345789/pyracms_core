#include "controllers/FileBlob.h"
#include "controllers/FileEtag.h"
#include "controllers/FileRange.h"
#include "controllers/FileRules.h"

#include <filesystem>

namespace pyracms {

using drogon::HttpResponse;

static size_t blobSize(const BlobPayload &p) {
    if (p.path.empty())
        return p.data.size();
    std::error_code ec;
    auto n = std::filesystem::file_size(p.path, ec);
    return ec ? 0 : static_cast<size_t>(n);
}

static drogon::HttpResponsePtr partial(const BlobPayload &p,
                                       const FileDto &file, bool attachment,
                                       const ByteRange &r, size_t size) {
    auto name = attachment ? safeFilename(file.filename) : std::string();
    drogon::HttpResponsePtr resp;
    if (!p.path.empty()) {
        resp = HttpResponse::newFileResponse(p.path, r.start, r.length,
                                             true, name);
    } else {
        resp = HttpResponse::newHttpResponse();
        resp->setBody(p.data.substr(r.start, r.length));
        resp->setStatusCode(drogon::k206PartialContent);
        resp->addHeader("Content-Range",
                        "bytes " + std::to_string(r.start) + "-" +
                            std::to_string(r.start + r.length - 1) + "/" +
                            std::to_string(size));
        if (attachment)
            resp->addHeader("Content-Disposition",
                            "attachment; filename=\"" + name + "\"");
    }
    resp->setContentTypeString(servedMime(file.mimetype));
    return resp;
}

// Full or partial body plus the validators a resuming client needs.
drogon::HttpResponsePtr serveBlob(const drogon::HttpRequestPtr &req,
                                  const BlobPayload &p, const FileDto &file,
                                  bool attachment, bool thumb) {
    size_t size = blobSize(p);
    auto etag = fileEtag(file.sha256, file.id, size, thumb);
    drogon::HttpResponsePtr resp;
    if (etagMatches(req->getHeader("if-none-match"), etag)) {
        resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(drogon::k304NotModified);
    } else {
        auto ifRange = req->getHeader("if-range");
        ByteRange r;
        if (ifRange.empty() || etagMatches(ifRange, etag))
            r = parseRange(req->getHeader("range"), size);
        if (r.kind == RangeKind::Unsatisfiable) {
            resp = HttpResponse::newHttpResponse();
            resp->setStatusCode(drogon::k416RequestedRangeNotSatisfiable);
            resp->addHeader("Content-Range",
                            "bytes */" + std::to_string(size));
        } else if (r.kind == RangeKind::Partial && r.length < size) {
            resp = partial(p, file, attachment, r, size);
        } else {
            resp = blobResponse(p, file, attachment);
        }
    }
    resp->addHeader("Accept-Ranges", "bytes");
    resp->addHeader("ETag", etag);
    return resp;
}

} // namespace pyracms
