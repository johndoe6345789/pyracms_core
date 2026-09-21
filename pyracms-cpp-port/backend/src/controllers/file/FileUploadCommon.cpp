#include "controllers/FileUploadCommon.h"
#include "filters/TenantGuard.h"
#include "security/Validate.h"
#include "storage/BlobRegistry.h"

namespace pyracms {

drogon::HttpResponsePtr uploadError(const std::string &msg, int status) {
    return filterError(msg, static_cast<drogon::HttpStatusCode>(status));
}

void withOwnedUpload(FileUploadService &svc,
                     const drogon::HttpRequestPtr &req,
                     const std::string &uploadId, const UploadReply &cb,
                     std::function<void(const UploadRow &)> ok) {
    if (!isValidUuid(uploadId))
        return cb(uploadError("Upload not found", 404));
    int user = req->attributes()->get<int>("userId");
    int tenant = tokenTenantOf(req);
    svc.find(drogon::app().getDbClient(), uploadId,
             [=](const std::optional<UploadRow> &u) {
                 if (!u || u->userId != user || u->tenantId != tenant)
                     return cb(uploadError("Upload not found", 404));
                 ok(*u);
             });
}

void dropUpload(FileUploadService &svc, const UploadRow &u,
                std::function<void()> done) {
    auto forget = [&svc, id = u.id, done]() {
        svc.remove(drogon::app().getDbClient(), id,
                   [done](bool) { done(); });
    };
    auto store = BlobRegistry::named("s3");
    if (!store)
        return forget();
    store->abortMultipart(uploadKey(u), u.s3Id,
                          [forget](BlobStatus) { forget(); });
}

} // namespace pyracms
