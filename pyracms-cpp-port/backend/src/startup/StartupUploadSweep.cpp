#include "controllers/FileUploadCommon.h"
#include "startup/Startup.h"

namespace pyracms {

// Chunked uploads not finished within 24 h are aborted in the store and
// forgotten; checked every 30 minutes.
void startUploadSweep(drogon::HttpAppFramework &app) {
    app.getLoop()->runEvery(1800.0, []() {
        static FileUploadService svc;
        svc.expired(drogon::app().getDbClient(), 24,
                    [](const std::vector<UploadRow> &rows) {
                        for (auto &u : rows)
                            dropUpload(svc, u, [] {});
                    });
    });
}

} // namespace pyracms
