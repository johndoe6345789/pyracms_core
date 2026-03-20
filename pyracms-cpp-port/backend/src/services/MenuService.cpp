#include "services/MenuService.h"

namespace pyracms {

MenuGroupDto MenuService::rowToGroupDto(const drogon::orm::Row &row) {
    MenuGroupDto dto;
    dto.id = row["id"].as<int>();
    dto.name = row["name"].as<std::string>();
    return dto;
}

MenuItemDto MenuService::rowToItemDto(const drogon::orm::Row &row) {
    MenuItemDto dto;
    dto.id = row["id"].as<int>();
    dto.name = row["name"].as<std::string>();
    dto.routePath = row["route_path"].isNull() ? "" : row["route_path"].as<std::string>();
    dto.url = row["url"].isNull() ? "" : row["url"].as<std::string>();
    dto.type = row["type"].isNull() ? "" : row["type"].as<std::string>();
    dto.groupId = row["group_id"].as<int>();
    dto.position = row["position"].as<int>();
    dto.permissions = row["permissions"].isNull() ? "" : row["permissions"].as<std::string>();
    return dto;
}

void MenuService::listMenuGroups(const DbClientPtr &db, int tenantId,
                                 GroupListCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM menu_groups WHERE tenant_id = $1 ORDER BY name",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<MenuGroupDto> groups;
            groups.reserve(result.size());
            for (const auto &row : result) {
                groups.push_back(rowToGroupDto(row));
            }
            cb(groups);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        tenantId);
}

void MenuService::createMenuGroup(const DbClientPtr &db, int tenantId,
                                  const std::string &name,
                                  BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO menu_groups (tenant_id, name) VALUES ($1, $2) RETURNING id",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        tenantId, name);
}

void MenuService::deleteMenuGroup(const DbClientPtr &db, int id,
                                  BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM menu_groups WHERE id = $1",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Menu group not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        id);
}

void MenuService::listMenuItems(const DbClientPtr &db, int groupId,
                                ItemListCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM menu_items WHERE group_id = $1 ORDER BY position",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<MenuItemDto> items;
            items.reserve(result.size());
            for (const auto &row : result) {
                items.push_back(rowToItemDto(row));
            }
            cb(items);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        groupId);
}

void MenuService::createMenuItem(const DbClientPtr &db,
                                 const std::string &name,
                                 const std::string &routePath,
                                 const std::string &url,
                                 const std::string &type,
                                 int groupId,
                                 int position,
                                 const std::string &permissions,
                                 BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO menu_items (name, route_path, url, type, group_id, position, permissions) "
        "VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        name, routePath, url, type, groupId, position, permissions);
}

void MenuService::updateMenuItem(const DbClientPtr &db, int id,
                                 const Json::Value &updates,
                                 BoolCallback cb) {
    std::vector<std::string> setClauses;
    std::vector<std::string> params;
    int paramIdx = 1;

    auto addField = [&](const char *jsonKey, const char *dbCol) {
        if (updates.isMember(jsonKey)) {
            setClauses.push_back(
                std::string(dbCol) + " = $" + std::to_string(paramIdx++));
            params.push_back(updates[jsonKey].asString());
        }
    };

    addField("name", "name");
    addField("routePath", "route_path");
    addField("url", "url");
    addField("type", "type");
    addField("permissions", "permissions");

    if (updates.isMember("groupId")) {
        setClauses.push_back(
            std::string("group_id") + " = $" + std::to_string(paramIdx++));
        params.push_back(std::to_string(updates["groupId"].asInt()));
    }

    if (updates.isMember("position")) {
        setClauses.push_back(
            std::string("position") + " = $" + std::to_string(paramIdx++));
        params.push_back(std::to_string(updates["position"].asInt()));
    }

    if (setClauses.empty()) {
        cb(false, "No fields to update");
        return;
    }

    std::string sql = "UPDATE menu_items SET ";
    for (size_t i = 0; i < setClauses.size(); ++i) {
        if (i > 0) sql += ", ";
        sql += setClauses[i];
    }
    sql += " WHERE id = $" + std::to_string(paramIdx);

    auto successCb = [cb](const drogon::orm::Result &result) {
        if (result.affectedRows() == 0) {
            cb(false, "Menu item not found");
        } else {
            cb(true, "");
        }
    };
    auto errorCb = [cb](const drogon::orm::DrogonDbException &e) {
        cb(false, e.base().what());
    };

    params.push_back(std::to_string(id));

    if (params.size() == 2) {
        db->execSqlAsync(sql, successCb, errorCb, params[0], params[1]);
    } else if (params.size() == 3) {
        db->execSqlAsync(sql, successCb, errorCb, params[0], params[1], params[2]);
    } else if (params.size() == 4) {
        db->execSqlAsync(sql, successCb, errorCb, params[0], params[1], params[2], params[3]);
    } else if (params.size() == 5) {
        db->execSqlAsync(sql, successCb, errorCb, params[0], params[1], params[2], params[3], params[4]);
    } else if (params.size() == 6) {
        db->execSqlAsync(sql, successCb, errorCb, params[0], params[1], params[2], params[3], params[4], params[5]);
    } else if (params.size() == 7) {
        db->execSqlAsync(sql, successCb, errorCb, params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
    } else if (params.size() == 8) {
        db->execSqlAsync(sql, successCb, errorCb, params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7]);
    } else {
        cb(false, "Too many fields to update");
    }
}

void MenuService::deleteMenuItem(const DbClientPtr &db, int id,
                                 BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM menu_items WHERE id = $1",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Menu item not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        id);
}

} // namespace pyracms
