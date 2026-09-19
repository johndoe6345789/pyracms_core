#include "filters/TenantOfTarget.h"

#include <drogon/drogon.h>
#include <sstream>
#include <vector>

namespace pyracms {

static int idOf(const std::string &s) {
    if (s.empty() || s.size() > 9 ||
        s.find_first_not_of("0123456789") != std::string::npos)
        return 0;
    return std::stoi(s);
}

AdminTarget adminTargetOf(const std::string &path, int bodyCategoryId) {
    std::vector<std::string> seg;
    std::stringstream ss(path);
    std::string part;
    while (std::getline(ss, part, '/')) {
        if (!part.empty())
            seg.push_back(part);
    }
    auto at = [&](size_t i) { return i < seg.size() ? seg[i] : ""; };
    if (at(0) != "api")
        return {};
    if (at(1) == "forum" && at(2) == "categories" && seg.size() >= 4)
        return {AdminKind::ForumCategory, idOf(at(3))};
    if (at(1) == "forum" && at(2) == "forums")
        return seg.size() >= 4
                   ? AdminTarget{AdminKind::Forum, idOf(at(3))}
                   : AdminTarget{AdminKind::ForumCategory, bodyCategoryId};
    if (at(1) == "menu-groups" && seg.size() >= 3)
        return {AdminKind::MenuGroup, idOf(at(2))};
    if (at(1) == "menus" && seg.size() >= 3)
        return {AdminKind::MenuItem, idOf(at(2))};
    return {};
}

static const char *sqlFor(AdminKind kind) {
    switch (kind) {
    case AdminKind::ForumCategory:
        return "SELECT tenant_id FROM forum_categories WHERE id = $1::int";
    case AdminKind::Forum:
        return "SELECT c.tenant_id FROM forums f JOIN forum_categories c "
               "ON c.id = f.category_id WHERE f.id = $1::int";
    case AdminKind::MenuGroup:
        return "SELECT tenant_id FROM menu_groups WHERE id = $1::int";
    default:
        return "SELECT g.tenant_id FROM menu_items i JOIN menu_groups g "
               "ON g.id = i.group_id WHERE i.id = $1::int";
    }
}

TenantLookup &tenantOfTarget() {
    static TenantLookup lookup = [](const AdminTarget &t, TenantCb cb) {
        drogon::app().getDbClient()->execSqlAsync(
            sqlFor(t.kind),
            [cb](const drogon::orm::Result &r) {
                cb(true, r.empty() || r[0][0].isNull()
                             ? 0
                             : r[0][0].as<int>());
            },
            [cb](const drogon::orm::DrogonDbException &) { cb(false, 0); },
            t.id);
    };
    return lookup;
}

} // namespace pyracms
