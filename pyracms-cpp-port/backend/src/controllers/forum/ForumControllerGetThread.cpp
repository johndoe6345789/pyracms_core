#include "controllers/BoolReply.h"
#include "controllers/ForumController.h"
#include "controllers/ForumThreadJson.h"
#include "filters/TenantGuard.h"
#include "filters/Viewer.h"
#include "services/ForumReactions.h"

namespace pyracms {

// --- Threads ---
void ForumController::getThread(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {

    int tenantId = 0;
    auto tenantParam = req->getParameter("tenant_id");
    if (!tenantParam.empty()) {
        try {
            tenantId = std::stoi(tenantParam);
        } catch (...) {
        }
    }
    int viewer = viewerOf(req).userId;
    auto db = drogon::app().getDbClient();
    forumService_.getThread(
        db, id, tenantId,
        [db, viewer,
         callback](const std::optional<ForumThreadWithPostsDto> &data) {
            if (!data) {
                callback(filterError("Thread not found",
                                     drogon::k404NotFound));
                return;
            }
            auto d = std::make_shared<ForumThreadWithPostsDto>(*data);
            loadThreadReactions(
                db, d->thread.id, viewer, [d, callback](ReactionMap r) {
                    callback(drogon::HttpResponse::newHttpJsonResponse(
                        threadJson(*d, r)));
                });
        });
}

} // namespace pyracms
