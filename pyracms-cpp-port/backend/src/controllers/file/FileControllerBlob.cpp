#include "controllers/FileBlob.h"
#include "controllers/FileRules.h"
#include "filters/TenantGuard.h"

#include <filesystem>

namespace pyracms {

void loadBlob(const BlobStorePtr &store, const BlobKey &key, BlobLoadCb cb) {
    if (auto p = store->path(key)) {
        std::error_code ec;
        bool there = !p->empty() && std::filesystem::exists(*p, ec);
        return cb(there ? BlobStatus::Ok : BlobStatus::NotFound,
                  BlobPayload{*p, ""});
    }
    store->get(key, [cb](BlobStatus s, std::string data) {
        cb(s, BlobPayload{"", std::move(data)});
    });
}

drogon::HttpResponsePtr blobResponse(const BlobPayload &p,
                                     const FileDto &file, bool attachment) {
    auto name = attachment ? safeFilename(file.filename) : std::string();
    drogon::HttpResponsePtr resp;
    if (!p.path.empty()) {
        resp = drogon::HttpResponse::newFileResponse(p.path, name);
    } else {
        resp = drogon::HttpResponse::newHttpResponse();
        resp->setBody(p.data);
        if (attachment)
            resp->addHeader("Content-Disposition",
                            "attachment; filename=\"" + name + "\"");
    }
    resp->addHeader("Content-Type", servedMime(file.mimetype));
    return resp;
}

drogon::HttpResponsePtr blobFailure(BlobStatus s) {
    return filterError(blobMessage(s),
                       static_cast<drogon::HttpStatusCode>(blobHttpStatus(s)));
}

} // namespace pyracms
