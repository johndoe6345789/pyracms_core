#include "controllers/FileBlob.h"
#include "controllers/FileRules.h"
#include "filters/TenantGuard.h"
#include "filters/Viewer.h"
#include "services/gamedep/GdFileAccess.h"

#include <filesystem>

namespace pyracms {

// Game/dep content follows the page's visibility (public: anyone,
// private/draft: managers only, else 404 - never a hint it exists);
// every other file keeps the uuid-capability rules.
void withFileAccess(const drogon::HttpRequestPtr &req,
                    const drogon::orm::DbClientPtr &db,
                    const std::string &uuid,
                    const std::function<void(const drogon::HttpResponsePtr &)>
                        &callback,
                    std::function<void()> allowed) {
    auto v = viewerOf(req);
    gdFileAccess(db, uuid, v.userId, v.tenantId,
                 [callback, allowed](GdFileAccess a) {
                     if (a == GdFileAccess::Denied)
                         return callback(filterError(
                             "File not found", drogon::k404NotFound));
                     allowed();
                 });
}

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
    resp->setContentTypeString(servedMime(file.mimetype));
    return resp;
}

drogon::HttpResponsePtr blobFailure(BlobStatus s) {
    return filterError(blobMessage(s),
                       static_cast<drogon::HttpStatusCode>(blobHttpStatus(s)));
}

} // namespace pyracms
