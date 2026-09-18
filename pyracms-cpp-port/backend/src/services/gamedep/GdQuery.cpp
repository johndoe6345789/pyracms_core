#include "services/gamedep/GdQuery.h"
#include "services/gamedep/GdSql.h"

namespace pyracms {

static const char *kWhere =
    "AND ($4::text = '' OR p.type = $4::text) "
    "AND ($5::text = '' OR p.name = $5::text) "
    "AND ($6::text = '' OR p.display_name ILIKE '%' || $6::text || '%' "
    "OR p.name ILIKE '%' || $6::text || '%') "
    "AND ($7::text = '' OR EXISTS (SELECT 1 FROM gamedep_tags t "
    "WHERE t.page_id = p.id AND t.name = $7::text)) ";

void gdQueryPages(const GdCtx &c, const GdPageFilter &f,
                  std::function<void(const GdPages &)> ok, GdCb fail) {
    std::string tail = "ORDER BY p.created_at DESC, p.id DESC LIMIT " +
                       std::to_string(f.limit) + " OFFSET " +
                       std::to_string(f.offset);
    c.db->execSqlAsync(
        gdPageSql(f.publishedOnly, kWhere, tail),
        [ok, fail](const drogon::orm::Result &r) {
            GdPages out;
            Json::Reader reader;
            for (const auto &row : r) {
                Json::Value page;
                if (!reader.parse(row["j"].as<std::string>(), page)) {
                    fail(gdError(500, "Bad catalog row"));
                    return;
                }
                gdAddPip(page);
                out.push_back(page);
            }
            ok(out);
        },
        [fail](const drogon::orm::DrogonDbException &e) {
            fail(gdDbError(e.base().what()));
        },
        c.scope, c.base, c.userId, f.type, f.name, f.q, f.tag);
}

} // namespace pyracms
