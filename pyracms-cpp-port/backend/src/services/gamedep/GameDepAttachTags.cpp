#include "services/GameDepService.h"

namespace pyracms {

void GameDepAttachService::setTags(const GdCtx &c, const std::string &type,
                                   const std::string &name,
                                   const Json::Value &body, GdCb cb) {
    if (!body["tags"].isArray()) {
        cb(gdError(400, "tags array required"));
        return;
    }
    Json::Value list(Json::arrayValue);
    for (const auto &t : body["tags"]) {
        if (!t.asString().empty())
            list.append(t.asString());
    }
    Json::FastWriter w;
    std::string json = w.write(list);
    gdWithPage(
        c, type, name, true,
        [=](int pageId) {
            c.db->execSqlAsync(
                "DELETE FROM gamedep_tags WHERE page_id = $1",
                [=](const drogon::orm::Result &) {
                    c.db->execSqlAsync(
                        "INSERT INTO gamedep_tags (page_id, name) "
                        "SELECT $1, v FROM (SELECT v, MIN(o) AS o FROM "
                        "jsonb_array_elements_text($2::text::jsonb) "
                        "WITH ORDINALITY x(v, o) GROUP BY v) t "
                        "ORDER BY t.o",
                        [cb](const drogon::orm::Result &) { cb(gdOk()); },
                        [cb](const drogon::orm::DrogonDbException &e) {
                            cb(gdDbError(e.base().what()));
                        },
                        pageId, json);
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(gdDbError(e.base().what()));
                },
                pageId);
        },
        cb);
}

} // namespace pyracms
