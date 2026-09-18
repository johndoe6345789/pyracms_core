#include "services/GameDepService.h"

namespace pyracms {

void GameDepAttachService::vote(const GdCtx &c, const std::string &type,
                                const std::string &name,
                                const Json::Value &body, GdCb cb) {
    if (!body.isMember("isLike")) {
        cb(gdError(400, "isLike required"));
        return;
    }
    gdWithPage(
        c, type, name, false,
        [=](int pageId) {
            c.db->execSqlAsync(
                "INSERT INTO gamedep_votes (page_id, user_id, is_like) "
                "VALUES ($1, $2, $3) ON CONFLICT (page_id, user_id) "
                "DO UPDATE SET is_like = $3",
                [cb](const drogon::orm::Result &) { cb(gdOk()); },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(gdDbError(e.base().what()));
                },
                pageId, c.userId, body["isLike"].asBool());
        },
        cb);
}

} // namespace pyracms
