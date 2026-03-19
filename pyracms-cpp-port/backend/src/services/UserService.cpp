#include "services/UserService.h"

namespace pyracms {

UserDto UserService::rowToDto(const drogon::orm::Row &row) {
    UserDto dto;
    dto.id = row["id"].as<int>();
    dto.username = row["username"].as<std::string>();
    dto.fullName = row["full_name"].as<std::string>();
    dto.email = row["email"].as<std::string>();
    dto.website = row["website"].isNull() ? "" : row["website"].as<std::string>();
    dto.aboutme = row["aboutme"].isNull() ? "" : row["aboutme"].as<std::string>();
    dto.timezone = row["timezone"].as<std::string>();
    dto.banned = row["banned"].as<bool>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.apiUuid = row["api_uuid"].isNull() ? "" : row["api_uuid"].as<std::string>();
    return dto;
}

void UserService::createUser(const DbClientPtr &db,
                              const std::string &username,
                              const std::string &fullName,
                              const std::string &email,
                              const std::string &passwordHash,
                              BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO users (username, full_name, email, password_hash, "
        "timezone, banned, created_at, api_uuid) "
        "VALUES ($1, $2, $3, $4, 'UTC', false, NOW(), gen_random_uuid()::text) "
        "RETURNING id",
        [cb](const drogon::orm::Result &result) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        username, fullName, email, passwordHash);
}

void UserService::findByUsername(const DbClientPtr &db,
                                 const std::string &username,
                                 Callback cb) {
    db->execSqlAsync(
        "SELECT * FROM users WHERE username = $1",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(rowToDto(result[0]));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        username);
}

void UserService::findById(const DbClientPtr &db, int id, Callback cb) {
    db->execSqlAsync(
        "SELECT * FROM users WHERE id = $1",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(rowToDto(result[0]));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        id);
}

void UserService::findByEmail(const DbClientPtr &db,
                               const std::string &email,
                               Callback cb) {
    db->execSqlAsync(
        "SELECT * FROM users WHERE email = $1",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(rowToDto(result[0]));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        email);
}

void UserService::listUsers(const DbClientPtr &db, int limit, int offset,
                             ListCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM users ORDER BY created_at DESC LIMIT " + std::to_string(limit) + " OFFSET " + std::to_string(offset),
        [this, cb](const drogon::orm::Result &result) {
            std::vector<UserDto> users;
            users.reserve(result.size());
            for (const auto &row : result) {
                users.push_back(rowToDto(row));
            }
            cb(users);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        });
}

void UserService::updateUser(const DbClientPtr &db, int id,
                              const Json::Value &updates,
                              BoolCallback cb) {
    // Build dynamic update query
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
        if (i > 0) sql += ", ";
        sql += setClauses[i];
    }
    sql += " WHERE id = $" + std::to_string(paramIdx);

    // Use raw SQL with positional params
    // For simplicity, handle the common case of up to 5 update fields
    auto successCb = [cb](const drogon::orm::Result &) {
        cb(true, "");
    };
    auto errorCb = [cb](const drogon::orm::DrogonDbException &e) {
        cb(false, e.base().what());
    };

    // Build parameter string for the ID
    params.push_back(std::to_string(id));

    // Execute with string parameters
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
    } else {
        cb(false, "Too many fields to update");
    }
}

void UserService::deleteUser(const DbClientPtr &db, int id, BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM users WHERE id = $1",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        id);
}

void UserService::getPasswordHash(
    const DbClientPtr &db,
    const std::string &username,
    std::function<void(const std::optional<std::string> &)> cb) {
    db->execSqlAsync(
        "SELECT password_hash FROM users WHERE username = $1",
        [cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(result[0]["password_hash"].as<std::string>());
            }
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        username);
}

void UserService::updatePassword(const DbClientPtr &db, int id,
                                  const std::string &newHash,
                                  BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE users SET password_hash = $1 WHERE id = $2",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        newHash, id);
}

void UserService::countUsers(const DbClientPtr &db,
                              std::function<void(int)> cb) {
    db->execSqlAsync(
        "SELECT COUNT(*) as cnt FROM users",
        [cb](const drogon::orm::Result &result) {
            cb(result[0]["cnt"].as<int>());
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(0);
        });
}

} // namespace pyracms
