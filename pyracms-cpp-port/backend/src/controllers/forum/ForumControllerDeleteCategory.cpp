#include "controllers/AuditReply.h"
#include "controllers/ForumController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

void ForumController::deleteCategory(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {

    auto db = drogon::app().getDbClient();
    forumService_.deleteCategory(
        db, id, scopeTenantOf(req),
        auditedReply(req, callback, "category.delete", std::to_string(id)));
}

} // namespace pyracms
