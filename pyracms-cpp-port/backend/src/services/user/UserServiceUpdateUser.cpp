#include "services/UserService.h"
#include "services/DbError.h"

namespace pyracms {

void UserService::updateUser(const DbClientPtr &db, int id,
                             const Json::Value &updates, BoolCallback cb) {
    // Build dynamic update query
    std::vector<std::string> setClauses;
    std::vector<std::string> params;
    int paramIdx = 1;

    auto addField = [&](const char *jsonKey, const char *dbCol) {
        if (updates.isMember(jsonKey)) {
            setClauses.push_back(std::string(dbCol) + " = $" +
                                 std::to_string(paramIdx++));
            params.push_back(updates[jsonKey].asString());
        }
    };

    addField("fullName", "full_name");
    addField("email", "email");
    addField("website", "website");
    addField("aboutme", "aboutme");
    addField("timezone", "timezone");

    if (setClauses.empty()) {
        cb(false, "No fields to update");
        return;
    }

    std::string sql = "UPDATE users SET ";
    for (size_t i = 0; i < setClauses.size(); ++i) {
        if (i > 0)
            sql += ", ";
        sql += setClauses[i];
    }
    sql += " WHERE id = $" + std::to_string(paramIdx);

    // Use raw SQL with positional params
    // For simplicity, handle the common case of up to 5 update fields
    auto successCb = [cb](const drogon::orm::Result &) { cb(true, ""); };
    auto errorCb = [cb](const drogon::orm::DrogonDbException &e) {
        cb(false, dbError(e));
    };

    // Build parameter string for the ID
    params.push_back(std::to_string(id));

    // Execute with string parameters
    if (params.size() == 2) {
        db->execSqlAsync(sql, successCb, errorCb, params[0], params[1]);
    } else if (params.size() == 3) {
        db->execSqlAsync(sql, successCb, errorCb, params[0], params[1],
                         params[2]);
    } else if (params.size() == 4) {
        db->execSqlAsync(sql, successCb, errorCb, params[0], params[1],
                         params[2], params[3]);
    } else if (params.size() == 5) {
        db->execSqlAsync(sql, successCb, errorCb, params[0], params[1],
                         params[2], params[3], params[4]);
    } else if (params.size() == 6) {
        db->execSqlAsync(sql, successCb, errorCb, params[0], params[1],
                         params[2], params[3], params[4], params[5]);
    } else {
        cb(false, "Too many fields to update");
    }
}

} // namespace pyracms
